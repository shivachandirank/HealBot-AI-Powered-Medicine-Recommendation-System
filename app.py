from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')
@app.route('/api/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        
        prompt = f"""
        **Patient Profile:**
        - Name: {data.get('name')}
        - Age: {data.get('age')}
        - Weight: {data.get('weight')} kg
        - Gender: {data.get('gender', 'Not specified')}
        - Allergies: {data.get('allergies', 'None')}
        - Current Medications: {data.get('current_meds', 'None')}
        - Conditions: {data.get('conditions', 'None')}
        
        **Symptoms:** {data.get('symptoms')}
        
        Provide detailed medicine recommendations with:
        1. Top 3 options with reasoning
        2. Dosage guidelines
        3. Side effects
        4. Contraindications
        5. Interaction warnings
        
        Format with clear bullet points.
        """
        
        response = model.generate_content(prompt)
        return jsonify({
            "success": True,
            "recommendation": response.text
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)