let subjectChart = null;
let metricsChart = null;
let radarChart = null;
let pieChart = null;
let lineChart = null;
let scatterChart = null;

const CHART_TEXT = "#014651";
const CHART_MUTED = "#2a5a6a";
const CHART_GRID = "#c8dde0";

function renderCharts(chartData) {
    renderSubjectChart(chartData.subjects.labels, chartData.subjects.marks);
    renderMetricsChart(chartData.metrics);
    renderRadarChart(chartData);
    renderPieChart(chartData.subjects.labels, chartData.subjects.marks);
    renderLineChart(chartData.subjects.labels, chartData.subjects.marks);
    renderScatterChart(chartData);
}

function renderSubjectChart(labels, values) {
    const ctx = document.getElementById("subject-chart");
    if (subjectChart) {
        subjectChart.destroy();
    }

    subjectChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Marks",
                data: values,
                backgroundColor: ["#03D26F", "#CEF431", "#2b8a3e", "#f08c00"],
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

function renderMetricsChart(metrics) {
    const ctx = document.getElementById("metrics-chart");
    if (metricsChart) {
        metricsChart.destroy();
    }

    metricsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Attendance", "Study Hours", "Assignment Completion"],
            datasets: [{
                label: "Academic Metrics",
                data: [metrics.attendance, metrics.study_hours, metrics.assignment_completion],
                backgroundColor: ["#03D26F", "#CEF431", "#0ca678"],
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

function renderRadarChart(chartData) {
    const ctx = document.getElementById("radar-chart");
    if (radarChart) {
        radarChart.destroy();
    }

    const firstThreeSubjects = chartData.subjects.marks.slice(0, 3);
    radarChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: ["Subject Avg", "Attendance", "Study Hours x 20", "Assignment Completion"],
            datasets: [{
                label: "Overall Profile",
                data: [
                    avg(firstThreeSubjects),
                    chartData.metrics.attendance,
                    chartData.metrics.study_hours * 20,
                    chartData.metrics.assignment_completion,
                ],
                fill: true,
                backgroundColor: "rgba(3, 210, 111, 0.2)",
                borderColor: "#03D26F",
                pointBackgroundColor: "#03D26F",
                pointBorderColor: "#fff",
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

function renderPieChart(labels, values) {
    const ctx = document.getElementById("pie-chart");
    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                label: "Marks Share",
                data: values,
                backgroundColor: ["#03D26F", "#CEF431", "#2a9d8f", "#f4a261", "#ef476f"],
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: CHART_TEXT } },
                tooltip: { titleColor: CHART_TEXT, bodyColor: CHART_TEXT },
                title: {
                    display: true,
                    text: "Subject Contribution",
                    color: CHART_TEXT,
                },
            },
        },
    });
}

function renderLineChart(labels, values) {
    const ctx = document.getElementById("line-chart");
    if (lineChart) {
        lineChart.destroy();
    }

    lineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Marks Trend",
                data: values,
                borderColor: "#03D26F",
                backgroundColor: "rgba(3, 210, 111, 0.1)",
                pointBackgroundColor: "#CEF431",
                pointBorderColor: "#03D26F",
                tension: 0.35,
                fill: true,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: CHART_TEXT } },
                title: {
                    display: true,
                    text: "Marks Progression by Subject Order",
                    color: CHART_TEXT,
                },
            },
            scales: {
                y: { min: 0, max: 100, ticks: { color: CHART_MUTED }, grid: { color: CHART_GRID } },
                x: { ticks: { color: CHART_MUTED }, grid: { color: CHART_GRID } },
            },
        },
    });
}

function renderScatterChart(chartData) {
    const ctx = document.getElementById("scatter-chart");
    if (scatterChart) {
        scatterChart.destroy();
    }

    const avgMark = avg(chartData.subjects.marks);
    const points = [
        { x: chartData.metrics.attendance, y: avgMark, metric: "Attendance" },
        { x: chartData.metrics.assignment_completion, y: avgMark, metric: "Assignment Completion" },
        { x: chartData.metrics.study_hours * 20, y: avgMark, metric: "Study Hours x 20" },
    ];

    scatterChart = new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                label: "Metric vs Avg Mark",
                data: points,
                parsing: false,
                backgroundColor: ["#03D26F", "#f97316", "#10b981"],
                pointRadius: 7,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: CHART_TEXT } },
                tooltip: {
                    titleColor: CHART_TEXT,
                    bodyColor: CHART_TEXT,
                    callbacks: {
                        label(context) {
                            const point = context.raw;
                            return `${point.metric}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    ticks: { color: CHART_MUTED },
                    grid: { color: CHART_GRID },
                    title: {
                        display: true,
                        text: "Scaled Metric Value",
                        color: CHART_MUTED,
                    },
                },
                y: {
                    min: 0,
                    max: 100,
                    ticks: { color: CHART_MUTED },
                    grid: { color: CHART_GRID },
                    title: {
                        display: true,
                        text: "Average Subject Mark",
                        color: CHART_MUTED,
                    },
                },
            },
        },
    });
}

function avg(values) {
    if (!values.length) {
        return 0;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}
