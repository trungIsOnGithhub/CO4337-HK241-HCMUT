import React, { useEffect, useState } from 'react'
import { FiClock, FiCalendar } from "react-icons/fi";
import { formatPrice, formatPricee } from 'ultils/helper';
import DOMPurify from 'dompurify';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';
import path from 'ultils/path';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const FlashSaleItem = ({flashsaleData}) => {

  const [timeLeft, setTimeLeft] = useState("");
  const navigate = useNavigate();
  const location = useLocation()
  const {current} = useSelector(state => state.user)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endDate = new Date("2023-07-31T23:59:59");
      const difference = endDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("Sale Ended");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${monthNames[parseInt(month) - 1]} ${day}, ${year}`;
  };

  const handleMoveServicePage = async(serviceId) => {
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
        search: createSearchParams({sid: serviceId}).toString()
    })
    }
  }

  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden m-4 transition-all duration-300 ease-in-out transform hover:scale-105 border border-gray-300">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img
            className="h-28 w-full object-cover md:w-28"
            src={flashsaleData?.serviceThumb}
            alt="Flash Sale Service"
          />
        </div>
        <div className="p-4">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            Flash Sale
          </div>
          <h2
            className="mt-1 text-base leading-tight font-medium text-black hover:underline line-clamp-1"
            tabIndex="0"
          >
            {flashsaleData?.serviceName}
          </h2>
          <div className="mt-4">
            <span className="text-gray-500 line-through mr-2 text-sm">{` ${formatPrice(formatPricee(flashsaleData?.serviceOriginalPrice))} VNĐ`}</span>
            <span className="text-base font-bold text-green-600">{` ${formatPrice(formatPricee(flashsaleData?.serviceFlashSalePrice))} VNĐ`}</span>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <FiClock className="mr-2" />
            <span>{`Start at: ${flashsaleData?.startTime}`}</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <FiCalendar className="mr-2" />
            <span>{`Sale starts: ${formatDate(flashsaleData?.promotionApplicationDate)}`}</span>
          </div>
          <button
            className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            tabIndex="0"
            onClick={()=>handleMoveServicePage(flashsaleData?.serviceId)}
          >
            Grab the Deal
          </button>
        </div>
      </div>
    </div>
  )
}

export default FlashSaleItem
