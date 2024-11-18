import React, { memo, useEffect, useState } from 'react';
import paypalLogo from 'assets/card-payment.svg';
import { useDispatch, useSelector } from 'react-redux';
import { formatPrice, formatPricee } from 'ultils/helper';
import { Congratulation, InputForm, Paypal } from 'components';
// import withBaseComponent from 'hocs/withBaseComponent';
import { getCurrent } from 'store/user/asyncAction';
// import path from 'ultils/path';
import axios from 'axios'; // Import Axios
import { apiGetCurrent, apiValidateAndUseCoupon, apiUpdateCouponUsage } from 'apis/coupon'; // Thêm dòng này
import { MdOutlineDiscount } from 'react-icons/md';
import { FaPaypal } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import { TbTruckDelivery } from "react-icons/tb";
import { useNavigate, useLocation } from 'react-router-dom';
import { apiCreateOrder } from 'apis';
import Swal from 'sweetalert2'; 

const CheckoutService = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCartService, current: currentUser } = useSelector((state) => state.user);
  const [isSuccess, setIsSuccess] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(null); // State để lưu trữ tỉ giá hối đoái
  const location = useLocation();

  // Lấy giá từ URL
  const searchParams = new URLSearchParams(location.search);
  const priceFromURL = searchParams.get('price');
  const couponCodeFromURL = searchParams.get('couponCode');
  const [payload, setPayload] = useState([])
  const [showPaypal, setShowPaypal] = useState(false);

  useEffect(() => {
    setPayload(currentCartService[0])
  }, [currentCartService]);

  const handlePaymentSelect = (paymentId) => {
    setSelectedPayment(paymentId);
    setShowPaypal(false);
  };

  
  const [selectedPayment, setSelectedPayment] = useState("");
  const paymentMethods = [
    { id: "paypal", name: "PayPal", icon: FaPaypal },
    // { id: "zalopay", name: "ZaloPay", icon: SiZalo },
    { id: "cod", name: "Cash on Delivery", icon: TbTruckDelivery, iconColor: "text-green-600" }
  ];
  console.log(selectedPayment)
  
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

  const handlePlaceOrder = async() => {
    if (!selectedPayment) {
      alert("Please select a payment method");
      return;
    }

    if (selectedPayment === 'paypal') {
      setShowPaypal(true); // Hiển thị PaypalProduct nếu chọn PayPal
    }
    else if(selectedPayment === 'cod'){
      const payloadCOD = {...payload, status: 'Pending', paymentMethod: 'cod'}
      console.log(payloadCOD)
      const response = await apiCreateOrder(payloadCOD)
      if(response.success){
        if (couponCodeFromURL) {
          await apiUpdateCouponUsage({ couponCode: couponCodeFromURL, userId: currentUser._id });
        }
        setIsSuccess(true);
        setTimeout(()=>{
          Swal.fire('Congratulation !!!', 'Your order has been successfully completed', 'success').then(()=>{
              navigate('/')
          })
        }, 1500)
      }
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 animate-gradient-x">
      {isSuccess && <Congratulation />}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold bg-clip-text bg-gradient-to-r text-[#0a66c2] mb-8">Checkout Details</h1>

            <div className="mb-8 bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#0a66c2] mb-4">Service</h2>
              <div className="space-y-4">
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900">{currentCartService[0]?.service?.name}</h3>
                    <p className="text-sm text-gray-500">Duration: {`${currentCartService[0]?.service?.duration}min`}</p>
                    <div className="flex items-center mt-1">
                    {
                      currentCartService[0]?.discountPrice === 0 ?
                      <span className="text-[#0a66c2] font-medium">
                        {formatPrice(currentCartService[0]?.originalPrice)} VNĐ
                      </span>:
                      <>
                        <span className="text-[#0a66c2] font-medium">
                          {formatPrice(currentCartService[0]?.discountPrice)} VNĐ
                        </span>
                        <span className="ml-2 text-gray-400 line-through">
                          {formatPrice(currentCartService[0]?.originalPrice)} VNĐ
                        </span>
                      </>
                    }
                      <span className="mx-2 text-gray-400">×</span>
                      <span className="text-gray-600">1</span>
                    </div>
                  </div>
              </div>
              </div>
          

          {/* Payment Methods Section */}
          <h2 className="text-xl font-semibold text-[#0a66c2] mb-4">Payment Method</h2>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${selectedPayment === method.id ? "border-blue-500 bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50" : "border-gray-200 hover:border-blue-200"}`}
                onClick={() => handlePaymentSelect(method.id)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-pink-100">
                      <method.icon className={`w-6 h-6 ${method.id === "paypal" ? "text-[#003087]" : method.id === "zalopay" ? "text-[#0068FF]" : method.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-600">
                        {method.id === "cod" ? "Pay when you receive your order" : `Pay with ${method.name}`}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center justify-center w-6 h-6 border-2 rounded-full ${selectedPayment === method.id ? "border-purple-500" : "border-gray-300"}`}>
                    {selectedPayment === method.id && (
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Order Summary Section */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium text-gray-900">
                    {`${formatPrice(currentCartService[0]?.originalPrice)} VNĐ`}
                  </p>
                </div>
                {currentCartService[0]?.discountPrice > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p className="flex items-center">
                      <MdOutlineDiscount className="mr-1" />
                      Total Savings
                    </p>
                    <p className="font-medium">{`- ${formatPrice(currentCartService[0]?.originalPrice - currentCartService[0]?.discountPrice)} VNĐ`}</p>
                  </div>
                )}
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <p className="text-lg font-semibold text-gray-900">Total</p>
                    <p className="text-lg font-semibold text-[#0a66c2]">
                    {`${formatPrice(currentCartService[0]?.discountPrice > 0 ? currentCartService[0]?.discountPrice : currentCartService[0]?.originalPrice)} VNĐ`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {showPaypal && (
              <Paypal amount={Math.round(totalPriceUSD)} payload={payload} setIsSuccess={setIsSuccess} onSuccess={handlePayment}/>
            )}

            <button
              className="mt-6 w-full bg-[#0a66c2] border border-transparent rounded-xl shadow-lg py-4 px-6 text-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300"
              onClick={handlePlaceOrder}
              disabled={!selectedPayment}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default memo(CheckoutService);