import React, { memo, useEffect, useState } from 'react'
import paypalLogo from 'assets/card-payment.svg';
import { useSelector } from 'react-redux';
import { formatPrice } from 'ultils/helper';
import { Congratulation, InputForm, PaypalProduct } from 'components';
import { useForm } from 'react-hook-form';
import withBaseComponent from 'hocs/withBaseComponent';
import { getCurrent } from 'store/user/asyncAction';
import path from 'ultils/path';
import { MdOutlineDiscount } from 'react-icons/md';
import { FaPaypal } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import { TbTruckDelivery } from "react-icons/tb";
import axios from 'axios';


const CheckoutProduct = ({dispatch, navigate}) => {
  const {currentCartProduct, current} = useSelector(state => state.user)
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(null); // State để lưu trữ tỉ giá hối đoái

  const providerProductDetails = JSON.parse(sessionStorage.getItem('providerProductDetails'));
  const providerTotalProductPrice = JSON.parse(sessionStorage.getItem('providerTotalProductPrice'));
  const providerTotalSavingPrice = JSON.parse(sessionStorage.getItem('providerTotalSavingPrice'));
  const providerTotalShippingPrice = JSON.parse(sessionStorage.getItem('providerTotalShippingPrice'));
  const providerTotalPrice = JSON.parse(sessionStorage.getItem('providerTotalPrice'));
  const providerSelectedDiscount = JSON.parse(sessionStorage.getItem('providerSelectedDiscount'));
  const totalPrice = JSON.parse(sessionStorage.getItem('totalPrice'));
  const totalProductPrice = JSON.parse(sessionStorage.getItem('totalProductPrice'));
  const totalSavingPrice = JSON.parse(sessionStorage.getItem('totalSavings'));
  const totalShippingPrice = JSON.parse(sessionStorage.getItem('totalShippingPrice'));

  console.log(providerProductDetails)

  const [selectedPayment, setSelectedPayment] = useState("");
  const paymentMethods = [
    { id: "paypal", name: "PayPal", icon: FaPaypal },
    { id: "zalopay", name: "ZaloPay", icon: SiZalo },
    { id: "cod", name: "Cash on Delivery", icon: TbTruckDelivery, iconColor: "text-green-600" }
  ];

  const handlePaymentSelect = (paymentId) => {
    setSelectedPayment(paymentId);
    setShowPaypal(false);
  };

  const handlePlaceOrder = () => {
    if (!selectedPayment) {
      alert("Please select a payment method");
      return;
    }

    if (selectedPayment === 'paypal') {
      setShowPaypal(true); // Hiển thị PaypalProduct nếu chọn PayPal
    } else {
      alert(`Order placed successfully with ${selectedPayment} payment method!`);
    }
  };

  
  const allProducts = providerProductDetails.flatMap(provider => provider.products);

  useEffect(() => {
    if(isSuccess){
      dispatch(getCurrent())
    }
  }, [isSuccess])

  const payload = {
    providerTotalProductPrice,
    providerTotalSavingPrice,
    providerTotalShippingPrice,
    providerTotalPrice,
    providerSelectedDiscount,
    providerProductDetails,
    totalPrice,
    totalProductPrice,
    totalSavingPrice,
    totalShippingPrice
  };

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

  const totalPriceUSD = exchangeRate ? totalPrice / exchangeRate : null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 animate-gradient-x">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold bg-clip-text bg-gradient-to-r text-[#0a66c2] mb-8">Checkout Details</h1>

            {/* Product Summary Section */}
            <div className="mb-8 bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#0a66c2] mb-4">Order Items</h2>
              <div className="space-y-4">
                {allProducts?.map((product) => (
                  <div key={product?.productId} className="flex items-center space-x-4 bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                    <img
                      src={product?.thumb}
                      alt={product?.title}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1560393464-5c69a73c5770";
                      }}
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900">{product?.title}</h3>
                      <p className="text-sm text-gray-500">Color: {product?.color}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-[#0a66c2] font-medium">
                          {formatPrice(product?.discountPrice)} VNĐ
                        </span>
                        {product?.originalPrice !== product?.discountPrice && (
                          <span className="ml-2 text-gray-400 line-through">
                            {formatPrice(product?.originalPrice)} VNĐ
                          </span>
                        )}
                        <span className="mx-2 text-gray-400">×</span>
                        <span className="text-gray-600">{product?.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#0a66c2]">
                        ${(product?.discountPrice * product?.quantity).toFixed(2)}
                      </p>
                      {product.price !== product.discountedPrice && (
                        <p className="text-sm text-green-600 flex items-center">
                          <MdOutlineDiscount className="mr-1" />
                          Save ${((product?.originalPrice - product?.discountPrice) * product?.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
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
                      {`${formatPrice(totalProductPrice)} VNĐ`}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Shipping</p>
                    <p className="font-medium text-gray-900">
                    {`${formatPrice(totalShippingPrice)} VNĐ`}
                    </p>
                  </div>
                  {totalSavingPrice > 0 && (
                    <div className="flex justify-between text-green-600">
                      <p className="flex items-center">
                        <MdOutlineDiscount className="mr-1" />
                        Total Savings
                      </p>
                      <p className="font-medium">{`- ${formatPrice(totalSavingPrice)} VNĐ`}</p>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <p className="text-lg font-semibold text-gray-900">Total</p>
                      <p className="text-lg font-semibold text-[#0a66c2]">
                      {`${formatPrice(totalPrice)} VNĐ`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {showPaypal && (
                <PaypalProduct amount={Math.round(totalPriceUSD)} payload={payload} setIsSuccess={setIsSuccess} />
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
  )
}

export default withBaseComponent(memo(CheckoutProduct))