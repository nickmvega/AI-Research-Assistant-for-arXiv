from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import os
import csv
import glob
from config import app, db
from models import ProcessedPDF
from fetch import fetch_pdf_url_from_arxiv, process_arxiv_pdf
import json

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
        print(f"Removed file: {f}")

def clean_text_csv():
    with open('text.csv', mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['arxiv_id', 'text'])
        print("text.csv cleaned")

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
    
    text, image_urls, pdf_filename = process_arxiv_pdf(arxiv_id)
    
    if not text:
        return jsonify({'error': 'Failed to process PDF'}), 500

    # Save extracted text to CSV
    with open('text.csv', mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['arxiv_id', 'text'])
        writer.writerow([arxiv_id, text])

    # Return the PDF filename for the frontend to fetch and display
    return jsonify({'pdf_filename': pdf_filename})

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route('/clean_static', methods=['POST'])
def clean_static():
    clean_static_folder()
    clean_text_csv()
    clean_database()
    return jsonify({'message': 'Static folder and database cleaned'})

@app.route('/')
def home():
    clean_static_folder()
    clean_text_csv()
    clean_database()
    return jsonify({'message': 'Home page loaded, static folder and database cleaned'})



if __name__ == '__main__':
    from models import ProcessedPDF
    with app.app_context():
        db.create_all()
    app.run(debug=True)
