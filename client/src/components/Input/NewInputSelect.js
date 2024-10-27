import React, { memo } from 'react'

const NewInputSelect = ({value, changeValue, options}) => {
  return (
    <select className='rounded-lg bg-slate-100 p-1 border-2 border-slate-500' value={value} onChange={e=> changeValue(e.target.value)}>
      <option value="" className='text-xs'>sort</option>
      {options?.map(el=> (
          <option className='text-xs' key={el.id} value={el.value}>{el.text}</option>
      ))}
    </select>
  )
}

export default memo(NewInputSelect)