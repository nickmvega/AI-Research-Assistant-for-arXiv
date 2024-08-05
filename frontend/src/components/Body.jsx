import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Body() {
  const [arxivId, setArxivId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (arxivId) {
      navigate(`/summarize/${arxivId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
      <div className="text-sm text-gray-400">Powered by Llama 3.1</div>
      <div className="text-4xl font-bold text-white">Your Research Assistant</div>
      
      <form className="input-group relative w-full max-w-md mt-8 flex items-center" onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="text" 
          className="input border border-solid border-gray-400 rounded-l-lg bg-transparent py-4 px-6 text-lg text-white focus:outline-none focus:border-white flex-grow" 
          placeholder="Enter arXiv ID here"
          value={arxivId}
          onChange={(e) => setArxivId(e.target.value)}
        />
        <button 
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 text-lg h-full rounded-r-lg"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default Body;
