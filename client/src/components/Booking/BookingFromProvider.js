import Button from 'components/Buttons/Button'
import React from 'react'
import { MdOutlineCategory } from 'react-icons/md'
import { useSelector } from 'react-redux'
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { formatPrice, formatPricee, renderStarfromNumber } from 'ultils/helper'
import path from 'ultils/path'

const BookingFromProvider = ({providerData, serviceData}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const {current} = useSelector(state => state.user)

  const handleBookService = async() => { 
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
  return (
    <div className='w-full h-[110px] bg-[#343a40] border border-[#868e96] rounded-md shadow-sm flex justify-between items-center px-[16px] py-[12px] cursor-pointer'>
      <div className='flex gap-4 items-start h-full' onClick={()=>{navigate(`/service/${serviceData?.category?.toLowerCase()}/${serviceData?._id}/${serviceData?.name}`)}}>
        <img src={serviceData?.thumb} alt='serviceImage' className='w-[84px] h-[84px] object-cover rounded-md border border-gray-500 shadow-md'/>
        <div className='flex flex-col h-full justify-between'>
          <div className='flex flex-col gap-1'>
            <span className='capitalize text-white font-semibold text-lg'>{serviceData?.name}</span>
            <div className='flex items-center gap-4'>
            <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Duration <span className='text-white font-medium'>{`${serviceData?.duration}min`}</span></span>
            <span className='text-[14px] text-[#868e96] flex items-center gap-2'><span className='flex gap-1 items-center'><MdOutlineCategory /> Category</span> <span className='font-medium'>{`${serviceData?.category}`}</span></span>
            </div>
          </div>
          <span className='flex text-xs pb-[2px]'>
            {renderStarfromNumber(serviceData?.totalRatings)?.map((el,index)=>(
              <span key={index}>{el}</span>
            ))}
          </span>
        </div>
      </div>
      <div className='flex flex-col h-[84px] justify-between items-end my-auto'>
        <div className='w-fit h-fit px-[8px] py-[4px] bg-[#494e53] rounded-md'>
          <span className='text-[14px] flex items-center font-medium'>{`${formatPrice(formatPricee(serviceData?.price))} VNĐ`}</span>
        </div>
        <Button handleOnclick={handleBookService} style={`px-4 py-1 rounded-md text-white font-semibold my-2 bg-[#15a9e8] w-fit`}>
          Choose
        </Button>
      </div>
    </div>
  )
}

export default BookingFromProvider
