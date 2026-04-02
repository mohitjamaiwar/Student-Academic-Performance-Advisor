# Student Academic Performance Advisor

## Abstract
Student Academic Performance Advisor is an explainable AI project for academic support. It analyzes student performance using symbolic AI techniques and returns actionable recommendations for improvement. The system focuses on transparency, so every recommendation is derived from explicit rules and interpretable knowledge structures.

## Problem Statement
Conventional performance feedback in classrooms is often delayed, generic, or difficult to interpret. This project addresses that gap by transforming student metrics into structured knowledge, applying rule-based reasoning, and presenting clear guidance for students and faculty.

## Project Objectives
1. Detect weak subjects and academic risk factors from student data.
2. Provide explainable and consistent recommendations.
3. Visualize student performance in an intuitive analytics dashboard.
4. Store and retrieve student profiles for continuous monitoring.

## Theoretical Foundation
The project follows a symbolic AI paradigm instead of black-box prediction.

1. Facts are collected from student records.
2. Facts are represented as structured knowledge.
3. Rules infer insights and recommendations.
4. Results are presented with visual and textual explanation.

This design is suitable for academic settings where interpretability and auditability are critical.

## AI Concepts Used

### 1. Frame-Based Knowledge Representation
A student is represented as a frame with slots such as attendance, study hours, assignment completion, subject marks, and difficulty areas.

Benefits:
1. Structured and uniform representation of student information.
2. Direct compatibility with rule-based inference.

### 2. Rule-Based Reasoning
The reasoning engine applies production rules to identify weak subjects and generate recommendations.

Benefits:
1. Deterministic outputs for similar inputs.
2. Easy extension by adding or refining rules.
3. Transparent decision path for every recommendation.

### 3. Semantic Network Context
Subject-level context is enriched through semantic relationships to support more meaningful advice.

Benefits:
1. Better conceptual linkage across performance indicators.
2. More relevant and coherent advisory output.

## Functional Features
1. Add and persist student records in Supabase PostgreSQL.
2. Saved Students page with roll-number-wise table view and detail drill-down.
3. Analytics page with automatic lookup by roll number and student name.
4. Explainable recommendation output in study, time-management, and resource categories.
5. Performance visualizations using bar, radar, pie, line, and scatter charts.
6. Responsive multi-page UI with custom 404 handling.

## System Architecture
1. Frontend layer: HTML, CSS, JavaScript dashboard and forms.
2. API layer: Flask routes for validation, retrieval, and analysis.
3. Reasoning layer: frames, semantic network, and rule engine.
4. Data layer: Supabase PostgreSQL schema for students and subject marks.

## API Summary
1. GET /api/health
2. POST /api/students
3. GET /api/students
4. GET /api/students/<id>
5. GET /api/students/lookup
6. POST /api/analyze

## Technology Stack
1. Backend: Python, Flask
2. Database: Supabase (PostgreSQL)
3. Frontend: HTML, CSS, JavaScript
4. Charts: Chart.js

## Setup
1. Create and activate a Python virtual environment.
2. Install dependencies with pip install -r requirements.txt.
3. Create a `.env` file from `.env.example`.
4. Set `DATABASE_URL` using your Supabase project connection string.
5. Make sure your Supabase database password and network access settings are correct.
5. Run python backend/app.py.
6. Open http://127.0.0.1:5000.

Example `DATABASE_URL` format:

```env
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

## Future Scope
1. Role-based authentication for students, mentors, and administrators.
2. Longitudinal analysis across semesters and academic sessions.
3. Hybrid reasoning by combining symbolic rules with machine learning risk prediction.
4. Personalized explanation generation in natural language.
5. Alert and notification workflow for early intervention.
6. Exportable academic reports in PDF and CSV formats.

## Conclusion
This project demonstrates practical use of symbolic AI in education by combining explainable reasoning with usable analytics. It is interpretable, extendable, and aligned with real academic decision-making requirements.
