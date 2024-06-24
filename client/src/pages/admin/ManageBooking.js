import React, { useEffect, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { apiGetOrdersByAdmin } from 'apis/order';
import moment from 'moment';
import { Pagination } from 'components';
import { FiCalendar, FiDollarSign } from 'react-icons/fi';
import { FaTags } from "react-icons/fa";
import { AiOutlineUser, AiOutlineTeam } from 'react-icons/ai';
import path from 'ultils/path';
import withBaseComponent from 'hocs/withBaseComponent';
import { formatPrice, formatPricee } from 'ultils/helper';

const ManageBooking = ({ dispatch, navigate }) => {
  const [params] = useSearchParams();
  const [booking, setBookings] = useState(null);
  const [counts, setCounts] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(12);

  const fetchBooking = async (params) => {
    const response = await apiGetOrdersByAdmin({ ...params, limit: process.env.REACT_APP_LIMIT });
    if (response?.success) {
      // Sắp xếp các đơn đặt chỗ theo `createdAt` từ mới nhất đến cũ nhất
      const sortedBookings = response?.order?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sortedBookings);
      setCounts(response?.counts);
    }
  };

  const handleOnClickDetail = (bookingid) => {
    navigate({
      pathname: `/${path.ADMIN}/${path.MANAGE_BOOKING_DETAIL}`,
      search: createSearchParams({ bookingid }).toString()
    });
  };

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    fetchBooking(searchParams);
  }, [params]);

  const filterBookingsByMonth = (bookings, month) => {
    if (month === 12) return bookings;
    return bookings?.filter(bookingItem => {
      const bookingMonth = moment(bookingItem?.info[0]?.date, 'DD/MM/YYYY').format('M');
      return parseInt(bookingMonth) === month + 1;
    });
  };

  const countBookingsByMonth = (bookings) => {
    if (!bookings) return 0;
    return bookings?.length;
  };

  useEffect(() => {
    setCounts(countBookingsByMonth(filterBookingsByMonth(booking, selectedMonth)));
  }, [booking, selectedMonth]);

  return (
    <div className='w-full flex flex-col gap-4 relative'>
      <div className='p-4 border-b w-full flex justify-between items-center fixed top-0 bg-black z-30'>
        <h1 className='text-3xl font-bold tracking-tight text-white'>Manage Booking</h1>
      </div>
      <div className='mt-24 mx-auto w-full max-w-5xl'>
        <div className="flex items-center gap-4 mb-8 justify-between pr-4">
          <div className='flex gap-2 items-center'>
            <label htmlFor="monthSelect" className="text-white">Select Month:</label>
            <select
              id="monthSelect"
              className='text-black border border-gray-300 rounded-md p-2 cursor-pointer'
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              value={selectedMonth === null ? 12 : selectedMonth}
            >
              <option value={12}>All</option>
              {moment.months().map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <p className="text-blue-600 italic font-semibold">Total bookings in selected month: {counts}</p>
        </div>
        <div className='flex gap-8 items-center flex-wrap justify-center'>
          {booking && filterBookingsByMonth(booking, selectedMonth).map((bookingItem, index) => (
            <div
              key={index}
              className='cursor-pointer w-[45%] p-6 border rounded-lg shadow-md flex flex-col items-center gap-4 bg-gray-200 hover:animate-scale-in-center'
              onClick={() => { handleOnClickDetail(bookingItem?._id) }}
            >
                <div>
                  <img className='w-[560px] h-[320px] object-cover border border-gray-500 rounded-md shadow-2xl' src={bookingItem?.info[0]?.service?.thumb} />
                </div>
                <div className='flex flex-col gap-4 text-gray-700'>
                  <div className='flex items-center gap-2'>
                    <span><strong className='text-main'>#ID: {bookingItem?._id}</strong></span>
                  </div>
                  <span className='line-clamp-1'>
                    <span><strong>Customer Name:</strong> {`${bookingItem?.orderBy?.lastName} ${bookingItem?.orderBy?.firstName}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span><strong>Service Name:</strong> {`${bookingItem?.info[0]?.service?.name}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span><strong>Staff:</strong> {`${bookingItem?.info[0]?.staff?.lastName} ${bookingItem?.info[0]?.staff?.firstName}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span><strong>Date & Time:</strong> {moment(bookingItem?.info[0]?.time, 'HH:mm').format('hh:mm A')} {moment(bookingItem?.info[0]?.date, 'D/M/YYYY').format('MMMM Do YYYY')}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  </span>
                  <div>
                    <span><strong>Total Price:</strong> {`${formatPrice(formatPricee(bookingItem?.info[0]?.service?.price))} VND`}</span>
                  </div>
                </div>
            </div>
          ))}
        </div>
        <div className='w-full flex justify-end mt-8'>
          <Pagination totalCount={counts} />
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(ManageBooking);
