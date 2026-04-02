const statusEl = document.getElementById("status");
const studentForm = document.getElementById("student-form");
const studentSelector = document.getElementById("student-selector");
const rollNumberInput = document.getElementById("roll_number");

function setStatus(message, isOk = false) {
    statusEl.textContent = message;
    statusEl.className = isOk ? "status good" : "status";
}

function formPayload() {
    return {
        name: document.getElementById("name").value.trim(),
        attendance: Number(document.getElementById("attendance").value),
        study_hours: Number(document.getElementById("study_hours").value),
        assignment_completion: Number(document.getElementById("assignment_completion").value),
        marks: {
            Math: Number(document.getElementById("mark_math").value),
            Physics: Number(document.getElementById("mark_physics").value),
            Programming: Number(document.getElementById("mark_programming").value),
        },
        difficulty_areas: document.getElementById("difficulty_areas").value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
    };
}

function fillForm(student) {
    if (rollNumberInput) {
        rollNumberInput.value = student.id ?? "";
    }
    document.getElementById("name").value = student.name || "";
    document.getElementById("attendance").value = student.attendance ?? "";
    document.getElementById("study_hours").value = student.study_hours ?? "";
    document.getElementById("assignment_completion").value = student.assignment_completion ?? "";
    document.getElementById("mark_math").value = student.marks?.Math ?? "";
    document.getElementById("mark_physics").value = student.marks?.Physics ?? "";
    document.getElementById("mark_programming").value = student.marks?.Programming ?? "";
    document.getElementById("difficulty_areas").value = (student.difficulty_areas || []).join(", ");

    if (studentSelector) {
        studentSelector.value = String(student.id || "");
    }
}

function renderList(title, items, containerId) {
    const container = document.getElementById(containerId);
    const listHtml = items.length
        ? `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`
        : "<p>No items.</p>";

    container.innerHTML = `<h3>${title}</h3>${listHtml}`;
}

function renderResults(result) {
    const weakSubjectText = result.weak_subjects.length
        ? result.weak_subjects.join(", ")
        : "No weak subjects detected.";

    renderList("Weak Subjects", [weakSubjectText], "weak-subjects");
    renderList("Study Recommendations", result.advice.study_recommendations, "study-recommendations");
    renderList("Time Management Advice", result.advice.time_management, "time-management");
    renderList("Learning Resources", result.advice.learning_resources, "learning-resources");

    renderKpis(result);
    renderCharts(result.chart_data);
}

function renderKpis(result) {
    const marks = result.chart_data?.subjects?.marks || [];
    const metrics = result.chart_data?.metrics || {};
    const averageMark = marks.length
        ? marks.reduce((sum, value) => sum + value, 0) / marks.length
        : 0;

    document.getElementById("kpi-average-mark").textContent = `${averageMark.toFixed(1)}%`;
    document.getElementById("kpi-weak-count").textContent = String(result.weak_subjects.length);
    document.getElementById("kpi-attendance").textContent = `${Number(metrics.attendance || 0).toFixed(1)}%`;
    document.getElementById("kpi-study-hours").textContent = `${Number(metrics.study_hours || 0).toFixed(1)} hrs`;
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

function renderStudentOptions(students) {
    if (!studentSelector) {
        return;
    }

    const options = [
        '<option value="">Select saved student</option>',
        ...students.map(
            (student) =>
                `<option value="${student.id}">${student.name} (Roll: ${student.id})</option>`
        ),
    ];

    studentSelector.innerHTML = options.join("");
}

async function loadStudentDirectory() {
    try {
        const students = await apiFetch("/api/students");
        renderStudentOptions(students);
    } catch (error) {
        setStatus(error.message);
    }
}

async function lookupAndFill(rollNumber, name) {
    const params = new URLSearchParams();
    if (rollNumber) {
        params.set("roll_number", String(rollNumber));
    }
    if (name) {
        params.set("name", name);
    }

    if (!params.toString()) {
        return;
    }

    try {
        const student = await apiFetch(`/api/students/lookup?${params.toString()}`);
        fillForm(student);
        setStatus("Student details loaded automatically.", true);
    } catch (error) {
        setStatus(error.message);
    }
}

studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Analyzing...");

    try {
        const analysis = await apiFetch("/api/analyze", {
            method: "POST",
            body: JSON.stringify(formPayload()),
        });
        renderResults(analysis);
        setStatus("Analysis completed.", true);
    } catch (error) {
        setStatus(error.message);
    }
});

document.getElementById("load-sample").addEventListener("click", () => {
    fillForm({
        name: "Sample Student",
        attendance: 65,
        study_hours: 2,
        assignment_completion: 60,
        marks: {
            Math: 45,
            Physics: 70,
            Programming: 38,
        },
        difficulty_areas: ["Math basics", "Coding logic"],
    });
    setStatus("Sample values loaded.", true);
});

if (studentSelector) {
    studentSelector.addEventListener("change", async () => {
        const selectedId = studentSelector.value;
        if (!selectedId) {
            return;
        }

        try {
            const student = await apiFetch(`/api/students/${selectedId}`);
            fillForm(student);
            setStatus("Student details loaded automatically.", true);
        } catch (error) {
            setStatus(error.message);
        }
    });
}

if (rollNumberInput) {
    rollNumberInput.addEventListener("change", () => {
        const rollNumber = rollNumberInput.value.trim();
        const name = document.getElementById("name").value.trim();
        lookupAndFill(rollNumber, name);
    });
}

document.getElementById("name").addEventListener("change", () => {
    const rollNumber = rollNumberInput ? rollNumberInput.value.trim() : "";
    const name = document.getElementById("name").value.trim();
    lookupAndFill(rollNumber, name);
});

loadStudentDirectory();
