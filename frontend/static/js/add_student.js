const statusEl = document.getElementById("status");
const studentForm = document.getElementById("student-form");

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
    document.getElementById("name").value = student.name || "";
    document.getElementById("attendance").value = student.attendance ?? "";
    document.getElementById("study_hours").value = student.study_hours ?? "";
    document.getElementById("assignment_completion").value = student.assignment_completion ?? "";
    document.getElementById("mark_math").value = student.marks?.Math ?? "";
    document.getElementById("mark_physics").value = student.marks?.Physics ?? "";
    document.getElementById("mark_programming").value = student.marks?.Programming ?? "";
    document.getElementById("difficulty_areas").value = (student.difficulty_areas || []).join(", ");
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

studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Saving student...");

    try {
        await apiFetch("/api/students", {
            method: "POST",
            body: JSON.stringify(formPayload()),
        });
        setStatus("Student saved successfully.", true);
        studentForm.reset();
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
