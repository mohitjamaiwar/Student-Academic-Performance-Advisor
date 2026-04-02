const statusEl = document.getElementById("status");
const studentTableBody = document.getElementById("student-table-body");
const detailEl = document.getElementById("student-detail");

function setStatus(message, isOk = false) {
    statusEl.textContent = message;
    statusEl.className = isOk ? "status good" : "status";
}

async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    const data = await response.json();
    if (!response.ok) {
        const message = data.errors ? data.errors.join("; ") : data.error || "Request failed";
        throw new Error(message);
    }
    return data;
}

function renderStudentDetail(student) {
    const marksHtml = Object.entries(student.marks || {})
        .map(([subject, mark]) => `<li>${subject}: ${mark}</li>`)
        .join("");

    const difficulties = (student.difficulty_areas || []).length
        ? student.difficulty_areas.join(", ")
        : "None";

    detailEl.innerHTML = `
        <h3>${student.name}</h3>
        <ul>
            <li>Attendance: ${student.attendance}%</li>
            <li>Study Hours: ${student.study_hours} per day</li>
            <li>Assignment Completion: ${student.assignment_completion}%</li>
            <li>Difficulty Areas: ${difficulties}</li>
        </ul>
        <h3>Marks</h3>
        <ul>${marksHtml || "<li>No marks available.</li>"}</ul>
    `;
}

async function loadStudents() {
    setStatus("Loading students...");
    try {
        const students = await apiFetch("/api/students");
        const studentsAsc = [...students].sort((a, b) => a.id - b.id);
        if (!studentsAsc.length) {
            studentTableBody.innerHTML = "<tr><td colspan=\"6\">No saved students yet.</td></tr>";
            setStatus("No students found.");
            return;
        }

        studentTableBody.innerHTML = studentsAsc
            .map(
                (student) =>
                    `<tr>
                        <td>${student.id}</td>
                        <td>${student.name}</td>
                        <td>${student.attendance}%</td>
                        <td>${student.study_hours}</td>
                        <td>${student.assignment_completion}%</td>
                        <td><button data-id="${student.id}">View</button></td>
                    </tr>`
            )
            .join("");
        setStatus(`Loaded ${studentsAsc.length} students in ascending roll order.`, true);
    } catch (error) {
        setStatus(error.message);
    }
}

studentTableBody.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
        return;
    }

    const studentId = target.getAttribute("data-id");
    if (!studentId) {
        return;
    }

    setStatus("Loading student details...");
    try {
        const student = await apiFetch(`/api/students/${studentId}`);
        renderStudentDetail(student);
        setStatus("Student details loaded.", true);
    } catch (error) {
        setStatus(error.message);
    }
});

document.getElementById("refresh-students").addEventListener("click", loadStudents);

loadStudents();
