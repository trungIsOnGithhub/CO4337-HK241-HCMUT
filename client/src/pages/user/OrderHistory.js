import React, {useState, useEffect} from 'react'
import { FiCalendar, FiClock, FiMapPin, FiAlertCircle, FiXCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { formatPrice } from 'ultils/helper'
import { apiGetOrdersByUser } from 'apis';
import { apiGetUserOrderProduct } from 'apis/orderProduct';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaBox, FaShippingFast, FaCheckCircle } from "react-icons/fa";
import { MdKeyboardArrowRight } from 'react-icons/md';
import moment from 'moment';
import { Pagination } from 'components';
import path from 'ultils/path';

const OrderHistory = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [counts, setCounts] = useState(0)
  const [params] = useSearchParams()

  const fetchOrderProducts = async(params) => {
    const response = await apiGetUserOrderProduct({...params,limit: process.env.REACT_APP_LIMIT, shippingStatus:selectedFilter})

    if(response.success){
      setOrders(response?.orderProducts)
      setCounts(response.counts)
    }
  }

  const [selectedFilter, setSelectedFilter] = useState("all");

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
  

  useEffect(() => {
    const pr = Object.fromEntries([...params])
    fetchOrderProducts(pr)
  }, [params, selectedFilter]);

  const handleViewDetailOrder = (oid) => {
    navigate(`/${path.USER}/${path.ORDER_HISTORY}/` + oid)
  }

  // removed log
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => {
                  setSelectedFilter("all");
                }}
                className={`px-4 py-2 rounded-full ${selectedFilter === "all" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                All Orders
              </button>
              <button
                onClick={() => {
                  setSelectedFilter("pending");
                }}
                className={`px-4 py-2 rounded-full ${selectedFilter === "pending" ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                Pending
              </button>
              <button
                onClick={() => {
                  setSelectedFilter("shipping");
                }}
                className={`px-4 py-2 rounded-full ${selectedFilter === "shipping" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                Shipping
              </button>
              <button
                onClick={() => {
                  setSelectedFilter("delivered");
                }}
                className={`px-4 py-2 rounded-full ${selectedFilter === "delivered" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                Delivered
              </button>
            </div>
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
      <div className='w-full flex justify-end'>
        <Pagination totalCount={counts} />
      </div>
    </div>
  )
}

export default OrderHistory
