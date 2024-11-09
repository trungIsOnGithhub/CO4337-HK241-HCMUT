import React, { useState } from 'react';
import Select from 'react-select';

const colourStyles = {
  control: styles => ({ ...styles, backgroundColor: 'white', cursor: 'pointer', borderColor: '#dee1e6', borderRadius: '6px', color: '#00143c'}),
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
      backgroundColor: '#0a66c2', // Màu xanh
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
  menu: (styles) => ({
    ...styles,
    maxHeight: '200px', // Giới hạn chiều cao của menu option
    overflowY: 'auto',  // Thêm overflow-y cho phép cuộn
  }),
};

const MultiSelect = ({options, id, onChangee, values, title, disabled = false, require, style, labelStyle}) => {
  // const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = (aa) => {
    // setSelectedOption(aa);
    onChangee(aa?.map(el => el?.value));
  };
  return (
    <div className={style}>
      <label htmlFor="staffSelect" className={labelStyle}>{!title ? 'Staffs' : title}{require && <sup className='text-red-500 font-semibold'> *</sup>}</label>
      <Select
        value={values?.length > 0 ? options?.filter(option => values.some(staff => (staff._id||staff) === option.value)) : null}
        onChange={(e)=>handleChange(e)}
        options={options}
        isMulti
        styles={colourStyles}
        id={id}
        isDisabled={disabled}
      />
    </div>
  );
};

export default MultiSelect;
