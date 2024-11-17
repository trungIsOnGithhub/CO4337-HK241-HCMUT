import React, {memo, useEffect, useState}from 'react'
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
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
const {FaEye, FaHeart, FaCartPlus, BsCartCheckFill} = icons

const ServiceItemWishList = ({serviceData}) => {
  const [isShowOption, setIsShowOption] = useState(false)
  const {current} = useSelector(state => state.user)
  const {isLogin} = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    if(current?.wishlist?.some(el => el?._id === serviceData?._id)){
      setIsWishlisted(true)
    }
    else{
      setIsWishlisted(false)
    }
  }, [current, serviceData]);

  const handleNavigateLearnMoreService = ( ) => {
    navigate(`/service/${serviceData?.category?.toLowerCase()}/${serviceData?._id}/${serviceData?.name}`)
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
        pathname:  `/${path.BOOKING}`,
        search: createSearchParams({sid: serviceData?._id}).toString()
    })
    }
  }

  const handleWishlist = async() => {
    if(!isLogin){
      Swal.fire({
          text: 'Login to add wishlist',
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
      const response = await apiUpdateWishlist({sid: serviceData?._id})
      if(response.success){
        dispatch(getCurrent())
        toast.success(response.mes)
      }
      else{
        toast.error(response.mes)
      }
    }
  }

  return (
    <div className='cursor-pointer w-full h-fit rounded-md relative shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300'>
      <button
        onClick={handleWishlist}
        className="absolute top-2 left-2 group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full p-2 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="transition-transform duration-300 ease-in-out transform group-hover:scale-125">
          {isWishlisted ? (
            <AiFillHeart className="w-6 h-6 text-red-500 transition-colors duration-300 animate-pulse" />
          ) : (
            <AiOutlineHeart className="w-6 h-6 text-red-500 hover:text-red-600 transition-colors duration-300" />
          )}
        </div>
      </button>

        <div className='w-full h-[150px]' onClick={()=>{navigate(`/service/${serviceData?.category?.toLowerCase()}/${serviceData?._id}/${serviceData?.name}`)}}>
            <img className='h-full w-full object-cover rounded-t-md' src={serviceData?.thumb} alt={serviceData?.name} />
        </div>
        <div className='w-full h-[184px] rounded-b-md px-[16px] py-[12px] flex flex-col justify-between'>
            <div className='w-full flex flex-col gap-1'>
                <span className='text-[18px] font-medium line-clamp-1'>{serviceData?.name}</span>
                <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Duration <span className='text-black font-medium'>{`${serviceData?.duration}min`}</span></span>
                <span className='text-[14px] text-[#868e96] flex items-center gap-2'><span className='flex gap-1 items-center'><MdOutlineCategory /> Category</span> <span className='font-medium'>{`${serviceData?.category}`}</span></span>
            </div>
            <div className='flex justify-between'>
            <Button handleOnclick={handleNavigateLearnMoreService} style={'px-[23px] rounded-md text-black border border-[#868e96] w-fit h-[40px] hover:bg-gray-400'}>Learn more</Button>
            <Button handleOnclick={handleNavigateBookService} style={'px-[23px] rounded-md text-white bg-[#0a66c2] w-fit h-[40px] hover:bg-blue-400'}>Book now</Button>
            </div>
        </div>
        <div className='absolute right-2 top-2 w-fit h-fit px-[8px] py-[4px] bg-[#0a66c2] text-white rounded-md'>
            <span className='text-[14px] flex items-center font-medium'>{`${formatPrice(formatPricee(serviceData?.price))} VNĐ`}</span>
        </div>
    </div>
  )
}

export default memo(ServiceItemWishList)