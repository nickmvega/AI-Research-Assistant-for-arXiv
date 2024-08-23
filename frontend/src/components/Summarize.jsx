// src/components/Summarize.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowUp } from 'react-icons/fa';
import Header from './Header'; // Adjust the path based on your project structure
import PDFViewer from './PDFViewer';

function Summarize() {
  const { arxivId } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [modelResponse, setModelResponse] = useState('');
  const promptRef = useRef(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/process_pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ arxiv_id: arxivId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPdfUrl(`http://127.0.0.1:5000/${data.pdf_filename}`);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching PDF:', error);
        setLoading(false);
      });
  }, [arxivId]);

  const handleHomeClick = () => {
    navigate('/');
  };

  const handlePromptSubmit = () => {
    fetch('http://127.0.0.1:5000/update_csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ arxiv_id: arxivId, prompt }),
    })
      .then((response) => response.json())
      .then((data) => {
        setModelResponse(data.modelResponse);
        setPrompt('');
      })
      .catch((error) => {
        console.error('Error updating CSV:', error);
      });
  };

  const handleTextareaChange = (event) => {
    const textarea = event.target;
    textarea.style.height = 'auto'; // Reset height to auto to calculate new height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scrollHeight to expand dynamically
    setPrompt(textarea.value);
  };

  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.style.height = 'auto';
      promptRef.current.style.height = `${promptRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-28 text-white text-center mt-10">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Header />
      {/* Main Content Area */}
      <div className="pt-28 h-screen w-screen flex">
        <div className="flex flex-row flex-1 overflow-hidden">
          {/* Left Side: PDF Viewer */}
          <div className="flex-1 bg-gray-100 p-4">
            <div className="bg-white shadow-lg rounded-lg h-full overflow-hidden">
              <PDFViewer pdfUrl={pdfUrl} />
            </div>
          </div>

          {/* Right Side: Prompt and Model Response */}
          <div className="w-1/3 flex flex-col p-4 bg-gray-800 text-white overflow-hidden">
            {/* Prompt Box */}
            <div className="flex-1 mb-4 flex flex-col">
              <textarea
                ref={promptRef}
                className="flex-grow bg-gray-900 text-white p-4 rounded-lg resize-none overflow-y-auto"
                placeholder="Select text from the PDF and ask a question..."
                value={prompt}
                onChange={handleTextareaChange}
              />
              <button
                onClick={handlePromptSubmit}
                className="mt-2 bg-blue-500 hover:bg-blue-700 text-white p-3 rounded"
              >
                <FaArrowUp className="text-lg" />
              </button>
            </div>

            {/* Model Response Box */}
            <div className="flex-1 flex flex-col">
              <textarea
                className="flex-grow bg-gray-900 text-white p-4 rounded-lg resize-none overflow-y-auto"
                placeholder="Model response will appear here..."
                value={modelResponse}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Summarize;
