import React, { memo } from 'react'

const Button = ({children, handleOnclick, style, fullWidth, type = 'button'}) => {
  return (
    <button type= {type} 
    className={style? style:`px-4 py-2 rounded-md text-white bg-[#0a66c2] font-semibold my-2 ${fullWidth?'w-full':'w-fit'} `}
    onClick={() => {handleOnclick && handleOnclick()}}>
        {children}
    </button>
  )
}

export default memo(Button)