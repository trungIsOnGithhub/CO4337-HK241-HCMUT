import React, { memo, useCallback, useEffect, useState } from 'react'
import Slider from "react-slick";
import {Button, Service} from '..'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { MdOutlineCategory } from 'react-icons/md';
import { formatPrice, formatPricee } from 'ultils/helper';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';
import path from 'ultils/path';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';



const CustomSliderService = ({services, normal}) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate()
  const location = useLocation()
  const {current} = useSelector(state => state.user)

  const nextSlide = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % services.length);
  }, [services.length]);
  
  const prevSlide = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + services.length) % services.length);
  }, [services.length]);
  
  const displayedServices = [
    services[currentIndex],
    services[(currentIndex + 1) % services.length],
    services[(currentIndex + 2) % services.length],
  ];

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }

    setTouchEnd(null);
    setTouchStart(null);
  };

  const handleKeyPress = useCallback((e) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const handleNavigateLearnMoreService = (serviceData) => {
    navigate(`/service/${serviceData?.category?.toLowerCase()}/${serviceData?._id}/${serviceData?.name}`)
  }

  const handleBookService = (serviceData) => {
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
        search: createSearchParams({sid: serviceData?._id}).toString()
    })
    }
  }
  return (
    <div 
      className="max-w-7xl mx-auto px-4 py-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative" role="region" aria-label="Services carousel">
        <div className="flex items-stretch gap-8 transition-transform duration-300 ease-in-out">
          {displayedServices.map((service,idx) => (
            <div
              key={service?.sv?._id}
              className="flex-1 h-fit rounded-md relative shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <div className='w-full h-[150px]' onClick={()=>{navigate(`/service/${service?.sv?.category?.toLowerCase()}/${service?.sv?._id}/${service?.sv?.name}`)}}>
                <img className='h-full w-full object-cover rounded-t-md' src={service?.sv?.thumb} alt={service?.sv?.name} />
              </div>
              <div className='w-full h-[184px] rounded-b-md px-[12px] py-[8px] flex flex-col justify-between'>
                <div className='w-full flex flex-col gap-1'>
                    <span className='text-[18px] font-medium line-clamp-1'>{service?.sv?.name}</span>
                    <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Duration <span className='text-black font-medium'>{`${service?.sv?.duration}min`}</span></span>
                    <span className='text-[14px] text-[#868e96] flex items-center gap-2'><span className='flex gap-1 items-center'><MdOutlineCategory /> Category</span> <span className='font-medium'>{`${service?.sv?.category}`}</span></span>
                </div>
                <div className='flex justify-between'>
                  <Button handleOnclick={()=>handleNavigateLearnMoreService(service?.sv)} style='px-[18px] rounded-md text-black border border-[#868e96] w-fit h-[40px] font-medium text-sm bg-white hover:bg-gray-200'> Learn moree</Button>
                  <Button handleOnclick={()=>handleBookService(service?.sv)} style='px-[18px] rounded-md text-white bg-[#0a66c2] w-fit h-[40px] font-medium text-sm hover:bg-blue-600' cytest={"book_srv_from_slider_idx_"+idx}> Book now</Button>
                </div>
              </div>
              <div className='absolute right-2 top-2 w-fit h-fit px-[8px] py-[4px] bg-[#0a66c2] text-white rounded-md'>
                <span className='text-[14px] flex items-center font-medium'>{`${formatPrice(formatPricee(service?.sv?.price))} VNĐ`}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Previous slide"
        >
          <FaArrowLeft className="text-blue-500" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Next slide"
        >
          <FaArrowRight className="text-blue-500" />
        </button>
      </div>
    </div>
  )
}

export default memo(CustomSliderService)