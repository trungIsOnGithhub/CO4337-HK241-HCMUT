import React, { useEffect, useState } from 'react'
import { createSearchParams, useNavigate, useParams } from 'react-router-dom'
import bgImage from '../../assets/clouds.svg'
import { apiGetOrdersUserByAdmin, apiGetUserById } from 'apis'
import avatarDefault from '../../assets/avatarDefault.png'
import { FaBox, FaCalendarAlt, FaCheckCircle, FaClock, FaEnvelope, FaMapMarkerAlt, FaPhone, FaShippingFast, FaShoppingCart, FaTools, FaUser } from 'react-icons/fa'
import { apiGetUserOrderProductByUserId } from 'apis/orderProduct'
import { formatPrice } from 'ultils/helper'
import path from 'ultils/path'
import moment from 'moment'
import { MdKeyboardArrowRight } from 'react-icons/md'

const ViewStatistics = () => {
  const navigate = useNavigate()
  const {userId} = useParams()
  const [userData, setUserData] = useState(null)
  const [bookings, setBookings] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, []);

  useEffect(() => {
    const fetchBookingByUserId = async() => {
      const response = await apiGetOrdersUserByAdmin({limit: 999}, userId)
      if(response?.success){
        setBookings(response?.order)
      }
    }

    fetchBookingByUserId()
  }, [userId]);

  useEffect(() => {
    const fetchOrderProductsByUserId = async() => {
      const response = await apiGetUserOrderProductByUserId({limit: 999}, userId)
      if(response?.success){
        setOrders(response?.orderProducts)
      }
    }
    fetchOrderProductsByUserId()
  }, [userId]);

  useEffect(() => {
    const fetchUserData = async() => {
      const response = await apiGetUserById({userId})
      if(response?.success){
        setUserData(response?.res)
      }
    }
    fetchUserData()
  }, [userId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaBox className="w-6 h-6 text-yellow-500" />;
      case "Shipping":
        return <FaShippingFast className="w-6 h-6 text-blue-500" />;
      case "Delivered":
        return <FaCheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Shipping":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetailBooking = (bookingid) => {
    navigate({
      pathname: `/${path.ADMIN}/${path.MANAGE_BOOKING_DETAIL}`,
      search: createSearchParams({ bookingid }).toString()
    });
  }

  const handleViewDetailOrder = (orderId) => {
    navigate({
      pathname: `/${path.ADMIN}/${path.MANAGE_ORDER_DETAIL}`,
      search: createSearchParams({ orderId }).toString()
    });
  }
  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-fit flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>View Statistics</span>
        </div>
        <div className='w-[95%] shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-6 py-4 flex flex-col gap-4'>
          <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header Section */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <img
                    src={userData?.avatar || avatarDefault}
                    alt="Customer Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1633332755192-727a05c4013d";
                    }}
                  />
                  <div className="flex-1 text-[#00143c]">
                    <div className="flex items-center space-x-2">
                      <FaUser className="text-gray-500" />
                      <h2 className="text-xl font-semibold">{`${userData?.lastName} ${userData?.firstName}`}</h2>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-2">
                        <FaPhone className="text-gray-500" />
                        <span>{userData?.mobile}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaEnvelope className="text-gray-500" />
                        <span>{userData?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 gap-6 text-[#00143c]">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Total Service Bookings</p>
                      <h3 className="text-2xl font-bold">{bookings?.length}</h3>
                    </div>
                    <FaTools className="text-3xl text-blue-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Total Product Orders</p>
                      <h3 className="text-2xl font-bold">{orders?.length}</h3>
                    </div>
                    <FaShoppingCart className="text-3xl text-green-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Highest Booking Value</p>
                      <h3 className="text-2xl font-bold">
                        {`${formatPrice(Math.max(...bookings.map(booking => booking.total)))} VNĐ`}
                      </h3>
                    </div>
                    <FaTools className="text-3xl text-purple-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Highest Order Value</p>
                      <h3 className="text-2xl font-bold">
                        {`${formatPrice(Math.max(...orders.map(order => order.totalPrice)))} VNĐ`}
                      </h3>
                    </div>
                    <FaShoppingCart className="text-3xl text-red-500" />
                  </div>
                </div>
              </div>

              {/* Service Bookings Table */}
              <div className="mb-4 mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="border-b border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
                  </div>
                  <div className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-thin'>
                    {bookings?.map((booking) => (
                      <div
                        key={booking._id}
                        className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-[1.02] relative cursor-pointer"
                        onClick={() => {handleViewDetailBooking(booking._id)}}
                      >
                        <span className={`absolute top-4 right-4 inline-block px-3 py-1 rounded-full text-sm ${booking.status === "Successful" ? "bg-green-100 text-green-800" : booking?.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                          {booking.status}
                        </span>

                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-1/4">
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
                            <div className="flex justify-between items-start mb-4">
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Orders Table */}
              <div className="mx-auto mb-4">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  {/* Header Section */}
                  <div className="border-b border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
                  </div>

                  {/* Orders List */}
                  <div className="divide-y divide-gray-200 min-h-[400px] max-h-[600px] overflow-y-auto scrollbar-thin">
                    {orders.map((order) => (
                      <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={()=>handleViewDetailOrder(order._id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h2 className="text-lg font-semibold text-gray-900">Order {order._id}</h2>
                                <p className="text-sm text-gray-600">Placed on {moment(order?.createdAt).format('YYYY-MM-DD')}</p>
                              </div>
                              <div className={`px-4 py-2 rounded-full ${getStatusColor(order?.statusShipping)}`}>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(order?.statusShipping)}
                                  <span className="font-medium">{order?.statusShipping}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <img
                                src={order?.products[0]?.thumb}
                                alt={order?.products[0]?.title}
                                className="w-20 h-20 object-cover rounded-md"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1560393464-5c69a73c5770";
                                }}
                              />
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{order?.products[0]?.title}</h3>
                                <p className="text-gray-600">Quantity: {order?.products[0]?.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">{formatPrice(order?.totalPrice)} VNĐ</p>
                              </div>
                            </div>
                          </div>
                          <MdKeyboardArrowRight className="w-6 h-6 text-gray-400 ml-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewStatistics