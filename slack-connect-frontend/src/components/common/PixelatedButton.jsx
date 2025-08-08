import React from 'react';

const PixelatedButton = ({ children, className = '', onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 sm:px-6 py-2 border-2 border-black rounded-lg bg-white font-bold shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[0px_0px_0_0_#000] active:translate-x-[4px] active:translate-y-[4px] transition-all duration-150 text-sm sm:text-base ${className}`}
    >
      {children}
    </button>
  );
};

export default PixelatedButton;
