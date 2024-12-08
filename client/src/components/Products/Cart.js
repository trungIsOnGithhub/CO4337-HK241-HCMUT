import { apiRemoveCartProduct} from 'apis'
import Button from 'components/Buttons/Button'
import withBaseComponent from 'hocs/withBaseComponent'
import React, { memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { showCart } from 'store/app/appSlice'
import { getCurrent } from 'store/user/asyncAction'
import { formatPrice } from 'ultils/helper'
import icons from 'ultils/icon'
import path from 'ultils/path'

const {IoCloseSharp, FaTrashCan} = icons
const Cart = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {current, currentCartProduct} = useSelector(state => state.user)
    const removeCart = async(pid, colorCode, variantId) => {
        const response = await apiRemoveCartProduct(pid,colorCode,variantId)
        if(response.success){
            dispatch(getCurrent())
        }    
    }

    // removed log

    return (
    <div onClick={e=> e.stopPropagation()} className='w-[400px] h-screen bg-black grid grid-rows-10 text-white p-4'>
        <header className='border-b border-gray-800 flex justify-between items-center font-bold text-2xl row-span-1 h-full'>
            <span>Your Cart</span>
            <span onClick={()=>{dispatch(showCart())}} className='p-2 cursor-pointer'><IoCloseSharp size={24}/></span>
        </header>
        <section className='row-span-7 flex flex-col gap-3 h-full max-h-full overflow-y-auto py-3'>
            {!currentCartProduct && <span className='text-xs italic'>Your cart is empty</span>}
            {currentCartProduct &&
                currentCartProduct.map(el=>(
                <div key={el?._id} className='flex items-center justify-between'>
                    <div className='flex gap-2'>
                        <img src={el?.thumb} alt='thumb' className='w-16 h-16 object-cover'></img>
                        <div className='flex flex-col gap-1'>
                            <span className='text-sm font-semibold line-clamp-1'>{el?.title}</span>
                            <span className='text-[10px] font-extralight'>{`Quantity: ${el?.quantity} - Color: ${el?.color}`}</span>
                            <span className='text-sm'>{formatPrice(el?.price)+' VND'}</span>
                        </div>
                    </div>
                    <span onClick={()=>{removeCart(el?.productId, el?.colorCode, el?.variantId)}} className='h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-700 cursor-pointer'>
                        <FaTrashCan size={20}/>
                    </span>
                </div>
            ))}
        </section>
        <div className='row-span-2 h-full flex flex-col justify-between'>
            <div className='flex items-center justify-between pt-4 border-t'>
                <span>Subtotal:</span>
                <span>{formatPrice(currentCartProduct.reduce((sum,el)=>sum+Number(el?.price)*Number(el?.quantity),0))+' VND'}</span>
            </div>
            <span className='text-center text-gray-700 italic text-xs'>Shipping, taxes, and discounts calculated at checkout.</span>
            
            <Button 
            handleOnclick={()=>{dispatch(showCart())
                                navigate(`/${path.USER}/${path.MYCART}`)}} 
            style='rounded-none w-full bg-[#0a66c2] py-2'>
                Shopping Cart
            </Button>
        </div>
    </div>
  )
}

export default memo(Cart)