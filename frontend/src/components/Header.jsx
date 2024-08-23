// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

function Header() {
  return (
    <div className="flex justify-between items-center h-28 px-8 bg-[#000300] shadow-md fixed top-0 w-full z-10">
        <img src={logo} alt="Logo" className="w-56" />
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-16 text-3xl font-bold">
          <Link to="/" className="text-white hover:text-green-500 transition-colors duration-200">Home</Link>
          <Link to="/how-to-use" className="text-white hover:text-green-500 transition-colors duration-200">How To Use</Link>
          <a href="#about-us" className="text-white hover:text-green-500 transition-colors duration-200">About Us</a>
          <a href="#thank-you" className="text-white hover:text-green-500 transition-colors duration-200">Thank You</a>
        </div>
      </div>
    </div>
  );
}

export default Header;
