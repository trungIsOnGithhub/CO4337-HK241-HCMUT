import React, { useEffect, useRef, useState } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiGetOrdersProductByAdmin, apiUpdatePaymentStatusOrderProduct, apiUpdateShippingStatusOrderProduct } from 'apis/orderProduct';
import moment from 'moment';
import { Button, InputFormm, Pagination } from 'components';
import { FiCalendar, FiUser, FiBriefcase, FiClock, FiDollarSign } from 'react-icons/fi';
import { FaAngleDown, FaTags } from "react-icons/fa";
import path from 'ultils/path';
import { formatPrice, formatPricee } from 'ultils/helper';
import withBaseComponent from 'hocs/withBaseComponent';
import bgImage from '../../assets/clouds.svg'
import { TfiExport } from 'react-icons/tfi';
import { useForm } from 'react-hook-form';
import { FaCircleHalfStroke } from 'react-icons/fa6';
import clsx from 'clsx';
import { GoPlusCircle } from 'react-icons/go';
import { toast } from 'react-toastify';

const ManageOrder = () => {
  const [params] = useSearchParams();
  const [orders, setOrders] = useState(null);
  const [counts, setCounts] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showOptionPaymentStatus, setShowOptionPaymentStatus] = useState(null)
  const [showOptionShippingStatus, setShowOptionShippingStatus] = useState(null)
  const shippingRef = useRef(null);
  const paymentRef = useRef(null)
  const navigate = useNavigate()

  const fetchOrder = async (params) => {
    const response = await apiGetOrdersProductByAdmin({ ...params, limit: process.env.REACT_APP_LIMIT,shippingStatus:selectedFilter});
    if (response?.success) {
      setOrders(response?.order);
      setCounts(response?.counts);
    }
  };

  const {register,formState:{errors}, handleSubmit, watch} = useForm()

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    fetchOrder(searchParams);
  }, [params, selectedFilter, showOptionPaymentStatus, showOptionShippingStatus]);

  const calculateTotalPrice = (products) => {
    return products.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  const handleShowOptionShippingStatus = (orderId) => {
    setShowOptionShippingStatus(orderId)
  }
  const handleShowOptionPaymentStatus = (orderId) => {
    setShowOptionPaymentStatus(orderId)
  }
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shippingRef.current && !shippingRef.current.contains(event.target)) {
        setShowOptionShippingStatus(null); // Đặt lại showOptionStatus
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paymentRef.current && !paymentRef.current.contains(event.target)) {
        setShowOptionPaymentStatus(null); // Đặt lại showOptionStatus
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChangeShippingStatusOrder = async(orderId, shippingStatus) => {
    const response = await apiUpdateShippingStatusOrderProduct({orderId, status: shippingStatus})
    if(response?.success){
      setShowOptionShippingStatus(null)
      toast.success(response?.mes)
    }
    else{
      setShowOptionShippingStatus(null)
      toast.error(response?.mes)
    }
  }
  const handleChangePaymentStatusOrder = async(orderId, paymentStatus) => {
    const response = await apiUpdatePaymentStatusOrderProduct({orderId, status: paymentStatus})
    if(response?.success){
      setShowOptionPaymentStatus(null)
      toast.success(response?.mes)
    }
    else{
      setShowOptionPaymentStatus(null)
      toast.error(response?.mes)
    }
  }

  const handleShowDetailOrderProduct = (orderId) => {
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
        <div className='w-full h-20 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Manage Order</span>
        </div>
        <div className='w-[95%] h-[600px] shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-6 py-4 flex flex-col gap-4'>
          <div className='w-full h-fit flex justify-between items-center'>
            <h1 className='text-[#00143c] font-medium text-[16px]'>{`Orders (${counts})`}</h1>
            <Button style={'px-4 py-2 rounded-md text-[#00143c] bg-[#fff] font-semibold w-fit h-fit flex gap-2 items-center border border-[#b3b9c5]'}><TfiExport className='text-lg font-bold' /> Export Data</Button>
          </div>
          <div className='w-full h-[48px] mx-[-6px] mt-[-6px] mb-[10px] flex'>
            <form className='flex-1' >
              <InputFormm
                id='q'
                register={register}
                errors={errors}
                fullWidth
                placeholder= 'Search order by product, customer ...'
                style={'w-full bg-[#f4f6fa] h-10 rounded-md pl-2 flex items-center'}
                styleInput={'w-[100%] bg-[#f4f6fa] outline-none text-[#99a1b1]'}
              >
              </InputFormm>
            </form>
          </div>
          <div className="flex space-x-4">
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
          <div className='text-[#99a1b1]'>
            <div className='w-full flex gap-1 border-b border-[##dee1e6] p-[8px]'>
              <span className='w-[10%] flex items-end justify-center'>Order Date</span>
              <span className='w-[25%] flex items-end justify-center'>OrderId</span>
              <span className='w-[15%] flex items-end justify-center'>Customer</span>
              <span className='w-[15%] flex items-end justify-center'>Shipping Status</span>
              <span className='w-[15%] flex items-end justify-center'>Payment Status</span>
              <span className='w-[10%] flex items-end justify-center'>Total</span>
              <span className='w-[10%]'>Action</span>
            </div>
            <div>
              {orders?.map((el,index) => (
                <div key={index} className='w-full flex border-b border-[#f4f6fa] gap-1 h-[56px] px-[8px] py-[12px] cursor-pointer hover:bg-blue-200'>
                  <span className='w-[10%] py-2 text-[#00143c]'>{moment(el?.createdAt).format('YYYY-MM-DD')}</span>
                  <span onClick={()=>{handleShowDetailOrderProduct(el?._id)}} className='w-[25%] py-2 text-[#00143c] text-sm flex justify-center font-medium'>
                    {el?._id}
                  </span>
                  <span className='w-[15%] py-2 text-[#00143c] text-sm line-clamp-1 flex items-center justify-center'>{`${el?.orderBy?.lastName} ${el?.orderBy?.firstName}`}</span>
                  <span className='w-[15%] py-2 text-[#00143c] text-sm flex items-center justify-center relative' onClick={()=>{handleShowOptionShippingStatus(el?._id)}}>
                    <div className='w-full flex justify-between items-center border rounded-md px-2 shadow-sm h-[26px]'>
                      <span className='flex gap-[6px] items-center'><FaCircleHalfStroke style={{ transform: 'rotate(90deg)'}} color={el?.statusShipping === 'Pending' ? 'orange' : el?.statusShipping === 'Shipping' ? 'blue' : 'green'}/>{el?.statusShipping}</span>
                      <FaAngleDown size={10}/>
                    </div>
                    {
                    showOptionShippingStatus === el?._id &&
                    <div ref={shippingRef} className='w-full bg-white border shadow-xl absolute top-8 left-0 px-[7px] py-[5px] flex flex-col gap-1 z-[500]'>
                      <span onClick={()=>handleChangeShippingStatusOrder(el?._id, 'Shipping')} className={clsx('w-full flex gap-1 items-center p-2 cursor-pointer', el?.statusShipping === 'Shipping' ? 'text-[#005aee] bg-[#f2f6fe]' : 'hover:bg-gray-100')}><FaCircleHalfStroke style={{ transform: 'rotate(90deg)'}} color='blue'/> Shipping</span>
                      <span onClick={()=>handleChangeShippingStatusOrder(el?._id, 'Pending')} className={clsx('w-full flex gap-1 items-center p-2 cursor-pointer', el?.statusShipping === 'Pending' ? 'text-[#005aee] bg-[#f2f6fe]' : 'hover:bg-gray-100')}><FaCircleHalfStroke style={{ transform: 'rotate(90deg)'}} color='orange'/> Pending</span>
                      <span onClick={()=>handleChangeShippingStatusOrder(el?._id, 'Delivered')} className={clsx('w-full flex gap-1 items-center p-2 cursor-pointer', el?.statusShipping === 'Delivered' ? 'text-[#005aee] bg-[#f2f6fe]' : 'hover:bg-gray-100')}><FaCircleHalfStroke style={{ transform: 'rotate(90deg)'}} color='green'/> Delivered</span>
                    </div>
                    }
                  </span>
                  <span className='w-[15%] py-2 text-[#00143c] flex items-center justify-center relative cursor-pointer text-sm' onClick={()=>{handleShowOptionPaymentStatus(el?._id)}}>
                    <div className='w-full flex justify-between items-center border rounded-md px-2 shadow-sm h-[26px]'>
                      <span className='flex gap-[6px] items-center'><FaCircleHalfStroke style={{ transform: 'rotate(90deg)'}} color={el?.statusPayment === 'Successful' ? 'green' : el?.statusPayment === 'Pending' ? 'orange' : 'red'}/>{el?.statusPayment}</span>
                      <FaAngleDown size={10}/>
                    </div>
                    {
                    showOptionPaymentStatus === el?._id &&
                    <div ref={paymentRef} className='w-full bg-white border shadow-xl absolute top-8 left-0 px-[7px] py-[5px] flex flex-col gap-1 z-[500]'>
                      <span onClick={()=>handleChangePaymentStatusOrder(el?._id, 'Successful')} className={clsx('w-full flex gap-1 items-center p-2 cursor-pointer', el?.statusPayment === 'Shipping' ? 'text-[#005aee] bg-[#f2f6fe]' : 'hover:bg-gray-100')}><FaCircleHalfStroke style={{ transform: 'rotate(90deg)'}} color='green'/> Successful</span>
                      <span onClick={()=>handleChangePaymentStatusOrder(el?._id, 'Pending')} className={clsx('w-full flex gap-1 items-center p-2 cursor-pointer', el?.statusPayment === 'Pending' ? 'text-[#005aee] bg-[#f2f6fe]' : 'hover:bg-gray-100')}><FaCircleHalfStroke style={{ transform: 'rotate(90deg)'}} color='orange'/> Pending</span>
                      <span onClick={()=>handleChangePaymentStatusOrder(el?._id, 'Cancelled')} className={clsx('w-full flex gap-1 items-center p-2 cursor-pointer', el?.statusPayment === 'Delivered' ? 'text-[#005aee] bg-[#f2f6fe]' : 'hover:bg-gray-100')}><FaCircleHalfStroke style={{ transform: 'rotate(90deg)'}} color='red'/> Cancelled</span>
                    </div>
                    }
                  </span>
                  <span className='w-[10%] py-2 text-[#00143c] flex items-center justify-center'>
                  {formatPrice(el?.totalPrice)}
                  </span>
                  <span className='w-[10%] px-2 py-2 text-[#00143c] font-bold text-xl'><GoPlusCircle /></span>
                </div>
              ))}
            </div>
          </div>
          <div className='text-[#00143c] flex-1 flex items-end'>
            <Pagination totalCount={counts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageOrder;
