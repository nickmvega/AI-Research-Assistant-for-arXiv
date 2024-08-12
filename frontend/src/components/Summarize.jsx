import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowUp } from 'react-icons/fa';

function Summarize() {
  const { arxivId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [modelResponse, setModelResponse] = useState('');
  const textContainerRef = useRef(null);
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
        const combinedContent = [{ type: 'text', value: data.text }, ...data.images.map(url => ({ type: 'image', value: url }))];
        setContent(combinedContent);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching PDF content:', error);
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

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText) {
      const confirmSelection = window.confirm(`Do you want to add this text to the prompt? \n"${selectedText}"`);
      if (confirmSelection) {
        setPrompt((prevPrompt) => prevPrompt + ` "${selectedText}"`);
        selection.removeAllRanges();
      }
    }
  };

  const handleTextareaChange = (event) => {
    const textarea = event.target;
    textarea.style.height = 'auto'; // Reset height to auto to calculate new height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scrollHeight to expand dynamically
    setPrompt(textarea.value);
  };

  useEffect(() => {
    const textContainer = textContainerRef.current;

    if (textContainer) {
      textContainer.addEventListener('mouseup', handleTextSelection);
    }

    return () => {
      if (textContainer) {
        textContainer.removeEventListener('mouseup', handleTextSelection);
      }
    };
  }, []);

  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.style.height = 'auto';
      promptRef.current.style.height = `${promptRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start h-full text-center mt-10 p-4">
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={handleHomeClick}
      >
        Home
      </button>

      <div className="flex w-full h-[calc(100vh-6rem)] space-x-8" style={{ maxWidth: '150rem' }}>
        {/* Left column: Combined text and images */}
        <div
          className="flex-1 bg-gray-800 text-white p-8 rounded-lg overflow-y-auto whitespace-pre-wrap"
          ref={textContainerRef}
        >
          {content.map((item, index) => {
            if (item.type === 'text') {
              return <p key={index} className="mb-6 text-lg">{item.value}</p>;
            } else if (item.type === 'image') {
              return <img key={index} src={`http://127.0.0.1:5000/static/${item.value}`} alt={`Extracted image ${index + 1}`} className="my-4 max-w-full"/>;
            }
            return null;
          })}
        </div>

        {/* Right column: Prompt and Model Response */}
        <div className="w-full flex-1 flex flex-col max-w-screen-2xl space-y-6">
          {/* Prompt Input */}
          <div className="flex items-center space-x-2">
            <textarea
              ref={promptRef}
              className="flex-grow bg-gray-800 text-white p-4 rounded-lg resize-none overflow-y-hidden"
              placeholder="Select text from the left and ask a question..."
              value={prompt}
              onChange={handleTextareaChange}
              rows={1}
            />
            <button
              onClick={handlePromptSubmit}
              className="bg-blue-500 hover:bg-blue-700 text-white p-3 rounded-full flex-shrink-0"
            >
              <FaArrowUp className="text-lg" />
            </button>
          </div>

          {/* Model Response */}
          <textarea
            className="w-full flex-1 bg-gray-800 text-white p-6 rounded-lg resize-none overflow-y-auto"
            placeholder="Model response will appear here..."
            value={modelResponse}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}

export default Summarize;
