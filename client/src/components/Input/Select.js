import React, { memo, useEffect } from 'react'
import clsx from 'clsx'

const Select = ({label, options=[], register, errors, id, validate, style, styleSelect, styleLabel ,text, value}) => {
  // useEffect(() => {
  //   if (id && value) {
  //     const element = document.getElementById(id);
  //     if (element) {
  //       element.value = value?.code;
  //     }
  //   }
  // }, [id, value]);
  return (
    <div className={style}>
      {label && <label htmlFor={id} className={clsx(styleLabel)}>{label}</label>}
      <select 
        className={styleSelect} 
        id={id} 
        {...register(id, validate)}
        value={value?.code}
        >
        <option value=''>{text||`----CHOOSE----`}</option>
        {options?.map(el => (
          <option key={el.code} value={el.code}>{el?.label || el.value}</option>
        ))}
      </select>
      {errors[id] && <small className='text-xs text-red-500'>{errors[id]?.message}</small>}
    </div>
  )
}

export default memo(Select)