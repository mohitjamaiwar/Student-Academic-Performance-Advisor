import json
import os
from typing import Any, Dict, List, Optional

import psycopg2
from psycopg2 import Error
from psycopg2.extras import RealDictCursor

from config import Config


def _schema_path() -> str:
    base_dir = os.path.dirname(os.path.dirname(__file__))
    return os.path.join(base_dir, "database", "schema.sql")


def _split_sql_statements(sql_text: str) -> List[str]:
    return [stmt.strip() for stmt in sql_text.split(";") if stmt.strip()]


def get_connection():
    if Config.DATABASE_URL:
        return psycopg2.connect(Config.DATABASE_URL)

    return psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        dbname=Config.DB_NAME,
    )


def initialize_database() -> None:
    schema_file = _schema_path()
    with open(schema_file, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn = get_connection()
    cursor = conn.cursor()
    try:
        for statement in _split_sql_statements(schema_sql):
            cursor.execute(statement)
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def _to_json(value: Any) -> str:
    return json.dumps(value or [])


def _from_json(value: Optional[str]) -> Any:
    if not value:
        return []
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return []


def insert_student(student_data: Dict[str, Any]) -> int:
    conn = get_connection()
    cursor = conn.cursor()

    marks = student_data.get("marks", {})
    difficulty_areas = student_data.get("difficulty_areas", [])

    try:
        student_sql = (
            "INSERT INTO students "
            "(name, attendance, study_hours, assignment_completion, difficulty_areas) "
            "VALUES (%s, %s, %s, %s, %s) RETURNING id"
        )
        student_values = (
            student_data.get("name", "Unknown"),
            float(student_data.get("attendance", 0)),
            float(student_data.get("study_hours", 0)),
            float(student_data.get("assignment_completion", 0)),
            _to_json(difficulty_areas),
        )
        cursor.execute(student_sql, student_values)
        student_id = cursor.fetchone()[0]

        mark_sql = (
            "INSERT INTO subject_marks (student_id, subject_name, marks) "
            "VALUES (%s, %s, %s)"
        )
        for subject_name, marks_value in marks.items():
            cursor.execute(mark_sql, (student_id, subject_name, float(marks_value)))

        conn.commit()
        return student_id
    except Error:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def list_students() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            "SELECT id, name, attendance, study_hours, assignment_completion, created_at "
            "FROM students ORDER BY id DESC"
        )
        students = cursor.fetchall()
        return students
    finally:
        cursor.close()
        conn.close()


def get_student(student_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    student_cursor = conn.cursor(cursor_factory=RealDictCursor)
    marks_cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        student_cursor.execute(
            "SELECT id, name, attendance, study_hours, assignment_completion, difficulty_areas, created_at "
            "FROM students WHERE id = %s",
            (student_id,),
        )
        student = student_cursor.fetchone()
        if not student:
            return None

        marks_cursor.execute(
            "SELECT subject_name, marks FROM subject_marks WHERE student_id = %s",
            (student_id,),
        )
        marks_rows = marks_cursor.fetchall()
        marks = {row["subject_name"]: float(row["marks"]) for row in marks_rows}

        student["difficulty_areas"] = _from_json(student.get("difficulty_areas"))
        student["marks"] = marks
        return student
    finally:
        student_cursor.close()
        marks_cursor.close()
        conn.close()
