import React, { memo, useState } from 'react'
import clsx from 'clsx'
import Select from 'react-select'

const SelectCategory = ({label, options, register, errors, id, validate, style, fullWidth, text, values, onChangee}) => {
  // Tạo một hàm handleChange để xử lý thay đổi giá trị của select
  console.log(values)
  const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = (aa) => {
    console.log(aa)
    setSelectedOption(aa);
    onChangee(aa?.label);
  };

  const colourStyles = {
    control: styles => ({ ...styles, backgroundColor: 'white', cursor: 'pointer'}),
    option: (styles, { isFocused, data }) => ({
      ...styles,
      background: isFocused
        ? data.color
        : 'white',
      color: '#000',
      cursor: 'pointer',
    }),
    singleValue: (styles, { data }) => {
        return {
          ...styles,
          backgroundColor: data.color,
          color: '#000', // Màu văn bản trắng
          paddingLeft: '5px', // Thêm padding-left
          borderRadius: '5px',
          fontWeight: '600'
        };
      },
  }
  return (
    <div className={clsx('flex flex-col gap-3 z-50', style)}>
      {label && <label htmlFor={id}>{label}</label>}
      <Select 
        value={values ? selectedOption : null}
        onChange={(e)=>handleChange(e)}
        options={options}
        styles={colourStyles}
        id={id}
      />
      {errors[id] && <small className='text-xs text-red-500'>{errors[id]?.message}</small>}
    </div>
  )
}

export default memo(SelectCategory)