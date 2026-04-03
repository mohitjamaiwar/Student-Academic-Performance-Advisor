from typing import Any, Dict, List

from flask import Blueprint, jsonify, request

from db import get_student, insert_student, list_students
from knowledge_base.frames import StudentFrame
from knowledge_base.semantic_network import build_default_network
from reasoning.advice_generator import generate_advice

api_bp = Blueprint("api", __name__)
semantic_network = build_default_network()


REQUIRED_FIELDS = [
    "attendance",
    "study_hours",
    "assignment_completion",
    "marks",
]



def _validate_payload(payload: Dict[str, Any], require_name: bool = False) -> List[str]:
    errors = []

    if require_name and not str(payload.get("name", "")).strip():
        errors.append("name is required")

    for field in REQUIRED_FIELDS:
        if field not in payload:
            errors.append(f"{field} is required")

    marks = payload.get("marks", {})
    if not isinstance(marks, dict) or not marks:
        errors.append("marks must be a non-empty object")

    for metric in ["attendance", "study_hours", "assignment_completion"]:
        try:
            float(payload.get(metric, 0))
        except (TypeError, ValueError):
            errors.append(f"{metric} must be numeric")

    if isinstance(marks, dict):
        for subject, value in marks.items():
            try:
                float(value)
            except (TypeError, ValueError):
                errors.append(f"marks for {subject} must be numeric")

    return errors


@api_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@api_bp.route("/students", methods=["POST"])
def create_student():
    payload = request.get_json(silent=True) or {}
    errors = _validate_payload(payload, require_name=True)
    if errors:
        return jsonify({"errors": errors}), 400

    student_id = insert_student(payload)
    student = get_student(student_id)
    return jsonify(student), 201


@api_bp.route("/students", methods=["GET"])
def get_students():
    return jsonify(list_students())


