import React, { memo } from 'react'

const SelectQuantity = ({quantity, editQuantity, handleChange}) => {
  return (
    <div className='flex items-center'>
        <span onClick={() => handleChange('minus')} className='cursor-pointer p-2 border-r border-black'>-</span>
        <input 
            className='py-2 outline-none w-[50px] text-black text-center' 
            type="text" 
            value = {quantity}
            onChange={e => editQuantity(e.target.value)}
            />
        <span onClick={() => handleChange('plus')} className='cursor-pointer p-2 border-l border-black'>+</span>
    </div>
  )
}

export default memo(SelectQuantity)