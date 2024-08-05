import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Body from './components/Body';   
import Summarize from './components/Summarize';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Routes>
            <Route exact path="/" element={<Body />} />
            <Route path="/summarize/:arxivId" element={<Summarize />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
