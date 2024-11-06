import React, { useEffect, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { apiGetOrdersProductByAdmin } from 'apis/orderProduct';
import moment from 'moment';
import { Pagination } from 'components';
import { FiCalendar, FiUser, FiBriefcase, FiClock, FiDollarSign } from 'react-icons/fi';
// import { FaTags } from "react-icons/fa";
// import path from 'ultils/path';
import { formatPrice, formatPricee } from 'ultils/helper';
import withBaseComponent from 'hocs/withBaseComponent';
import bgImage from '../../assets/clouds.svg'

const ManageOrder = () => {
  const [params] = useSearchParams();
  const [orders, setOrders] = useState(null);
  const [counts, setCounts] = useState(0);

  const fetchOrder = async (params) => {
    const response = await apiGetOrdersProductByAdmin({ ...params, limit: process.env.REACT_APP_LIMIT });
    if (response?.success) {
      setOrders(response?.order);
      setCounts(response?.counts);
    }
  };

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    fetchOrder(searchParams);
  }, [params]);

  const calculateTotalPrice = (products) => {
    return products.reduce((total, product) => total + product.price * product.quantity, 0);
  };
  const backgroundColors = ['#e2e8f0', '#b2ebf2', '#dcedc8', '#ffe0b2', '#ffcdd2'];

  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-20 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Manage Order</span>
        </div>
          <div className='mt-[85px] w-full flex flex-col items-start gap-6'>
            {orders && orders.map((orderItem, index) => (
              <div
                key={index}
                className='cursor-pointer w-[90%] lg:w-[70%] p-6 ml-16 border rounded-lg shadow-md flex flex-col gap-4 bg-white hover:animate-scale-in-center'
                style={{ backgroundColor: backgroundColors[index % 5] }}
              >
                <div className='flex flex-col gap-4 text-gray-700'>
                  <div className='flex items-center gap-2'>
                    <span><strong className='text-[#0a66c2] text-xl'>#ID: {orderItem?._id}</strong></span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FiUser className='text-xl text-blue-400' />
                    <span><strong>Customer Name:</strong> {`${orderItem?.orderBy?.lastName} ${orderItem?.orderBy?.firstName}`}</span>
                  </div>
                  <div className='flex flex-col items-start gap-2'>
                    <div className='flex items-center gap-2'>
                      <FiBriefcase className='text-xl text-orange-400' />
                      <span><strong>Products:</strong></span>
                    </div>
                    <div className='h-[300px] overflow-y-auto'>
                    {orderItem?.products.map((product, index) => (
                      <div key={index} className='flex flex-col items-start gap-2 ml-7'>
                        <div className='flex gap-4 items-center'>
                        <span className='max-w-[70%] line-clamp-1 italic text-gray-600 font-semibold'>{`${index+1}) ${product?.product?.title}`}</span>
                        <span className='text-gray-700 font-bold text-lg'>{`: ${formatPrice(formatPricee(product?.price))} VNĐ X ${product?.quantity}`}</span>
                        </div>
                        <div className='ml-48'>
                          <img className='w-48 h-48 object-cover border border-gray-500 rounded-md shadow-md' src={product?.product?.thumb}></img>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FiCalendar className='text-xl text-pink-400' />
                    <span><strong>Created At:</strong> {moment(orderItem?.createdAt).fromNow()}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FiDollarSign className='text-xl text-green-400' />
                    <span><strong>Total Price:</strong> {calculateTotalPrice(orderItem?.products).toLocaleString()} VND</span>
                  </div>
                </div>
              </div>
            ))}
            <div className='w-full flex justify-end'>
              <Pagination totalCount={counts} />
            </div>
          </div>
    </div>
    </div>
  );
};

export default withBaseComponent(ManageOrder);
