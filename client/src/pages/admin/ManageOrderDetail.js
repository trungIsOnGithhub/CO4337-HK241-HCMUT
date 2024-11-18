import { apiGetOneOrderProduct, apiUpdatePaymentStatusOrderProduct, apiUpdateShippingStatusOrderProduct } from 'apis/orderProduct';
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import bgImage from '../../assets/clouds.svg'
import avatarDefault from '../../assets/avatarDefault.png'
import { IoReturnDownBack } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { formatPrice } from 'ultils/helper';
import { TbDiscount } from 'react-icons/tb';
import { FaMoneyBillWave, FaShippingFast } from 'react-icons/fa';
import { FaBox, FaTruck, FaCheckCircle } from "react-icons/fa";
import moment from 'moment';

const ManageOrderDetail = () => {
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, []);

  const fetchOrderData = async () => {
    const response = await apiGetOneOrderProduct(params?.get('orderId'));
    if (response?.success) {
      setOrder(response?.order);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, []);

  useEffect(() => {
    setPaymentStatus(order?.statusPayment)
  }, [order])
  
  const handleBackManageOrder = () => {
    window.history.back()
  }

  // Shipping status tracker component
  const ShippingTracker = () => {
    const statuses = [
      { status: "Pending", icon: FaBox, label: "Pending" },
      { status: "Shipping", icon: FaTruck, label: "Shipping" },
      { status: "Delivered", icon: FaCheckCircle, label: "Delivered" }
    ];

    return (
      <div className="my-6 px-6">
        <div className="flex items-center justify-between relative">
          {/* Progress bar */}
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -translate-y-1/2 z-0">
            <div 
              className={`h-full bg-blue-500 transition-all duration-500 ${order?.statusShipping === "Pending" ? "w-0" : order?.statusShipping === "Shipping" ? "w-1/2" : "w-full"}`}
            />
          </div>
          
          {/* Status icons */}
          {statuses.map((item, index) => {
            const Icon = item.icon;
            const isActive = [
              order?.statusShipping === item.status,
              order?.statusShipping === "Shipping" && item.status === "Pending",
              order?.statusShipping === "Delivered" && (item.status === "Pending" || item.status === "Shipping")
            ].some(Boolean);

            return (
              <div key={item.status} className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  <Icon className="text-xl" />
                </div>
                <span className={`text-sm font-medium ${isActive ? "text-blue-500" : "text-gray-500"}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleChangeShippingStatus = async(shippingStatus) => {
    const orderId = order?._id
    const response = await apiUpdateShippingStatusOrderProduct({orderId, status: shippingStatus})
    if(response?.success){
      fetchOrderData()
      toast.success(response?.mes)
    }
    else{
      toast.error(response?.mes)
    }
  }

  const handleChangePaymentStatus = async(paymentStatus) => {
    const orderId = order?._id
    const response = await apiUpdatePaymentStatusOrderProduct({orderId, status: paymentStatus})
    if(response?.success){
      fetchOrderData()
      toast.success(response?.mes)
    }
    else{
      toast.error(response?.mes)
    }
  }
  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-20 flex items-end gap-1 p-4'>
          <div onClick={handleBackManageOrder} className='text-[#00143c] cursor-pointer'><IoReturnDownBack size={28}/></div>
          <span className='text-[#00143c] text-3xl font-semibold'>Order Detail</span>
        </div>
        <div className='w-[95%] min-h-[600px] shadow-2xl rounded-md bg-white ml-4 mb-[200px] flex flex-col gap-4'>
          <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
            {/* Order Header */}
            <div className="border-b p-6">
              <div className="mt-2 flex flex-wrap gap-4">
                <p className="text-gray-600">Order ID: {order?._id}</p>
                <p className="text-gray-600">Date: {moment(order?.createdAt).format('YYYY-MM-DD')}</p>
              </div>
            </div>

            {/* Shipping Status Tracker */}
            <ShippingTracker />

            {/* Status Controls */}
            <div className="grid md:grid-cols-2 gap-6 p-6 border-b">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Shipping Status</label>
                <select
                  value={order?.statusShipping}
                  onChange={(e) => handleChangeShippingStatus(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 text-[#00143c] cursor-pointer"
                  aria-label="Select shipping status"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                {order?.statusPayment !== "Cancelled" ? 
                <select
                  value={order?.statusPayment}
                  onChange={(e) => handleChangePaymentStatus(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 text-[#00143c] cursor-pointer"
                  aria-label="Select payment status"
                >
                  <option value="Pending">Pending</option>
                  <option value="Successful">Successful</option>
                  <option value="Cancelled">Cancelled</option>
                </select> : 
                <div className='w-full p-2 border rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 text-[#00143c] cursor-pointer'>Cancelled</div>
                }
              </div>
            </div>

            {/* Products List */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-4 text-[#00143c]">Ordered Products</h2>
              <div className="space-y-4">
                {order?.products.map((product) => (
                  <div
                    key={product?._id}
                    className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={product?.thumb}
                      alt={product?.title}
                      className="w-24 h-24 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1560393464-5c69a73c5770";
                      }}
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-800">{product?.title}</h3>
                      <p className="text-gray-600">Quantity: {product?.quantity}</p>
                    </div>
                    <div className="text-right">
                      {product.discountPrice !== product?.originalPrice ? (
                        <div>
                          <p className="text-gray-500 line-through">{formatPrice(product?.originalPrice)}</p>
                          <p className="font-semibold text-green-600">{formatPrice(product?.discountPrice)}</p>
                        </div>
                      ) : (
                        <p className="font-semibold text-gray-800">{formatPrice(product?.originalPrice)}</p>
                      )}
                      <p className="text-gray-600">Total: {formatPrice(product?.discountPrice * product?.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#00143c]">Price Summary</h2>
              <div className="space-y-3 max-w-md ml-auto">
                <div className="flex justify-between items-center text-[#00143c]">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(order?.totalProductPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-[#00143c]">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaShippingFast className="text-blue-500" />
                    Shipping Fee
                  </span>
                  <span className="font-medium">{formatPrice(order?.shippingPrice)}</span>
                </div>
                {
                  order?.discountCode && 
                  <div className="flex justify-between items-center text-green-600">
                    <span className="flex items-center gap-2">
                      <TbDiscount className="text-green-500" />
                      Discount ({order?.discountCode.code})
                    </span>
                    <span className="font-medium">-{formatPrice(order?.savingPrice)}</span>
                  </div>
                }
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-bold text-[#00143c]">
                    <span className="flex items-center gap-2">
                      <FaMoneyBillWave className="text-green-500" />
                      Total
                    </span>
                    <span>{formatPrice(order?.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 border-t bg-gray-50 text-[#00143c]">
              <h2 className="text-xl font-semibold mb-2">Shipping Address</h2>
              <p className="text-gray-600">{order?.orderBy?.address}</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default ManageOrderDetail
