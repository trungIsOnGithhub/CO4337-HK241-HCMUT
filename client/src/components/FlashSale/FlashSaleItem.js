import React, { useEffect, useState } from 'react'
import { FiClock, FiCalendar } from "react-icons/fi";
import { formatPrice, formatPricee } from 'ultils/helper';
import DOMPurify from 'dompurify';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';
import path from 'ultils/path';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { FaBolt } from 'react-icons/fa';

const FlashSaleItem = ({flashsaleData}) => {

  const [timeLeft, setTimeLeft] = useState("");
  const navigate = useNavigate();
  const location = useLocation()
  const {current} = useSelector(state => state.user)

  console.log(flashsaleData)

  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    const flashInterval = setInterval(() => {
      setIsFlashing((prev) => !prev);
    }, 500);

    return () => clearInterval(flashInterval);
  }, []);

  return (
    <div className={`w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden m-4 transition-all duration-300 ease-in-out transform hover:scale-105 z-[1000] border cursor-pointer ${isFlashing ? "border-[#0a66c2]" : "border-gray-600"}`}>
      <div className={`md:flex items-center p-2 gap-2`}>
        <div className="md:flex-shrink-0">
          <img
            className="h-28 w-28 rounded-md object-cover my-auto"
            src={flashsaleData?.serviceThumb}
            alt="Flash Sale Service"
          />
        </div>
        <div className="px-2 py-1 flex flex-1 flex-col items-center gap-1">
          <div
            className={`text-xl font-bold text-right ${
              isFlashing ? "text-[#0a66c2]" : "text-gray-600"
            }`}
          >
            FLASH SALE
          </div>
          <h2
            className="text-base leading-tight font-medium text-black hover:underline line-clamp-1"
            tabIndex="0"
          >
            {flashsaleData?.serviceName}
          </h2>
          <div className="flex gap-1 items-center">
            <span className="text-gray-500 line-through mr-2 text-sm">{` ${formatPrice(formatPricee(flashsaleData?.serviceOriginalPrice))} VNĐ`}</span>
            <div className='text-sm font-semibold w-fit text-white bg-[#0a66c2] px-2 rounded-md'>{flashsaleData?.type === 'percentage' ? `- ${flashsaleData?.value}%` : `- ${flashsaleData?.value}VNĐ`}</div>
          </div>
          <div>
            <span className="text-base font-bold text-[#0a66c2]">{` ${formatPrice(formatPricee(flashsaleData?.serviceFlashSalePrice))} VNĐ`}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlashSaleItem
