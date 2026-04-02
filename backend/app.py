from flask import Flask, redirect, render_template, url_for
from flask_cors import CORS

from db import initialize_database
from routes import api_bp


def create_app() -> Flask:
    app = Flask(
        __name__,
        template_folder="../frontend/templates",
        static_folder="../frontend/static",
    )
    CORS(app)

    @app.route("/", methods=["GET"])
    def index():
        return render_template("index.html")

    @app.route("/add-student", methods=["GET"])
    def add_student_page():
        return render_template("add_student.html")

    @app.route("/analyze", methods=["GET"])
    def analyze_page():
        return render_template("analyze.html")

    @app.route("/saved-students", methods=["GET"])
    def saved_students_page():
        return render_template("saved_students.html")

    @app.route("/class-analysis", methods=["GET"])
    def class_analysis_page():
        return render_template("class_analysis.html")

    @app.route("/404", methods=["GET"])
    def not_found_page():
        return render_template("404.html"), 404

    @app.errorhandler(404)
    def handle_404(_error):
        return redirect(url_for("not_found_page"))

    app.register_blueprint(api_bp, url_prefix="/api")
    return app


app = create_app()


if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)
