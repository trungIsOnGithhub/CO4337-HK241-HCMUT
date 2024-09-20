import Button from 'components/Buttons/Button'
import React from 'react'
import { useSelector } from 'react-redux'
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { formatPrice, renderStarfromNumber } from 'ultils/helper'
import path from 'ultils/path'

const BookingFromProvider = ({serviceData}) => {
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
    <div className='w-full h-[150px] border border-gray-600 rounded-md shadow-sm flex justify-between'>
      <div className='flex gap-4 items-start my-auto pl-4 h-[120px]'>
        <img src={serviceData?.thumb} alt='serviceImage' className='w-[120px] h-full rounded-md border border-gray-500 shadow-md'/>
        <div className='flex flex-col h-full justify-between py-1'>
          <div className='flex flex-col gap-2'>
            <span className='capitalize text-gray-800 font-semibold text-lg'>{serviceData?.name}</span>
            <span>{`Duration: ${serviceData?.duration} minutes`}</span> 
          </div>
          <span className='flex h-4'>
            {renderStarfromNumber(serviceData?.totalRatings)?.map((el,index)=>(
              <span key={index}>{el}</span>
            ))}
          </span>
        </div>
      </div>
      <div className='flex flex-col h-[120px] justify-between my-auto pr-8'>
        <span className='text-gray-800 font-semibold text-lg capitalize'>{`${formatPrice(serviceData?.price)} VND`}</span>
        <Button handleOnclick={handleBookService} style={`px-4 py-1 rounded-md text-white font-semibold my-2 bg-blue-500 w-fit`}>
          Book now
        </Button>
      </div>
    </div>
  )
}

export default BookingFromProvider
