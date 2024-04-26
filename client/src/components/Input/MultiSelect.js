import React, { useState } from 'react';
import Select from 'react-select';

const options = [
  { label: 'Option 1', value: 'option_1' },
  { label: 'Option 2', value: 'option_2' },
  { label: 'Option 3', value: 'option_3' },
  { label: 'Option 4', value: 'option_4' },
];

const colourStyles = {
  control: styles => ({ ...styles, backgroundColor: 'white', cursor: 'pointer'}),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isFocused ? 'rgba(0, 0, 0, 0.1)' : 'white',
      color: '#000',
      cursor: 'pointer',
    };
  },
};

const MultiSelect = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = aa => {
    setSelectedOption(aa);
    console.log(selectedOption)
  };

  return (
    <div>
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isMulti
        styles={colourStyles}
      />
      {selectedOption && (
        <div>
          Selected value: {selectedOption.map(option => option.value).join(', ')}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
