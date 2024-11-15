import React, { useEffect, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { apiGetOneOrderByAdmin } from 'apis/order';
import moment from 'moment';
import { Pagination } from 'components';
import { FiCalendar, FiUser, FiBriefcase, FiClock, FiDollarSign } from 'react-icons/fi';
import { IoIosTimer } from "react-icons/io";
import { FaTags } from "react-icons/fa";
import { AiOutlineUser, AiOutlineTeam } from 'react-icons/ai';  // New icons for Customer and Staff
import path from 'ultils/path';
import withBaseComponent from 'hocs/withBaseComponent';
import { formatPrice, formatPricee } from 'ultils/helper';

const ManageBookingDetail = ({ dispatch, navigate }) => {
  const [params] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const fetchBookingData = async () => {
    const response = await apiGetOneOrderByAdmin(params?.get('bookingid'));
    if (response?.success) {
      setBooking(response?.booking);
    }
  };

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    fetchBookingData(searchParams);
  }, [params]);

  return (
    <div className='w-full flex flex-col gap-6 relative'>
      <div className='p-4 border-b w-full flex justify-between items-center fixed top-0 bg-black z-30 shadow-lg'>
        <h1 className='text-3xl font-bold tracking-tight text-white'>Booking Detail</h1>
      </div>
      <div className='mt-24 mx-auto w-full max-w-5xl p-4'>
        <div
          className='cursor-pointer w-full p-6 border rounded-lg shadow-md flex justify-between gap-4 h-fit text-gray-700 bg-white'
        >
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-2'>
              <span><strong className='text-[#0a66c2] text-xl'>#ID: {booking?._id}</strong></span>
            </div>
            <div className='flex items-center gap-2'>
              <AiOutlineUser className='text-xl text-blue-400' />
              <span><strong className='text-gray-700'>Customer Name:</strong> {`${booking?.orderBy?.lastName} ${booking?.orderBy?.firstName}`}</span>
            </div>
            <div className='flex items-center gap-2'>
              <FiBriefcase className='text-xl text-teal-400' />
              <span><strong className='text-gray-700'>Provider Name:</strong> {booking?.info[0]?.provider?.bussinessName}</span>
            </div>
            <div className='flex items-center gap-2'>
              <FaTags className='text-xl text-purple-400' />
              <span><strong className='text-gray-700'>Service Name:</strong> {booking?.info[0]?.service?.name}</span>
            </div>
            <div className='flex items-center gap-2'>
              <IoIosTimer className='text-xl text-orange-400' />
              <span><strong className='text-gray-700'>Duration:</strong> {`${booking?.info[0]?.service?.duration} min`}</span>
            </div>
            <div className='flex items-center gap-2 relative'
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}>
              <AiOutlineTeam className='text-xl text-yellow-400' />
              <span><strong className='text-gray-700'>Staff:</strong> {`${booking?.info[0]?.staff?.lastName} ${booking?.info[0]?.staff?.firstName}`}</span>
              {showTooltip && (
                <div className='absolute bg-white border-2 border-gray-400 shadow-sm p-4 top-10 left-10 rounded-md flex gap-4 z-50'>
                  <div className='flex items-center'>
                    <img src={booking?.info[0]?.staff?.avatar} alt='Avatar' className='w-12 h-12 rounded-full' />
                  </div>
                  <div className='flex flex-col text-gray-700'>
                    <div><strong>Name:</strong> {`${booking?.info[0]?.staff?.lastName} ${booking?.info[0]?.staff?.firstName}`}</div>
                    <div><strong>Email:</strong> {booking?.info[0]?.staff?.email}</div>
                    <div><strong>Mobile:</strong> {booking?.info[0]?.staff?.mobile}</div>
                  </div>
                </div>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <FiCalendar className='text-xl text-pink-400' />
              <span><strong className='text-gray-700'>Date & Time:</strong> {moment(booking?.info[0]?.time, 'HH:mm').format('hh:mm A')} {moment(booking?.info[0]?.date).format('MMMM Do YYYY')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <FiDollarSign className='text-xl text-green-400' />
              <span><strong className='text-gray-700'>Total price:</strong> {`${formatPrice(formatPricee(booking?.info[0]?.service?.price))} VND`}</span>
            </div>
          </div>
          <div className='mt-4'>
            <img className='w-96 h-56 object-cover border-2 border-gray-300 rounded-md shadow-lg animate-shadow-drop-2-center hover:animate-shadow-pop-tr' src={booking?.info[0]?.service?.thumb} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(ManageBookingDetail);
