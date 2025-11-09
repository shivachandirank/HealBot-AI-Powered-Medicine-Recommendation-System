from flask import send_from_directory
import app


@app.route('/')
def serve_frontend():
    return send_from_directory('static', 'index.html')