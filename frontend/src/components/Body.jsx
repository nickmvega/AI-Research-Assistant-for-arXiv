import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Body() {
  const [arxivId, setArxivId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://127.0.0.1:5000/')
      .then(response => response.json())
      .then(data => console.log(data.message))
      .catch(error => console.error('Error:', error));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (arxivId) {
      navigate(`/summarize/${arxivId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center transform scale-150">
      <div className="text-lg text-gray-400 mb-2">Powered by Llama 3.1 and Together AI</div>
      <div className="text-7xl font-bold text-white mb-2">Your Research Assistant</div>
      
      <form className="input-group relative w-full max-w-2xl mt-10 flex items-center" onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="text" 
          className="input border border-solid border-gray-400 rounded-l-lg bg-transparent py-6 px-8 text-2xl text-white focus:outline-none focus:border-white flex-grow" 
          placeholder="Enter arXiv ID here"
          value={arxivId}
          onChange={(e) => setArxivId(e.target.value)}
        />
        <button 
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-6 px-8 text-xl h-full rounded-r-lg"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default Body;
