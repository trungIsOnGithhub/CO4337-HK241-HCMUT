import {apiGetOrdersByUser, apiRefundOrder } from 'apis/order'
import { CustomSelect, InputForm, Pagination } from 'components'
import withBaseComponent from 'hocs/withBaseComponent'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { FiCalendar, FiClock, FiMapPin, FiAlertCircle, FiXCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { formatPrice } from 'ultils/helper'


const History = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [orders, setOrders] = useState(null)
  const [counts, setCounts] = useState(0)
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

  console.log(orders)
  const ErrorMessage = () => (
    <div className="flex items-center justify-center p-4 mb-4 bg-red-50 rounded-lg" role="alert">
      <FiAlertCircle className="w-5 h-5 mr-2 text-red-500" />
      <p className="text-sm text-red-800">Unable to load booking history. Please try again later.</p>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Successful":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const handleCancelBooking = async(capturedId) => {
    // console.log(capturedId)
    // const response = await apiRefundOrder(capturedId)
    // console.log(response)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Booking History</h1>

      {orders?.length === 0 ? (
        <ErrorMessage />
      ) : (
        <div className="space-y-4">
          {orders?.map((booking) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-[#0a66c2] focus-within:ring-opacity-50"
              tabIndex="0"
              role="article"
              aria-label={`Booking for ${booking?.info[0].service?.name}`}
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
                    {booking?.info[0].service?.name}
                  </h2>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <FiCalendar className="w-5 h-5 mr-2 text-[#0a66c2]" />
                    <span>{booking?.info[0].date}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiClock className="w-5 h-5 mr-2 text-[#0a66c2]" />
                    <span>{booking?.info[0].time}</span>
                  </div>
                  <div className="flex items-center text-gray-600 sm:col-span-2">
                    <FiMapPin className="w-5 h-5 mr-2 text-[#0a66c2]" />
                    <span>{booking?.info[0]?.provider?.address}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-lg font-semibold text-[#0a66c2]">
                      {formatPrice(booking?.total)} VNĐ
                    </span>
                  </div>
                  {booking.status !== "Cancelled" && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleCancelBooking(booking?.capturedId)}
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                      >
                        <FiXCircle className="w-4 h-4 mr-2" />
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    <div className='w-full flex justify-end'>
      <Pagination totalCount={counts} />
    </div>
  </div>
  )
}

export default History