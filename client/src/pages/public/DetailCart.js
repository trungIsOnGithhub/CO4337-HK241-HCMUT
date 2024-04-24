import { Breadcrumb, Button, OrderItem} from 'components'
import withBaseComponent from 'hocs/withBaseComponent'
import React, { memo, useEffect} from 'react'
import { useSelector } from 'react-redux'
import { Link, createSearchParams } from 'react-router-dom'
import { getCurrent } from 'store/user/asyncAction'
import Swal from 'sweetalert2'
import { formatPrice, formatPricee } from 'ultils/helper'
import path from 'ultils/path'


const DetailCart = ({location, navigate}) => {
    const {currentCart, current} = useSelector(state => state.user)

    const handleSubmit = () => {
        if(!current?.address){
            return Swal.fire({
                icon: 'info',
                title: 'Update your address',
                text: 'You need address to checkout',
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Update address',
                cancelButtonText: 'Cancel'
            }).then((rs) => { 
                if(rs.isConfirmed){
                    navigate({
                        pathname:  `/${path.USER}/${path.PERSONAL}`,
                        search: createSearchParams({redirect: location.pathname}).toString()
                    })
                }
             })
        }
        else{
            window.open(`/${path.CHECKOUT}`, '_blank')
        }
    }
    return (
    <div className='w-full'>
        <div className='relative px-4'>
            <h3 className='text-3xl font-semibold py-4 border-b border-b-blue-200'>My Cart</h3>
        </div>
        <div className='flex flex-col border mx-auto my-8'>
        <div className='w-full py-3 font-bold grid grid-cols-10 bg-gray-400'>
            <span className='col-span-6 w-full text-center'></span>
            <span className='col-span-1 w-full text-center'>Quantity</span>
            <span className='col-span-3 w-full text-center'>Price</span>
        </div>
        {currentCart?.map(el=>(
           <OrderItem key={el._id} el={el}/>
        ))}
        </div>
        <div className='mx-auto pr-16 flex flex-col justify-center items-end gap-3 mb-12'>
            <span className='flex items-center gap-8 text-sm'>
                <span>
                    Subtotal
                </span>
                <span className='text-main font-semibold text-lg'>
                    {
                        `${formatPrice(currentCart?.reduce((sum,el)=> +el?.price * +el?.quantity +sum, 0))} VND`
                    }
                </span>
            </span>
            <span className='text-xs italic '>
             Shipping, taxes, and discounts calculated at checkout.
            </span>
            <Button handleOnclick={handleSubmit}>
                Checkout
            </Button>
            {/* <Link target='_blank' className='bg-main text-white px-4 py-2 rounded-md' to={`/${path.CHECKOUT}`}>
                Checkout
            </Link> */}
        </div>
    </div>
  )
}

export default withBaseComponent(memo(DetailCart))