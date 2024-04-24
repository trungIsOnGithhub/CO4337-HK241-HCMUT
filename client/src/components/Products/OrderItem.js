import React, { memo, useCallback, useEffect, useState } from 'react'
import { SelectQuantity} from 'components'
import { formatPrice } from 'ultils/helper'
import withBaseComponent from 'hocs/withBaseComponent'
import { updateCart } from 'store/user/userSlice'

const OrderItem = ({el, dispatch}) => {
    const [quantity, setQuantity] = useState(el?.quantity)
    const editQuantity = useCallback((number)=>{
        if(!Number(number)||Number(number)<1) {
          return
        }
        else{
          setQuantity(Number(number))
        }
      },[quantity])

    const handleChange = useCallback((flag)=>{
    if(flag==='minus'){
        if(quantity>=2) setQuantity(prev => prev-1)
    }
    else{
        setQuantity(prev => prev+1)
    }
    },[quantity])

    useEffect(() => {
        dispatch(updateCart({pid: el?.product?._id, quantity, color: el?.color}))
     // handleChangeQuantity && handleChangeQuantity(el?.product?._id, quantity, el?.color)
    }, [quantity])
    
  return (
    <div key={el._id} className='w-full py-3 font-bold grid grid-cols-10 border-b'>
    <span className='col-span-6 w-full'>
        <div className='flex gap-2 px-4 py-2'>
            <img src={el?.thumb} alt='thumb' className='w-28 h-28 object-cover'></img>
            <div className='flex flex-col items-start gap-1'>
                <span className='text-sm font-semibold'>{el?.title}</span>
                <span className='text-[10px]'>{el?.color}</span>
            </div>
        </div>
    </span>
    <span className='col-span-1 w-full text-center'>
        <div className='flex items-center h-full justify-center'>
            <SelectQuantity quantity={quantity} editQuantity={editQuantity} handleChange={handleChange} />
        </div>
    </span>
    <span className='col-span-3 w-full text-center'>
        <div className='flex items-center h-full justify-center text-lg'>  
            {formatPrice(el?.price * quantity)+' VND'}
        </div>
    </span>
    </div>
  )
}

export default withBaseComponent(memo(OrderItem))