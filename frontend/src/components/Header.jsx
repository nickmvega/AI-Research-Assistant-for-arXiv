import React from 'react';
import logo from '../assets/logo.png';

function Header() {
  return (
    <div className="flex justify-center items-center h-20 mt-4">
      <a href="/">
        <img src={logo} alt="Logo" className="w-40 sm:w-48" />
      </a>
    </div>
  );
}

export default Header;