import React, {memo, useState}from 'react'
import {formatPrice, formatPricee} from 'ultils/helper'
import label from 'assets/label.png'
import label_trend from 'assets/label_trending.png'
import {renderStarfromNumber} from 'ultils/helper'
import {Button, SelectOption} from 'components'
import icons from 'ultils/icon'
import { showModal } from 'store/app/appSlice'
import { DetailProduct } from 'pages/public'
import { apiUpdateCartProduct, apiUpdateWishlist } from 'apis'
import { toast } from 'react-toastify'
import { getCurrent } from 'store/user/asyncAction'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import path from 'ultils/path'
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { MdOutlineCategory } from 'react-icons/md'
const {FaEye, FaHeart, FaCartPlus, BsCartCheckFill} = icons

const Product = ({productData, isNew, normal, isNotBorder}) => {
  const [isShowOption, setIsShowOption] = useState(false)
  const {current} = useSelector(state => state.user)
  const {isLogin} = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  const handleAddProductToCart = async() => {
    if(!isLogin){
      Swal.fire({
          text: 'Login to review',
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Go login',
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          title: 'Oops!',
          showCancelButton: true,
      }).then((rs)=>{
          if(rs.isConfirmed){
              navigate(`/${path.LOGIN}`)
          }
      })
    }
    else{
      const response = await apiUpdateCartProduct({
        pid: productData?._id, 
        quantity: 1, 
        color: productData?.color, 
        colorCode: productData?.colorCode || "#000000",
        price: productData?.price, 
        thumb: productData?.thumb, 
        title: productData?.title, 
        provider: productData?.provider_id
      })
      if(response.success){
        toast.success(response.mes)
        dispatch(getCurrent())
      }
      else{
        toast.error(response.mes)
      }
    }
  }

  const handleNavigateLearnMoreProduct = ( ) => {
    navigate(`/product/${productData.category?.toLowerCase()}/${productData?._id}/${productData?.title}`)
    console.log(productData)
  }

  return (
    <div className='cursor-pointer w-full h-fit rounded-md relative shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300'>
        <div className='w-full h-[200px]'>
            <img className='h-full w-full object-contain rounded-t-md' src={productData?.thumb} alt={productData?.name} />
        </div>
        <div className='w-full h-[184px] rounded-b-md px-[16px] py-[12px] flex flex-col justify-between'>
            <div className='w-full flex flex-col gap-1'>
                <span className='text-[18px] font-medium line-clamp-1'>{productData?.title}</span>
                <span className='flex items-center gap-4'>
                    <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Quantity <span className='text-black font-medium'>{`${productData?.quantity}`}</span></span>
                    <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Sold <span className='text-black font-medium'>{`${productData?.soldQuantity}`}</span></span>
                </span>
                <span className='text-[14px] text-[#868e96] flex items-center gap-2'><span className='flex gap-1 items-center'><MdOutlineCategory /> Category</span> <span className='font-medium'>{`${productData?.category}`}</span></span>
            </div>
            <div className='flex justify-between'>
            <Button handleOnclick={handleNavigateLearnMoreProduct} style={'px-[10px] rounded-md text-black border border-[#868e96] w-fit h-[40px] hover:bg-gray-400'}>Learn more</Button>
            <Button handleOnclick={handleAddProductToCart} style={'px-[10px] rounded-md text-white bg-[#0a66c2] w-fit h-[40px] hover:bg-blue-400 flex items-center gap-1'}><FaCartPlus /> Add to cart</Button>
            </div>
        </div>
        <div className='absolute right-2 top-2 w-fit h-fit px-[8px] py-[4px] bg-[#0a66c2] text-white rounded-md'>
            <span className='text-[14px] flex items-center font-medium'>{`${formatPrice(formatPricee(productData?.price))} VNĐ`}</span>
        </div>
    </div>
  )
}

export default memo(Product)