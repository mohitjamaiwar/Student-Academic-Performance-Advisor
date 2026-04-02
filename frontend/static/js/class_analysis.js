let classSubjectBarChart = null;
let classGradePieChart = null;
let classRadarChart = null;
let classLineChart = null;
let classMetricBarChart = null;

const CHART_TEXT = "#014651";
const CHART_MUTED = "#2a5a6a";
const CHART_GRID = "#c8dde0";

const statusEl = document.getElementById("status");

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

function updateKpis(data) {
    document.getElementById("kpi-total-students").textContent = String(data.kpis.total_students);
    document.getElementById("kpi-class-avg-mark").textContent = `${data.kpis.class_avg_mark.toFixed(1)}%`;
    document.getElementById("kpi-class-attendance").textContent = `${data.kpis.avg_attendance.toFixed(1)}%`;
    document.getElementById("kpi-class-study-hours").textContent = `${data.kpis.avg_study_hours.toFixed(1)} hrs`;
}

function renderCharts(data) {
    renderSubjectBarChart(data.charts.subject_average);
    renderGradePieChart(data.charts.grade_distribution);
    renderClassRadarChart(data.charts.radar_overview);
    renderClassLineChart(data.charts.student_trend);
    renderClassMetricBarChart(data.charts.metric_average);
}

function renderSubjectBarChart(chartData) {
    const ctx = document.getElementById("class-subject-bar-chart");
    if (classSubjectBarChart) {
        classSubjectBarChart.destroy();
    }

    classSubjectBarChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: chartData.labels,
            datasets: [{
                label: "Average Marks",
                data: chartData.values,
                backgroundColor: ["#03D26F", "#CEF431", "#f59e0b", "#ef4444", "#8b5cf6"],
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: CHART_TEXT } },
            },
            scales: {
                y: { min: 0, max: 100, ticks: { color: CHART_MUTED }, grid: { color: CHART_GRID } },
                x: { ticks: { color: CHART_MUTED }, grid: { color: CHART_GRID } },
            },
        },
    });
}

function renderGradePieChart(chartData) {
    const ctx = document.getElementById("class-grade-pie-chart");
    if (classGradePieChart) {
        classGradePieChart.destroy();
    }

    classGradePieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.values,
                backgroundColor: ["#03D26F", "#CEF431", "#f59e0b", "#ef4444"],
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: CHART_TEXT } },
                tooltip: { titleColor: CHART_TEXT, bodyColor: CHART_TEXT },
            },
        },
    });
}

function renderClassRadarChart(chartData) {
    const ctx = document.getElementById("class-radar-chart");
    if (classRadarChart) {
        classRadarChart.destroy();
    }

    classRadarChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: chartData.labels,
            datasets: [{
                label: "Class Profile",
                data: chartData.values,
                backgroundColor: "rgba(3, 210, 111, 0.2)",
                borderColor: "#03D26F",
                pointBackgroundColor: "#03D26F",
                pointBorderColor: "#ffffff",
                pointHoverBackgroundColor: "#CEF431",
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: CHART_TEXT } },
            },
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: { color: CHART_MUTED },
                    grid: { color: CHART_GRID },
                    pointLabels: { color: CHART_MUTED },
                },
            },
        },
    });
}

function renderClassLineChart(chartData) {
    const ctx = document.getElementById("class-line-chart");
    if (classLineChart) {
        classLineChart.destroy();
    }

    classLineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: chartData.labels,
            datasets: [{
                label: "Avg Marks by Roll Number",
                data: chartData.values,
                borderColor: "#03D26F",
                backgroundColor: "rgba(3, 210, 111, 0.1)",
                pointBackgroundColor: "#CEF431",
                pointBorderColor: "#03D26F",
                tension: 0.25,
                fill: true,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: CHART_TEXT } },
            },
            scales: {
                y: { min: 0, max: 100, ticks: { color: CHART_MUTED }, grid: { color: CHART_GRID } },
                x: { ticks: { color: CHART_MUTED }, grid: { color: CHART_GRID } },
            },
        },
    });
}

function renderClassMetricBarChart(chartData) {
    const ctx = document.getElementById("class-metric-bar-chart");
    if (classMetricBarChart) {
        classMetricBarChart.destroy();
    }

    classMetricBarChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: chartData.labels,
            datasets: [{
                label: "Class Metrics",
                data: chartData.values,
                backgroundColor: ["#03D26F", "#CEF431", "#f97316"],
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: CHART_TEXT } },
            },
            scales: {
                y: { min: 0, max: 100, ticks: { color: CHART_MUTED }, grid: { color: CHART_GRID } },
                x: { ticks: { color: CHART_MUTED }, grid: { color: CHART_GRID } },
            },
        },
    });
}

function markToHeatColor(value) {
    const v = Number(value);
    if (v >= 85) {
        return "#d1fae5";
    }
    if (v >= 70) {
        return "#dcfce7";
    }
    if (v >= 55) {
        return "#fef3c7";
    }
    return "#fee2e2";
}

function renderHeatmap(heatmapData) {
    const headEl = document.getElementById("heatmap-head");
    const bodyEl = document.getElementById("heatmap-body");

    const headCells = ["Roll No.", "Name", ...heatmapData.subjects]
        .map((label) => `<th>${label}</th>`)
        .join("");
    headEl.innerHTML = `<tr>${headCells}</tr>`;

    if (!heatmapData.students.length) {
        bodyEl.innerHTML = `<tr><td colspan="${heatmapData.subjects.length + 2}">No student data available.</td></tr>`;
        return;
    }

    bodyEl.innerHTML = heatmapData.students
        .map((student) => {
            const markCells = student.marks
                .map((mark) => `<td style="background:${markToHeatColor(mark)}; color: #014651; font-weight: 600;">${mark.toFixed(1)}</td>`)
                .join("");
            return `<tr><td>${student.roll_no}</td><td>${student.name}</td>${markCells}</tr>`;
        })
        .join("");
}

async function loadClassAnalysis() {
    setStatus("Loading class analysis...");
    try {
        const data = await apiFetch("/api/class-analysis");
        updateKpis(data);
        renderCharts(data);
        renderHeatmap(data.heatmap);
        setStatus("Class analysis loaded successfully.", true);
    } catch (error) {
        setStatus(error.message);
    }
}

document.getElementById("refresh-class-analysis").addEventListener("click", loadClassAnalysis);

loadClassAnalysis();
