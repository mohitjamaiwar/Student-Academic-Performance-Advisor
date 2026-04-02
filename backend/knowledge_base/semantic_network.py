from typing import Dict, List, Tuple


class SemanticNetwork:
    def __init__(self) -> None:
        self.edges: List[Tuple[str, str, str]] = []

    def add_relation(self, source: str, relation: str, target: str) -> None:
        self.edges.append((source, relation, target))

    def related_targets(self, source: str, relation: str) -> List[str]:
        return [target for s, r, target in self.edges if s == source and r == relation]

    def context_for_student(self, marks: Dict[str, float]) -> Dict[str, List[str]]:
        weak_subjects = [subject for subject, value in marks.items() if value < 50]
        solutions = self.related_targets("weakUnderstanding", "solution")
        return {
            "weak_subjects": weak_subjects,
            "solutions": solutions,
        }


def build_default_network() -> SemanticNetwork:
    network = SemanticNetwork()
    network.add_relation("student", "hasMarks", "subject")
    network.add_relation("subject", "requires", "studyHours")
    network.add_relation("lowMarks", "causes", "weakUnderstanding")
    network.add_relation("weakUnderstanding", "solution", "extraPractice")
    return network
