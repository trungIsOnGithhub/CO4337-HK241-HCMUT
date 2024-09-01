import React, { memo, useEffect, useState } from 'react';
import paypalLogo from 'assets/card-payment.svg';
import { useSelector } from 'react-redux';
import { formatPrice, formatPricee } from 'ultils/helper';
import { Congratulation, InputForm, Paypal } from 'components';
import withBaseComponent from 'hocs/withBaseComponent';
import { getCurrent } from 'store/user/asyncAction';
import path from 'ultils/path';
import axios from 'axios'; // Import Axios
import { apiGetCurrent, apiValidateAndUseCoupon, apiUpdateCouponUsage } from 'apis/coupon'; // Thêm dòng này
import { useLocation } from 'react-router-dom';

const CheckoutService = ({ dispatch, navigate }) => {
  const { currentCartService, current: currentUser } = useSelector((state) => state.user);
  const [isSuccess, setIsSuccess] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(null); // State để lưu trữ tỉ giá hối đoái
  const location = useLocation();

  // Lấy giá từ URL
  const searchParams = new URLSearchParams(location.search);
  const priceFromURL = searchParams.get('price');
  const couponCodeFromURL = searchParams.get('couponCode');

  const fetchCheckoutData = async () => {
    dispatch(getCurrent());
  };
  useEffect(() => {
    fetchCheckoutData();
  }, []);

  useEffect(() => {
    if(isSuccess){
      dispatch(getCurrent())
    }
  }, [isSuccess])

  useEffect(() => {
    // Hàm để gọi API và lấy tỉ giá hối đoái
    const fetchExchangeRate = async () => {
      try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const rate = response.data.rates.VND;
        setExchangeRate(rate);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };

    fetchExchangeRate();
  }, []); 

  // Sử dụng giá từ URL nếu có, nếu không thì sử dụng giá từ currentCartService
  const price = priceFromURL ? parseFloat(priceFromURL) : currentCartService[0]?.price;

  // quy doi tu VND -> USD
  const totalPriceUSD = exchangeRate ? price / exchangeRate : null;

  const handlePayment = async (paymentResult) => {
    try {
      if (couponCodeFromURL) {
        const validateResponse = await apiValidateAndUseCoupon({ couponCode: couponCodeFromURL, userId: currentUser._id });
        if (!validateResponse.success) {
          console.error('Coupon validation failed:', validateResponse.message);
          // Hiển thị thông báo lỗi cho người dùng
          return;
        }
      }

      if (paymentResult.success) {
        // Cập nhật sử dụng coupon chỉ sau khi thanh toán thành công
        if (couponCodeFromURL) {
          await apiUpdateCouponUsage({ couponCode: couponCodeFromURL, userId: currentUser._id });
        }
        setIsSuccess(true);
        // Xử lý sau khi thanh toán thành công (ví dụ: cập nhật giỏ hàng, chuyển hướng, etc.)
      } else {
        
      }
    } catch (error) {
      console.error('Payment error:', error);
      // Xử lý lỗi và hiển thị thông báo cho người dùng
    }
  };

  return (
    <div className="p-8 w-full grid grid-cols-10 h-full max-h-screen overflow-y-auto gap-6">
      {isSuccess && <Congratulation />}
      <div className="w-full flex items-center justify-center col-span-5">
        <img className="h-[70%] object-contain" src={paypalLogo} alt="PayPal Logo"></img>
      </div>
      <div className="w-full flex flex-col items-center justify-center gap-6 col-span-5">
        <h2 className="text-3xl mb-6 font-bold">Check out your booking !</h2>
        <div className="w-full flex flex-col gap-6 items-center">
          <div className="border border-gray-400 h-fit pb-5 rounded-md w-fit px-5">
            <div className="mb-4 border-b-2 border-gray-200 px-3 py-2 flex justify-center items-center">
              <span className="font-semibold text-3xl">Booking Details</span>
            </div>
            <div className="px-3 flex flex-col gap-2">
              <div className='flex gap-4'>
                <span className='text-gray-700 font-bold'>Service Name:</span>
                <span className='font-semibold text-gray-600'>{currentCartService[0]?.service ? currentCartService[0]?.service?.name : ''}</span>
              </div>
              <div className='flex gap-4'>
                <span className='text-gray-700 font-bold'>Duration:</span>
                <span className='font-semibold text-gray-600'>{currentCartService[0]?.service ? `${currentCartService[0]?.service?.duration} minutes` : ''}</span>
              </div>
              <div className='flex gap-4'>
                <span className='text-gray-700 font-bold'>Provider Name:</span>
                <span className='font-semibold text-gray-600'>{currentCartService[0]?.provider ? `${currentCartService[0]?.provider?.bussinessName}` : ''}</span>
              </div>
              <div className='flex gap-4'>
                <span className='text-gray-700 font-bold'>Address:</span>
                <span className='font-semibold text-gray-600'>{currentCartService[0]?.provider ? `${currentCartService[0]?.provider?.address}` : ''}</span>
              </div>
              <div className='flex gap-4'>
                <span className='text-gray-700 font-bold'>Staff:</span>
                <span className='font-semibold text-yellow-600'>{currentCartService[0]?.staff ? `${currentCartService[0]?.staff?.lastName} ${currentCartService[0]?.staff?.firstName}` : ''}</span>
              </div>
              <div className='flex gap-4'>
                <span className='text-gray-700 font-bold'>Date & Time:</span>
                <span className='font-semibold text-green-600'>{currentCartService[0]?.time ? `${currentCartService[0]?.time} ${currentCartService[0]?.date}` : ''}</span>
              </div>
              <div className='flex gap-4'>
                <span className='text-gray-700 font-bold'>Total Price:</span>
                <span className='font-semibold text-main'>{`${formatPrice(formatPricee(price))} VNĐ`}</span>
              </div>
            </div>
          </div>
          <div className="w-[60%]">
            <Paypal
              payload={{
                info: currentCartService,
                total: Math.round(totalPriceUSD),
              }}
              setIsSuccess={setIsSuccess}
              amount={Math.round(totalPriceUSD)}
              onSuccess={handlePayment}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(CheckoutService));