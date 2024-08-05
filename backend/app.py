from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
from config import app, db
from models import ProcessedPDF
from fetch import fetch_pdf_url_from_arxiv, process_arxiv_pdf
import json

app = Flask(__name__, static_url_path='/static', static_folder='static')
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mydatabase.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

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

if __name__ == '__main__':
    from models import ProcessedPDF
    with app.app_context():
        db.create_all()
    app.run(debug=True)
