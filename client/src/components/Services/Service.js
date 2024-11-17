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

const Service = ({serviceData}) => {
  const [isShowOption, setIsShowOption] = useState(false)
  const {current} = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  const handleNavigateLearnMoreService = ( ) => {
    navigate(`/service/${serviceData?.sv?.category?.toLowerCase()}/${serviceData?.sv?._id}/${serviceData?.sv?.name}`)
  }

  const handleNavigateBookService = () => {
    if(!current){
      return Swal.fire({
        name: "You haven't logged in",
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
    else{
      navigate({
        pathname: `/${path.BOOKING}`,
        search: createSearchParams({sid: serviceData?.sv?._id}).toString()
    })
    }
  }

  return (
    <div className='cursor-pointer w-full h-fit rounded-md relative shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300'>
        <div className='w-full h-[150px]' onClick={()=>{navigate(`/service/${serviceData?.sv?.category?.toLowerCase()}/${serviceData?.sv?._id}/${serviceData?.sv?.name}`)}}>
            <img className='h-full w-full object-cover rounded-t-md' src={serviceData?.sv?.thumb} alt={serviceData?.sv?.name} />
        </div>
        <div className='w-full h-[184px] rounded-b-md px-[16px] py-[12px] flex flex-col justify-between'>
            <div className='w-full flex flex-col gap-1'>
                <span className='text-[18px] font-medium line-clamp-1'>{serviceData?.sv?.name}</span>
                <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Duration <span className='text-black font-medium'>{`${serviceData?.sv?.duration}min`}</span></span>
                <span className='text-[14px] text-[#868e96] flex items-center gap-2'><span className='flex gap-1 items-center'><MdOutlineCategory /> Category</span> <span className='font-medium'>{`${serviceData?.sv?.category}`}</span></span>
            </div>
            <div className='flex justify-between'>
            <Button handleOnclick={handleNavigateLearnMoreService} style={'px-[23px] rounded-md text-black border border-[#868e96] w-fit h-[40px] hover:bg-gray-400'}>Learn more</Button>
            <Button handleOnclick={handleNavigateBookService} style={'px-[23px] rounded-md text-white bg-[#0a66c2] w-fit h-[40px] hover:bg-blue-400'}>Book now</Button>
            </div>
        </div>
        <div className='absolute right-2 top-2 w-fit h-fit px-[8px] py-[4px] bg-[#0a66c2] text-white rounded-md'>
            <span className='text-[14px] flex items-center font-medium'>{`${formatPrice(formatPricee(serviceData?.sv?.price))} VNĐ`}</span>
        </div>
    </div>
  )
}

export default memo(Service)