import { apiGetOneService, apiGetServiceProviderById } from 'apis'
import clsx from 'clsx'
import { Button } from 'components'
import React, { useEffect, useState } from 'react'
import { FaRegClock } from 'react-icons/fa'
import { FaLocationDot } from 'react-icons/fa6'
import { useSelector } from 'react-redux'
import { createSearchParams, useLocation, useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { formatPrice, formatPricee } from 'ultils/helper'
import path from 'ultils/path'

const DetailProviderService = () => {
  const {prid, sid} = useParams()
  const [variable, setVariable] = useState("")
  const [providerData, setProviderData] = useState(null)
  const [serviceData, setServiceData] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const {current} = useSelector(state => state.user)

  useEffect(() => {
    const fetchProviderData = async() => {
      const response = await apiGetServiceProviderById(prid)
      if(response?.success){
        setProviderData(response?.payload)
      }
    }
    fetchProviderData()
  }, [prid])

  useEffect(() => {
    const fetchServiceData = async() => {
      const response = await apiGetOneService(sid)
      if(response?.success){
        setServiceData(response?.service)
      }
    }
    fetchServiceData()
  }, [sid])

  const handleNavigateBookService = () =>{
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
        pathname:  `/detail_provider/${providerData?._id}/book`,
        search: createSearchParams({sid: serviceData?._id}).toString()
      })
    }
  }
  return (
    <div className='w-full'>
      <div className={clsx('w-full fixed top-0 left-0 h-[86px] flex justify-center z-[100]', providerData?.theme === 'dark' && 'bg-[#212529] text-white')}>
        <div className='w-[90%] h-full flex gap-10 items-center text-[15px]'>
          <span onClick={()=>{setVariable('service')}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'service' && 'border-b-2 border-[#15a9e8]')}>Service</span>
          <span onClick={()=>{setVariable('book')}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'book' && 'border-b-2 border-[#15a9e8]')}>Book Now</span>
          <span onClick={()=>{setVariable('product')}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'product' && 'border-b-2 border-[#15a9e8]')}>Product</span>
          <span onClick={()=>{setVariable('blog')}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'blog' && 'border-b-2 border-[#15a9e8]')}>Blog</span>
          <span onClick={()=>{setVariable('find-us')}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'find-us' && 'border-b-2 border-[#15a9e8]')}>Find us</span>
          <span onClick={()=>{setVariable('faq')}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'faq' && 'border-b-2 border-[#15a9e8]')}>FAQ</span>
          <span onClick={()=>{setVariable('chat')}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'chat' && 'border-b-2 border-[#15a9e8]')}>Chat</span>
        </div>
      </div>
      <div className='w-full h-[86px]'></div>
      <div className={clsx('w-full h-[fit] flex justify-center', providerData?.theme === 'dark' &&  'bg-[#343a40] text-white')}>
        <div className='w-[90%] mt-[24px] mb-[48px] bg-[#212529] px-[32px] pt-[36px] pb-[48px] rounded-xl flex flex-col'>
          <div className='flex gap-8 pb-8 border-b border-[#343a40]'>
            <div className='w-[35%] flex flex-col justify-between'>
              <div className='w-full h-fit flex items-center gap-4'>
                <img className='w-[64px] h-[64px] object-cover rounded-lg shadow-inner' src={serviceData?.thumb} alt='smallThumb' />
                <span className='text-[38px] font-semibold leading-10'>{serviceData?.name}</span>
              </div>
              <div className='w-full border-t border-[#343a40] flex flex-col gap-2 pt-4'>
                <span className='flex items-center gap-4'>
                  <FaRegClock color='#868e96' size={20}/>
                  <span className='font-semibold text-[15px]'>{`${serviceData?.duration}min duration`}</span>
                </span>
                <span className='flex items-center gap-4'>
                  <FaLocationDot color='#868e96' size={20}/>
                  <span className='font-semibold text-[15px] line-clamp-2'>{serviceData?.provider_id?.address}</span>
                </span>
              </div>
              <div className='w-full h-[100px] bg-[#343a40] rounded-md px-[16px] p-[16px] flex flex-col items-center gap-2'>
                <span className='text-[22px] font-semibold leading-7'>{`${formatPrice(formatPricee(serviceData?.price))} VNĐ`}</span>
                <Button handleOnclick={handleNavigateBookService} style={'px-[23px] rounded-md text-white bg-[#15a9e8] w-[70%] h-[40px]'}>Book now</Button>
              </div>
            </div>
            <div className='w-[65%]'>
              <img className='w-full h-[326px] object-cover rounded-lg shadow-sm shadow-white' src={serviceData?.thumb} alt='serviceThumb'/>
            </div>
          </div>
          <div className='flex flex-col gap-4 pt-[40px] pb-8 border-b border-[#343a40]'>
            <span className='text-[18px] leading-6 font-semibold'>Employee</span>
            <div className='flex gap-4 flex-wrap'>
              {
                serviceData?.assigned_staff?.map(el => (
                  <div className='w-1/6 h-[108px] p-[16px] bg-[#343a40] rounded-md flex flex-col gap-1 justify-center items-center'>
                    <img src={el?.avatar} className='w-[48px] h-[48px] object-cover rounded-full'/>
                    <span className='text-[14px] leading-5 font-medium'>{`${el?.lastName} ${el?.firstName}`}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailProviderService
