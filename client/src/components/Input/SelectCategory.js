import React, { memo, useState } from 'react'
import clsx from 'clsx'
import Select from 'react-select'

const SelectCategory = ({styleLabel, label, options=[], register, errors, id, validate, style, styleSelect, fullWidth, text, values, onChangee, defaultValue}) => {
  // Tạo một hàm handleChange để xử lý thay đổi giá trị của select

  const handleChange = (aa) => {
    onChangee(aa?.label);
  };

  const colourStyles = {
    control: styles => ({ ...styles, backgroundColor: 'white', cursor: 'pointer', borderColor: '#dee1e6', borderRadius: '6px', color: '#00143c'}),
    option: (styles, { isFocused, data }) => ({
      ...styles,
      background: isFocused
        ? data.color
        : 'white',
      color: '#00143c',
      cursor: 'pointer',
      zIndex: 999
    }),
    singleValue: (styles, { data }) => {
        return {
          ...styles,
          backgroundColor: data.color,
          color: '#00143c', // Màu văn bản trắng
          paddingLeft: '5px', // Thêm padding-left
          borderRadius: '2px',
        };
      },
  }
  return (
    <div className={style}>
      {label && <label className={styleLabel} htmlFor={id}>{label}</label>}
      <Select
        value={values ? options.find(el => el.label === values) : null}
        onChange={(e)=>handleChange(e)}
        options={options}
        styles={colourStyles}
        id={id}
        className={styleSelect}
      />
      {errors[id] && <small className='text-xs text-red-500'>{errors[id]?.message}</small>}
    </div>
  )
}

export default memo(SelectCategory)