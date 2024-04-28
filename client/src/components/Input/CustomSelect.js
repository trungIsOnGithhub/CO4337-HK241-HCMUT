import clsx from 'clsx'
import React from 'react'
import Select from 'react-select'

const CustomSelect = ({label, placeholder, onChange, options=[], value, classname, wrapClassname}) => {
  return (
    <div className={clsx(wrapClassname)}>
        {label && 
        <h3 className='font-medium'>
            {label}
        </h3>}
        <Select 
            className='w-full h-full p-0 m-0'
            placeholder={placeholder}
            isClearable
            options={options}
            value={value}
            isSearchable
            onChange={val => onChange(val)}
            formatOptionLabel={(option) => 
                <div className='text-black bg-red-400 w-full h-full p-0 m-0'>
                    {option.label}
                </div>
            }
        />
    </div>
  )
}

export default CustomSelect