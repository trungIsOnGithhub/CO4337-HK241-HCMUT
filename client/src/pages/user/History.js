import {apiGetOrdersByUser, apiRefundOrder, apiUpdateStatusOrder } from 'apis/order'
import { CustomSelect, InputForm, Pagination } from 'components'
import withBaseComponent from 'hocs/withBaseComponent'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { FiCalendar, FiClock, FiMapPin, FiAlertCircle, FiXCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { formatPrice } from 'ultils/helper'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaSpinner, FaTimes } from 'react-icons/fa'
import path from 'ultils/path'
import clsx from 'clsx'
import { TbMessageCirclePlus } from 'react-icons/tb'
import { apiGetAdminData } from 'apis'
import { showMessageBox } from 'store/app/appSlice'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'


const History = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);
  const [adminData, setAdminData] = useState(null)

  const [orders, setOrders] = useState(null)
  const [counts, setCounts] = useState(0)
  const {current} = useSelector(state => state.user)
  const dispatch = useDispatch()

  const {
    register,
    formState:{errors}, 
    watch, 
    setValue} = useForm()

  const q = watch('q')
  const status = watch('status')

  const [params] = useSearchParams()
  const fetchOrders = async(params) => {
    const response = await apiGetOrdersByUser({...params, limit: process.env.REACT_APP_LIMIT})

    if(response.success){
      setOrders(response.order)
      setCounts(response.counts)
    }
  }
  
  const handleSearchStatus = (a) => {
    if(a?.value){
      navigate({
        pathname: location.pathname,
        search: createSearchParams({status: a.value}).toString()
      })
    }
    else{
      navigate({
        pathname: location.pathname,
      })
    }
  }

  useEffect(() => {
    const pr = Object.fromEntries([...params])
    fetchOrders(pr)
  }, [params])

  const handleCancelBooking = async(bookingId) => {
    console.log(bookingId)
    const response = await apiUpdateStatusOrder({bookingId, status: 'Cancelled'})
    console.log(response)
    if(response.success){
      fetchOrders(Object.fromEntries([...params]))
    }
  }

  const handleViewDetailBooking = (bookingId) => {
    navigate(`/${path.USER}/${path.HISTORY}/` + bookingId)
  }


  const handleContactProvider = async (e, booking) => {
    e.preventDefault();
    console.log(booking?.info?.[0]?.provider?._id)
    try {
      if (!booking?.info?.[0]?.provider?._id) {
        console.error("Provider ID không tồn tại.");
        return;
      }
  
  
      const response = await apiGetAdminData({ prid: booking.info[0].provider._id });
      console.log(response);
      if (!response?.admin || response.admin.length === 0) {
        console.error("Không tìm thấy admin nào phù hợp.");
        return;
      }
  
      const admin = response.admin[0]; // Lấy admin đầu tiên
      const to = {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        avatar: admin.avatar,
      };
  
      dispatch(showMessageBox({ from: current?._id, to }));
    } catch (error) {
      console.error("Lỗi khi liên lạc với provider:", error);
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Booking History</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <div className="space-y-6 mb-4">
        {orders?.map((booking) => (
          <div
            key={booking._id}
            className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-[1.02] relative cursor-pointer"
          >
            <span className={`absolute top-4 right-4 inline-block px-3 py-1 rounded-full text-sm ${booking.status === "Successful" ? "bg-green-100 text-green-800" : booking?.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
              {booking.status}
            </span>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/4" onClick={() => {handleViewDetailBooking(booking._id)}}>
                <img
                  src={booking?.info[0]?.service?.thumb}
                  alt={booking?.info[0]?.service?.name}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa";
                  }}
                />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-4" onClick={() => {handleViewDetailBooking(booking._id)}}>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {booking?.info[0]?.service?.name}
                    </h2>
                  </div>
                </div>

                <div className="space-y-3 text-gray-600">
                  <p className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-gray-500" />
                    <span className="font-medium mr-2">Date:</span> {booking?.info[0]?.date}
                  </p>
                  <p className="flex items-center">
                    <FaClock className="mr-2 text-gray-500" />
                    <span className="font-medium mr-2">Time:</span> {booking?.info[0]?.time}
                  </p>
                  <p className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-500" />
                    <span className="font-medium mr-2">Address:</span> {booking?.info[0]?.provider?.address}
                  </p>
                </div>
                
                <div className="mt-4 mb-4">
                  <p className="text-xl font-bold text-blue-600">
                  {formatPrice(booking?.total)} VNĐ
                  </p>
                </div>

                <div className='flex items-center gap-4'>
                  <button
                    onClick={() => {
                      if (booking?.status === 'Pending') {
                        handleCancelBooking(booking?._id);
                      }
                    }}
                    disabled={isLoading || booking?.status !== 'Pending'}
                    className={clsx("px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed", booking?.status === 'Pending' ? "bg-red-600 hover:bg-red-700 cursor-pointer" : "bg-gray-400 cursor-not-allowed")}
                    aria-label={`Cancel booking for ${booking?.info[0]?.service?.name}`}
                  >
                    {isLoading ? (
                      <FaSpinner className="animate-spin inline-block" />
                    ) : (
                      "Cancel Booking"
                    )}
                  </button>

                  <button
                    onClick={(e) => handleContactProvider(e, booking)}
                    className= "px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[#0a66c2] flex gap-2 justify-center items-center"
                  >
                    <TbMessageCirclePlus />
                    Contact the provider
                  </button>

                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='w-full flex justify-end'>
        <Pagination totalCount={counts} />
      </div>
    </div>

  )
}

export default History