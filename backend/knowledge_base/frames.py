from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class SubjectPerformanceFrame:
    subject_name: str
    marks: float
    status: str = "unknown"


@dataclass
class StudentFrame:
    name: str
    attendance: float
    study_hours: float
    assignment_completion: float
    difficulty_areas: List[str] = field(default_factory=list)
    subjects: List[SubjectPerformanceFrame] = field(default_factory=list)

    @classmethod
    def from_payload(cls, payload: Dict) -> "StudentFrame":
        marks = payload.get("marks", {})
        subjects = [
            SubjectPerformanceFrame(subject_name=k, marks=float(v))
            for k, v in marks.items()
        ]

        raw_difficulty = payload.get("difficulty_areas", [])
        if isinstance(raw_difficulty, str):
            difficulty_areas = [item.strip() for item in raw_difficulty.split(",") if item.strip()]
        else:
            difficulty_areas = [str(item).strip() for item in raw_difficulty if str(item).strip()]

        return cls(
            name=payload.get("name", "Unknown"),
            attendance=float(payload.get("attendance", 0)),
            study_hours=float(payload.get("study_hours", 0)),
            assignment_completion=float(payload.get("assignment_completion", 0)),
            difficulty_areas=difficulty_areas,
            subjects=subjects,
        )

    def marks_map(self) -> Dict[str, float]:
        return {subject.subject_name: float(subject.marks) for subject in self.subjects}
