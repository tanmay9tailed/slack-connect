import React from 'react';

const PixelatedBox = ({ children, className = '', as: Component = 'div' }) => {
  return (
    <Component className={`bg-white border-2 border-black rounded-lg shadow-[4px_4px_0_0_#000] ${className}`}>
      {children}
    </Component>
  );
};

export default PixelatedBox;
