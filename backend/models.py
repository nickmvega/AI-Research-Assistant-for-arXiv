from datetime import datetime, timezone
from config import db

class ProcessedPDF(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    arxiv_id = db.Column(db.String(50), unique=True, nullable=False)
    pdf_url = db.Column(db.String(200), nullable=False)
    extracted_text = db.Column(db.Text, nullable=False)
    image_urls = db.Column(db.Text, nullable=True)
    processed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<ProcessedPDF {self.arxiv_id}>"

