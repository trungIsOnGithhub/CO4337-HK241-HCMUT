import { Button } from 'components'
import React from 'react'
import { MdOutlineCategory } from "react-icons/md";
import { useSelector } from 'react-redux';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { formatPrice, formatPricee } from 'ultils/helper';
import path from 'ultils/path';
import clsx from 'clsx'


const ServiceItem = ({serviceData, providerData}) => {
    const navigate = useNavigate()
    const location = useLocation()
    const current = useSelector

    const handleNavigateServiceDetail = () => {
        navigate(`/service/${serviceData?.category?.toLowerCase()}/${serviceData?._id}/${serviceData?.name}`)
    }

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
    <div className='w-full h-fit rounded-md border border-[#868e96] relative cursor-pointer'>
        <div className='w-full h-[150px]' onClick={()=>{navigate(`/service/${serviceData?.category?.toLowerCase()}/${serviceData?._id}/${serviceData?.name}`)}}>
            <img className='h-full w-full object-cover rounded-t-md' src={serviceData?.thumb} alt={serviceData?.name} />
        </div>
        <div className={clsx('w-full h-[184px] rounded-b-md px-[16px] py-[12px] flex flex-col justify-between',  providerData?.theme === 'dark' ? 'bg-[#212529]' : providerData?.theme === 'light' ? 'bg-white' : '')}>
            <div className='w-full flex flex-col gap-1'>
                <span className='text-[18px] font-medium line-clamp-1'>{serviceData?.name}</span>
                <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Duration <span   className={clsx('font-medium', providerData?.theme === 'dark' ? 'text-white' : providerData?.theme === 'light' ? 'text-black' : '')}>{`${serviceData?.duration}min`}</span></span>
                <span className='text-[14px] text-[#868e96] flex items-center gap-2'><span className='flex gap-1 items-center'><MdOutlineCategory /> Category</span> <span className='font-medium'>{`${serviceData?.category}`}</span></span>
            </div>
            <div className='flex justify-between'>
            <Button handleOnclick={handleNavigateServiceDetail} style={clsx('px-[23px] rounded-md w-fit h-[40px] hover:opacity-50', providerData?.theme === 'dark' ? 'text-white border border-[#868e96]' : providerData?.theme === 'light' ? 'text-black border border-gray-200 shadow-sm' : '')}> Learn more</Button>
            <Button handleOnclick={handleBookService} style={clsx('px-[23px] rounded-md text-white w-fit h-[40px] hover:opacity-50', providerData?.theme === 'dark' ? 'bg-[#15a9e8]' : providerData?.theme === 'light' ? 'bg-[#191eb9]' : '')}> Book now</Button>
            </div>
        </div>
        <div className={clsx('absolute right-2 top-2 w-fit h-fit px-[8px] py-[4px] rounded-md',providerData?.theme === 'dark' ? 'bg-[#494e53]' : providerData?.theme === 'light' ? 'bg-[rgba(230,235,239,1)]' : '')}>
            <span className='text-[14px] flex items-center font-medium'>{`${formatPrice(formatPricee(serviceData?.price))} VNĐ`}</span>
        </div>
    </div>
  )
}

export default ServiceItem