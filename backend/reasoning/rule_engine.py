from typing import Dict, List

from config import Config
from knowledge_base.frames import StudentFrame


def _dedupe(items: List[str]) -> List[str]:
    seen = set()
    output = []
    for item in items:
        if item not in seen:
            output.append(item)
            seen.add(item)
    return output


def evaluate_rules(student: StudentFrame) -> Dict:
    weak_subjects = []
    study_recommendations = []
    time_management = []
    learning_resources = []

    for subject, marks in student.marks_map().items():
        if marks < Config.LOW_MARKS_THRESHOLD:
            weak_subjects.append(subject)
            study_recommendations.append(
                f"Weak performance in {subject}. Practice more problems and revise basics."
            )

            if subject.lower() == "math":
                learning_resources.append("Math: Solve daily problem sets from previous-year papers.")
            elif subject.lower() == "programming":
                learning_resources.append("Programming: Practice 2 coding problems daily on coding platforms.")
            else:
                learning_resources.append(f"{subject}: Review class notes and solve guided exercises.")

    if student.attendance < Config.LOW_ATTENDANCE_THRESHOLD:
        time_management.append("Attendance is low. Attend more classes consistently.")

    if student.study_hours < Config.LOW_STUDY_HOURS_THRESHOLD:
        time_management.append("Increase study hours to 3-4 hours per day with a fixed schedule.")

    if student.assignment_completion < Config.LOW_ASSIGNMENT_THRESHOLD:
        study_recommendations.append("Complete pending assignments weekly to strengthen understanding.")

    if student.difficulty_areas:
        area_text = ", ".join(student.difficulty_areas)
        study_recommendations.append(
            f"Focus extra revision on declared difficulty areas: {area_text}."
        )

    return {
        "weak_subjects": _dedupe(weak_subjects),
        "advice": {
            "study_recommendations": _dedupe(study_recommendations),
            "time_management": _dedupe(time_management),
            "learning_resources": _dedupe(learning_resources),
        },
    }
