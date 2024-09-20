import React, {memo, useState, useEffect} from 'react'
import {formatPrice} from 'ultils/helper'
import label from 'assets/label.png'
import label_trend from 'assets/label_trending.png'
import {renderStarfromNumber} from 'ultils/helper'
import icons from 'ultils/icon'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import defaultProvider from '../../assets/defaultProvider.jpg'

const Provider = ({providerData, isNotBorder, fullWidth = false, userLatitude, userLongitude}) => {
  const navigate = useNavigate()
  const [distance, setDistance] = useState(-1)
  const GOONG_API_KEY = '2jcRRCquuKp2hdK4BcQsMZLsrJuXSNuXYlfcWXyA';

  useEffect(() => {
    const calculateDistance = async () => {
      // if (userLatitude && userLongitude && providerData?.latitude && providerData?.longitude) {
      //   const directionsResponse = await fetch(`https://rsapi.goong.io/Direction?origin=${userLatitude},${userLongitude}&destination=${providerData?.latitude},${providerData?.longitude}&vehicle=car&api_key=${GOONG_API_KEY}`);
      //   const data = await directionsResponse.json();
      //   if (data && data.routes && data.routes.length > 0) {
      //     setDistance(data.routes[0].legs[0].distance.value / 1000); // Set distance in kilometers
      //   }
      // }
    }

    calculateDistance()
  }, [userLatitude, userLongitude, providerData])

  return (
    <div className={'text-base px-[10px]' + (fullWidth ? 'w-full' : '')}>
      <div 
        onClick={()=> navigate(`/detail_provider/${providerData?._id}`)}
        className={isNotBorder ? 'w-full p-[15px] flex flex-col items-center cursor-pointer' : 'w-full border p-[15px] flex flex-col items-center cursor-pointer'} 
      >
        <div className='w-full relative'>
          <img src={providerData?.images[0]||defaultProvider} 
          className='w-full h-[250px] object-cover'/>
        </div>
        <div className='flex flex-col mt-[15px] items-start gap-1 w-full'>
          <span className='flex h-4'>{renderStarfromNumber(providerData?.totalRatings)?.map((el,index)=>(
            <span key={index}>{el}</span>
          ))}</span>
          <span className='line-clamp-1 text-lg capitalize font-semibold text-center w-full'>{providerData?.bussinessName}</span>
          {distance >= 0 ? <span className='text-xs text-blue-500 font-semibold text-center w-full'>Khoảng cách: {distance.toFixed(2)} km</span> : <span className='text-xs text-blue-500 font-semibold text-center w-full'>Khoảng cách: Chưa xác định</span>}
        </div>
      </div>
    </div>
  )
}

export default Provider