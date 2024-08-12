from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import os
import glob
from config import app, db
from models import ProcessedPDF
from fetch import fetch_pdf_url_from_arxiv, process_arxiv_pdf
import json, csv

app = Flask(__name__, static_url_path='/static', static_folder='static')
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mydatabase.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

def clean_static_folder():
    static_folder = 'static'
    files = glob.glob(os.path.join(static_folder, '*'))
    for f in files:
        os.remove(f)
        print(f"Removed file: {f}")  # Debug print

def clean_database():
    db.session.query(ProcessedPDF).delete()
    db.session.commit()
    print("Database cleaned")

@app.route('/process_pdf', methods=['POST'])
def process_pdf():
    data = request.get_json()
    arxiv_id = data.get('arxiv_id')

    if not arxiv_id:
        return jsonify({'error': 'No arXiv ID provided'}), 400
    
    existing_pdf = ProcessedPDF.query.filter_by(arxiv_id=arxiv_id).first()
    if existing_pdf:
        return jsonify({'text': existing_pdf.extracted_text, 'images': json.loads(existing_pdf.image_urls)})
    
    text, image_urls = process_arxiv_pdf(arxiv_id)
    
    if not text:
        return jsonify({'error': 'Failed to process PDF'}), 500

    pdf_url = fetch_pdf_url_from_arxiv(arxiv_id)

    new_pdf = ProcessedPDF(arxiv_id=arxiv_id, pdf_url=pdf_url, extracted_text=text, image_urls=json.dumps(image_urls))
    db.session.add(new_pdf)
    db.session.commit()
    
    return jsonify({'text': text, 'images': image_urls})

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route('/clean_static', methods=['POST'])
def clean_static():
    clean_static_folder()
    clean_database()
    return jsonify({'message': 'Static folder and database cleaned'})

@app.route('/')
def home():
    clean_static_folder()
    clean_database()
    return jsonify({'message': 'Home page loaded, static folder and database cleaned'})

@app.route('/update_csv', methods=['POST'])
def update_csv():
    data = request.get_json()
    arxiv_id = data.get('arxiv_id')
    prompt = data.get('prompt')

    if not arxiv_id or not prompt:
        return jsonify({'error': 'Invalid input data'}), 400

    # Define the CSV file path
    csv_file_path = 'prompts.csv'

    # Append the new prompt to the CSV file
    with open(csv_file_path, 'a', newline='') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow([arxiv_id, prompt])

    # Placeholder: Return a dummy model response
    model_response = "This is where the model's response would appear."

    return jsonify({'modelResponse': model_response})

if __name__ == '__main__':
    from models import ProcessedPDF
    with app.app_context():
        db.create_all()
    app.run(debug=True)