@api_bp.route("/students/<int:student_id>", methods=["GET"])
def get_student_by_id(student_id: int):
    student = get_student(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    return jsonify(student)


@api_bp.route("/students/lookup", methods=["GET"])
def lookup_student():
    roll_number = request.args.get("roll_number", "").strip()
    name = request.args.get("name", "").strip().lower()

    if not roll_number and not name:
        return jsonify({"error": "Provide roll_number or name"}), 400

    students = list_students()

    matched = []
    for student in students:
        id_match = not roll_number or str(student["id"]) == roll_number
        name_match = not name or student["name"].strip().lower() == name
        if id_match and name_match:
            matched.append(student)

    if not matched:
        return jsonify({"error": "Student not found"}), 404

    student = get_student(matched[0]["id"])
    if not student:
        return jsonify({"error": "Student not found"}), 404

    return jsonify(student)


@api_bp.route("/class-analysis", methods=["GET"])
def class_analysis():
    students_summary = sorted(list_students(), key=lambda student: student["id"])
    if not students_summary:
        return jsonify(
            {
                "kpis": {
                    "total_students": 0,
                    "class_avg_mark": 0,
                    "avg_attendance": 0,
                    "avg_study_hours": 0,
                    "avg_assignment_completion": 0,
                },
                "charts": {
                    "subject_average": {"labels": [], "values": []},
                    "grade_distribution": {"labels": ["A", "B", "C", "D"], "values": [0, 0, 0, 0]},
                    "radar_overview": {"labels": [], "values": []},
                    "student_trend": {"labels": [], "values": []},
                    "metric_average": {"labels": [], "values": []},
                },
                "heatmap": {"subjects": [], "students": []},
            }
        )

    students_detail = [get_student(student["id"]) for student in students_summary]
    students_detail = [student for student in students_detail if student is not None]

    subjects: List[str] = []
    for student in students_detail:
        for subject in student["marks"].keys():
            if subject not in subjects:
                subjects.append(subject)

    subject_totals = {subject: 0.0 for subject in subjects}
    subject_counts = {subject: 0 for subject in subjects}

    total_attendance = 0.0
    total_study_hours = 0.0
    total_assignment_completion = 0.0
    class_avg_marks: List[float] = []
    trend_labels: List[str] = []

    grade_counts = {"A": 0, "B": 0, "C": 0, "D": 0}

    heatmap_rows = []

    for student in students_detail:
        marks_map = student.get("marks", {})
        marks_values = [float(value) for value in marks_map.values()]
        student_avg_mark = sum(marks_values) / len(marks_values) if marks_values else 0.0

        if student_avg_mark >= 85:
            grade_counts["A"] += 1
        elif student_avg_mark >= 70:
            grade_counts["B"] += 1
        elif student_avg_mark >= 55:
            grade_counts["C"] += 1
        else:
            grade_counts["D"] += 1

        total_attendance += float(student.get("attendance", 0))
        total_study_hours += float(student.get("study_hours", 0))
        total_assignment_completion += float(student.get("assignment_completion", 0))

        class_avg_marks.append(student_avg_mark)
        trend_labels.append(f"R{student['id']}")

        row_marks = []
        for subject in subjects:
            mark_value = float(marks_map.get(subject, 0))
            row_marks.append(mark_value)
            if subject in marks_map:
                subject_totals[subject] += mark_value
                subject_counts[subject] += 1

        heatmap_rows.append(
            {
                "roll_no": student["id"],
                "name": student.get("name", "Unknown"),
                "marks": row_marks,
            }
        )

    total_students = len(students_detail)
    subject_avg_values = [
        round(subject_totals[subject] / subject_counts[subject], 2) if subject_counts[subject] else 0.0
        for subject in subjects
    ]

    avg_attendance = round(total_attendance / total_students, 2)
    avg_study_hours = round(total_study_hours / total_students, 2)
    avg_assignment_completion = round(total_assignment_completion / total_students, 2)
    class_avg_mark = round(sum(class_avg_marks) / total_students, 2)

    return jsonify(
        {
            "kpis": {
                "total_students": total_students,
                "class_avg_mark": class_avg_mark,
                "avg_attendance": avg_attendance,
                "avg_study_hours": avg_study_hours,
                "avg_assignment_completion": avg_assignment_completion,
            },
            "charts": {
                "subject_average": {
                    "labels": subjects,
                    "values": subject_avg_values,
                },
                "grade_distribution": {
                    "labels": ["A", "B", "C", "D"],
                    "values": [
                        grade_counts["A"],
                        grade_counts["B"],
                        grade_counts["C"],
                        grade_counts["D"],
                    ],
                },
                "radar_overview": {
                    "labels": [
                        "Class Avg Mark",
                        "Avg Attendance",
                        "Avg Study Hours x20",
                        "Avg Assignment Completion",
                    ],
                    "values": [
                        class_avg_mark,
                        avg_attendance,
                        min(avg_study_hours * 20, 100),
                        avg_assignment_completion,
                    ],
                },
                "student_trend": {
                    "labels": trend_labels,
                    "values": [round(value, 2) for value in class_avg_marks],
                },
                "metric_average": {
                    "labels": ["Attendance", "Study Hours x20", "Assignment Completion"],
                    "values": [avg_attendance, min(avg_study_hours * 20, 100), avg_assignment_completion],
                },
            },
            "heatmap": {
                "subjects": subjects,
                "students": heatmap_rows,
            },
        }
    )


@api_bp.route("/analyze", methods=["POST"])
def analyze():
    payload = request.get_json(silent=True) or {}
    errors = _validate_payload(payload, require_name=False)
    if errors:
        return jsonify({"errors": errors}), 400

    student_frame = StudentFrame.from_payload(payload)
    analysis = generate_advice(student_frame, semantic_network)
    return jsonify(analysis)


@app.route('/test-db-connection', methods=['GET'])
def test_db_connection():
    try:
        # Example query to test database connection
        result = db.session.execute('SELECT 1').fetchone()
        if result:
            return jsonify({"success": True, "message": "Database connection successful!"}), 200
        else:
            return jsonify({"success": False, "message": "Database connection failed!"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
