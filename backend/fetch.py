import requests
import fitz
import xml.etree.ElementTree as ET
import os
import sys

def fetch_pdf_url_from_arxiv(arxiv_id):
    base_url = f'http://export.arxiv.org/api/query?id_list={arxiv_id}'
    response = requests.get(base_url)
    if response.status_code == 200:
        xml_response = response.text
        root = ET.fromstring(xml_response)
        for entry in root.findall('{http://www.w3.org/2005/Atom}entry'):
            for link in entry.findall('{http://www.w3.org/2005/Atom}link'):
                if link.attrib['type'] == 'application/pdf':
                    return link.attrib['href']
    return None

def download_pdf(pdf_url, output_path):
    response = requests.get(pdf_url)
    with open(output_path, 'wb') as file:
        file.write(response.content)
    print(f"Downloaded PDF to {output_path}")

def extract_text_and_images_from_pdf(pdf_path):
    document = fitz.open(pdf_path)
    text = ""
    image_urls = []
    static_dir = 'static'  # Define the static directory

    for page_num in range(len(document)):
        page = document.load_page(page_num)
        text += page.get_text()
        image_list = page.get_images(full=True)
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = document.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_filename = f"{os.path.splitext(os.path.basename(pdf_path))[0]}_image{page_num+1}_{img_index+1}.{image_ext}"
            image_path = os.path.join(static_dir, image_filename)
            with open(image_path, "wb") as img_file:
                img_file.write(image_bytes)
            image_urls.append(image_filename)
    return text, image_urls

def process_arxiv_pdf(arxiv_id):
    pdf_url = fetch_pdf_url_from_arxiv(arxiv_id)
    if not pdf_url:
        print("Failed to fetch PDF URL from arXiv")
        return None, None

    pdf_path = f"{arxiv_id}.pdf"
    download_pdf(pdf_url, pdf_path)
    text, image_urls = extract_text_and_images_from_pdf(pdf_path)
    os.remove(pdf_path)
    return text, image_urls

if __name__ == "__main__":
    arxiv_id = sys.argv[1]
    text, image_urls = process_arxiv_pdf(arxiv_id)
    if text:
        print(text)
        print("Images:", image_urls)
    else:
        print("Failed to extract text from PDF")
