from typing import Dict

from knowledge_base.frames import StudentFrame
from knowledge_base.semantic_network import SemanticNetwork
from reasoning.rule_engine import evaluate_rules


def generate_advice(student: StudentFrame, network: SemanticNetwork) -> Dict:
    rule_output = evaluate_rules(student)
    semantic_context = network.context_for_student(student.marks_map())

    chart_data = {
        "subjects": {
            "labels": list(student.marks_map().keys()),
            "marks": list(student.marks_map().values()),
        },
        "metrics": {
            "attendance": student.attendance,
            "study_hours": student.study_hours,
            "assignment_completion": student.assignment_completion,
        },
    }

    return {
        "student_name": student.name,
        "weak_subjects": rule_output["weak_subjects"],
        "semantic_context": semantic_context,
        "advice": rule_output["advice"],
        "chart_data": chart_data,
    }
