import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Summarize() {
  const { arxivId } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setText(data.text);
        setImages(data.images);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching PDF text:', error);
        setLoading(false);
      });
  }, [arxivId]);

  const handleHomeClick = () => {
    navigate('/');
  };

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
      <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-6xl h-[40vh] overflow-y-auto whitespace-pre-wrap mb-4">
        {text}
      </div>
      <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-6xl h-[40vh] overflow-y-auto whitespace-pre-wrap">
        {images.map((url, index) => (
          <img key={index} src={`http://127.0.0.1:5000/static/${url}`} alt={`Extracted image ${index + 1}`} className="my-4 max-w-full"/>
        ))}
      </div>
    </div>
  );
}

export default Summarize;
