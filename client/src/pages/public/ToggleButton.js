import React, { useState } from 'react';

const ToggleButton = ({ handleToggleAndReturn, isToggled }) => {
  // const [isToggled, setIsToggled] = useState(false);
  // const handleToggle = () => setIsToggled(!isToggled);
  return (
    <button
      onClick={() => {
        handleToggleAndReturn()
        // setIsToggled(isToggled);
      }}
      className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 ease-in-out 
        ${isToggled ? 'bg-[#0a66c2]' : 'bg-gray-400'}`}
    >
      <span
        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out 
        ${isToggled ? 'translate-x-6' : 'translate-x-0'}`}
      />
    </button>
  );
};

export default ToggleButton;