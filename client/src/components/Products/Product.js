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
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  const handleClickOptions = async (flag) => {
    if(flag === 'Cart'){
      if(!current){
        return Swal.fire({
          title: "You haven't logged in",
          text: 'Please login and try again',
          icon: 'warning',
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: 'Go to Login',
          cancelButtonText: 'Not now',                
        }).then((rs)=>{
          if(rs.isConfirmed){
            navigate({
              pathname: `/${path.LOGIN}`,
              search: createSearchParams({
                redirect: location.pathname}).toString(),
            })
          }
        })
      }
      const response = await apiUpdateCartProduct({
          pid: productData?._id, 
          color: productData?.color, 
          quantity: 1, 
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
    if(flag === 'Heart'){
      const response = await apiUpdateWishlist({pid: productData?._id})
      if(response.success){
        dispatch(getCurrent())
        toast.success(response.mes)
      }
      else{
        toast.error(response.mes)
      }
    }
    if(flag === 'Eye'){
      dispatch(showModal({isShowModal: true, modalChildren: <DetailProduct data={{pid: productData?._id, category: productData?.category}} isQuickView={true} />}))
    }
  } // handleClickOptions

  return (
    // <div className='w-full text-base px-[10px]'>
    //   <div 
    //     onClick={()=> navigate(`/product/${productData?.category?.toLowerCase()}/${productData?._id}/${productData.title}`)}
    //     className={isNotBorder ? 'w-full p-[15px] flex flex-col items-center cursor-pointer' : 'w-full border p-[15px] flex flex-col items-center cursor-pointer'} 
    //     onMouseEnter = {e => {
    //       // e.stopPropagation();
    //       setIsShowOption(true)
    //     }}
    //     onMouseLeave = {e => {
    //       e.stopPropagation();
    //       setIsShowOption(false)
    //     }}
    //   >
    //     <div className='w-full relative'>
    //       {isShowOption && <div className='absolute bottom-[-10px] left-0 right-0 flex justify-center gap-2 animate-slide-top'>
    //         {
    //           current?.wishlist?.some(el => el._id === productData._id) ? 
    //           <span title='Wishlist' onClick={(e)=>{e.stopPropagation(); handleClickOptions('Heart')}}><SelectOption icon={<FaHeart color='#ff1493'/>}/></span>
    //           :
    //           <span title='Add to WishList' onClick={(e)=>{e.stopPropagation(); handleClickOptions('Heart')}}><SelectOption icon={<FaHeart />}/></span>
    //         }
    //         {
    //           current?.cart?.some(el => el?.product?._id === productData._id) ? 
    //           <span title='Added'><SelectOption icon={<BsCartCheckFill color='green' />}/></span>
    //           :
    //           <span title='Add to Cart' onClick={(e)=>{e.stopPropagation(); handleClickOptions('Cart')}}><SelectOption icon={<FaCartPlus />}/></span>
    //         }
    //         <span title='Quick View' onClick={(e)=>{e.stopPropagation(); handleClickOptions('Eye')}}><SelectOption icon={<FaEye />}/></span>
    //       </div>}
    //       <img src={productData?.thumb||'https://nayemdevs.com/wp-content/uploads/2020/03/default-product-image.png'} 
    //       className='w-[243px] h-[243px] object-cover'/>
    //       {!normal && <img src={isNew? label : label_trend} className={`absolute top-[-12px] left-[-25px] ${isNew ? 'w-[70px]' : 'w-[100px]'} h-[25px] object-cover`}></img>&&
    //       <span className='font-bold absolute top-[-12px] left-[-16px] text-white'>{isNew?'New':'Trending'}</span>}
    //     </div>
    //     <div className='flex flex-col mt-[15px] items-start gap-1 w-full'>
    //       <span className='flex h-4'>{renderStarfromNumber(productData?.totalRatings)?.map((el,index)=>(
    //         <span key={index}>{el}</span>
    //       ))}</span>
    //       <span className='line-clamp-1'>{productData?.title}</span>
    //       <span>{`${formatPrice(productData?.price)} VND`}</span>
    //     </div>
    //   </div>
    // </div>
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
            <Button style={'px-[23px] rounded-md text-black border border-[#868e96] w-fit h-[40px]'}> Learn more</Button>
            <Button style={'px-[23px] rounded-md text-white bg-[#0a66c2] w-fit h-[40px]'}> Buy now</Button>
            </div>
        </div>
        <div className='absolute right-2 top-2 w-fit h-fit px-[8px] py-[4px] bg-[#0a66c2] text-white rounded-md'>
            <span className='text-[14px] flex items-center font-medium'>{`${formatPrice(formatPricee(productData?.price))} VNĐ`}</span>
        </div>
    </div>
  )
}

export default memo(Product)