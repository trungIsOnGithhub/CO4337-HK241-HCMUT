import React, { useState } from 'react';
import Select from 'react-select';

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
  multiValue: (styles, { data }) => {
    return {
      ...styles,
      backgroundColor: '#36A2EB', // Màu xanh
      color: '#FFF', // Màu văn bản trắng
    };
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: '#FFF', // Màu văn bản trắng
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: '#FFF', // Màu văn bản trắng
    ':hover': {
      backgroundColor: '#0056B3', // Màu nền khi di chuột
      color: '#FFF', // Màu văn bản trắng
    },
  }),
};

const MultiSelect = ({options, id, onChangee}) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = (aa) => {
    console.log(aa)
    setSelectedOption(aa);
    onChangee(aa?.map(el => el?.value));
  };

  return (
    <div className='flex flex-col gap-2 w-full'>
      <label htmlFor="staffSelect">Staff</label>
      <Select
        value={selectedOption}
        onChange={(e)=>handleChange(e)}
        options={options}
        isMulti
        styles={colourStyles}
        id={id}
      />
    </div>
  );
};

export default MultiSelect;
