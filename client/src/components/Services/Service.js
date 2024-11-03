import React, {memo, useState}from 'react'
import {formatPrice, formatPricee} from 'ultils/helper'
import label from 'assets/label.png'
import label_trend from 'assets/label_trending.png'
import {renderStarfromNumber} from 'ultils/helper'
import {Button, SelectOption} from 'components'
import icons from 'ultils/icon'
import withBaseComponent from 'hocs/withBaseComponent'
import { showModal } from 'store/app/appSlice'
import { DetailService } from 'pages/public'
import { apiUpdateCartService, apiUpdateWishlist } from 'apis'
import { toast } from 'react-toastify'
import { getCurrent } from 'store/user/asyncAction'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import path from 'ultils/path'
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { MdOutlineCategory } from 'react-icons/md'
const {FaEye, FaHeart, FaCartPlus, BsCartCheckFill} = icons

const Service = ({serviceData, fullWidth = false, clientDistance = null}) => {
  const [isShowOption, setIsShowOption] = useState(false)
  const {current} = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  console.log(serviceData)


  return (
    // <div className={'text-base px-[10px]' + (fullWidth ? 'w-full' : '')}>
    //   <div 
    //     onClick={()=> navigate(`/service/${serviceData?.sv?.category?.toLowerCase()}/${serviceData?._id}/${serviceData.name}`)}
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
    //     {isShowOption && <div className='absolute bottom-[-10px] left-0 right-0 flex justify-center gap-2 animate-slide-top'>
    //         {
    //           current?.wishlist?.some(el => el._id === serviceData._id) ? 
    //           <span title='Wishlist' onClick={(e)=>{e.stopPropagation(); handleClickOptions('Heart')}}><SelectOption icon={<FaHeart color='#ff1493'/>}/></span>
    //           :
    //           <span title='Add to WishList' onClick={(e)=>{e.stopPropagation(); handleClickOptions('Heart')}}><SelectOption icon={<FaHeart />}/></span>
    //         }
    //         {
    //           current?.cart?.some(el => el?.product?._id === serviceData._id) ? 
    //           <span title='Added'><SelectOption icon={<BsCartCheckFill color='green' />}/></span>
    //           :
    //           <span title='Add to Cart' onClick={(e)=>{e.stopPropagation(); handleClickOptions('Cart')}}><SelectOption icon={<FaCartPlus />}/></span>
    //         }
    //         <span title='Quick View' onClick={(e)=>{e.stopPropagation(); handleClickOptions('Eye')}}><SelectOption icon={<FaEye />}/></span>
    //       </div>}
    //       <img src={serviceData?.thumb||'https://nayemdevs.com/wp-content/uploads/2020/03/default-product-image.png'} 
    //       className='w-[243px] h-[243px] object-cover'/>
    //     </div>
    //     <div className='flex flex-col mt-[15px] items-start gap-1 w-full'>
    //       <span className='flex h-4'>{renderStarfromNumber(serviceData?.totalRatings)?.map((el,index)=>(
    //         <span key={index}>{el}</span>
    //       ))}</span>
    //       <span className='line-clamp-1 text-base font-semibold'>{serviceData?.name}</span>
    //       <span className='font-bold text-sm'>{serviceData?.duration} minutes</span>
    //       <span>{`${formatPrice(serviceData?.price)} VND`}</span>
    //       <span
    //         style={{
    //           textAlign: 'right',
    //           color: 'blue',
    //           width: '100%'
    //         }}
    //       >{`${serviceData?.category}`}</span>
    //       { clientDistance && !isNaN(clientDistance) && <span
    //         style={{
    //           textAlign: 'center',
    //           color: 'red',
    //           width: '100%'
    //         }}
    //       >{`${Math.floor(clientDistance/1000.0)}km from current location!`}</span>}
    //     </div>
    //   </div>
    // </div>
    <div className='cursor-pointer w-full h-fit rounded-md relative shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300'>
        <div className='w-full h-[150px]'>
            <img className='h-full w-full object-cover rounded-t-md' src={serviceData?.sv?.thumb} alt={serviceData?.sv?.name} />
        </div>
        <div className='w-full h-[184px] rounded-b-md px-[16px] py-[12px] flex flex-col justify-between'>
            <div className='w-full flex flex-col gap-1'>
                <span className='text-[18px] font-medium line-clamp-1'>{serviceData?.sv?.name}</span>
                <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Duration <span className='text-black font-medium'>{`${serviceData?.sv?.duration}min`}</span></span>
                <span className='text-[14px] text-[#868e96] flex items-center gap-2'><span className='flex gap-1 items-center'><MdOutlineCategory /> Category</span> <span className='font-medium'>{`${serviceData?.sv?.category}`}</span></span>
            </div>
            <div className='flex justify-between'>
            <Button style={'px-[23px] rounded-md text-black border border-[#868e96] w-fit h-[40px]'}> Learn more</Button>
            <Button style={'px-[23px] rounded-md text-white bg-[#0a66c2] w-fit h-[40px]'}> Book now</Button>
            </div>
        </div>
        <div className='absolute right-2 top-2 w-fit h-fit px-[8px] py-[4px] bg-[#0a66c2] text-white rounded-md'>
            <span className='text-[14px] flex items-center font-medium'>{`${formatPrice(formatPricee(serviceData?.sv?.price))} VNĐ`}</span>
        </div>
    </div>
  )
}

export default memo(Service)