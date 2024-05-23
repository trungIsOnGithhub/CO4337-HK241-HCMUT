import { apiRemoveCart} from 'apis'
import Button from 'components/Buttons/Button'
import withBaseComponent from 'hocs/withBaseComponent'
import React, { memo } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { showCart } from 'store/app/appSlice'
import { getCurrent } from 'store/user/asyncAction'
import { formatPrice } from 'ultils/helper'
import icons from 'ultils/icon'
import path from 'ultils/path'

const {IoCloseSharp, FaTrashCan} = icons
const Cart = ({dispatch, navigate}) => {
    const {current, currentCart} = useSelector(state => state.user)
    const removeCart = async(pid, color) => {
        const response = await apiRemoveCart(pid,color)
        if(response.success){
            dispatch(getCurrent())
        }
        
    }

    return (
    <div onClick={e=> e.stopPropagation()} className='w-[400px] h-screen bg-black grid grid-rows-10 text-white p-4'>
        <header className='border-b border-gray-800 flex justify-between items-center font-bold text-2xl row-span-1 h-full'>
            <span>Your Cart</span>
            <span onClick={()=>{dispatch(showCart())}} className='p-2 cursor-pointer'><IoCloseSharp size={24}/></span>
        </header>
        <section className='row-span-7 flex flex-col gap-3 h-full max-h-full overflow-y-auto py-3'>
            {!currentCart && <span className='text-xs italic'>Your cart is empty</span>}
            {currentCart &&
                currentCart.map(el=>(
                <div key={el?._id} className='flex items-center justify-between'>
                    <div className='flex gap-2'>
                        <img src={el?.thumb} alt='thumb' className='w-16 h-16 object-cover'></img>
                        <div className='flex flex-col gap-1'>
                            <span className='text-sm font-semibold'>{el?.title}</span>
                            <span className='text-[10px] font-extralight'>{`Quantity: ${el?.quantity} - Color: ${el?.color}`}</span>
                            <span className='text-sm'>{formatPrice(el?.price)+' VND'}</span>
                        </div>
                    </div>
                    <span onClick={()=>{removeCart(el?.product?._id, el?.color)}} className='h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-700 cursor-pointer'>
                        <FaTrashCan size={20}/>
                    </span>
                </div>
            ))}
        </section>
        <div className='row-span-2 h-full flex flex-col justify-between'>
            <div className='flex items-center justify-between pt-4 border-t'>
                <span>Subtotal:</span>
                <span>{formatPrice(currentCart.reduce((sum,el)=>sum+Number(el?.price)*Number(el?.quantity),0))+' VND'}</span>
            </div>
            <span className='text-center text-gray-700 italic text-xs'>Shipping, taxes, and discounts calculated at checkout.</span>
            
            <Button 
            handleOnclick={()=>{dispatch(showCart())
                                navigate(`/${path.USER}/${path.MYCART}`)}} 
            style='rounded-none w-full bg-main py-2'>
                Shopping Cart
            </Button>
        </div>
    </div>
  )
}

export default withBaseComponent(memo(Cart))