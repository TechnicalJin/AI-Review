import React from 'react';
import { FiMenu } from 'react-icons/fi';

const Header = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="px-6 py-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-600 hover:shadow-xl md:hidden"
        >
          <FiMenu className="mr-2" />
          Menu
        </button>
      </div>
    </header>
  );
};

export default Header;
