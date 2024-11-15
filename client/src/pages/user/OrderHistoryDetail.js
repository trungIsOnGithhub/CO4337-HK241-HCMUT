import { apiGetOneOrderProduct } from 'apis/orderProduct';
import React, {useEffect, useState} from 'react'
import { FiPackage, FiTruck, FiCheck } from "react-icons/fi";
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatPrice } from 'ultils/helper';

const OrderHistoryDetail = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderProductData, setOrderProductData] = useState(null)
    const {oid} = useParams()
    console.log(oid)

    useEffect(() => {
        const fetOrderProduct = async () => {
            const response = await apiGetOneOrderProduct(oid)
            if(response?.success){
                setOrderProductData(response?.order)
            }
        }
        fetOrderProduct()
    }, [oid]);

    const StatusIndicator = ({ status }) => {
        const stages = ["Pending", "Shipping", "Delivered"];
        const currentIndex = stages.indexOf(status);
    
        return (
          <div className="flex items-center justify-between w-full mb-8">
            {stages.map((stage, index) => (
              <div key={stage} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentIndex ? "bg-blue-500" : "bg-gray-200"}`}>
                  {index === 0 && <FiPackage className="text-white" />}
                  {index === 1 && <FiTruck className="text-white" />}
                  {index === 2 && <FiCheck className="text-white" />}
                </div>
                <p className={`mt-2 text-sm ${index <= currentIndex ? "text-blue-500 font-semibold" : "text-gray-500"}`}>
                  {stage}
                </p>
              </div>
            ))}
          </div>
        );
      };

    const handleCancelOrder = () => {
        setIsLoading(true);
        setTimeout(() => {
          toast.success("Order cancelled successfully");
          setShowCancelModal(false);
          setIsLoading(false);
        }, 1500);
      };
    return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg my-4">
        <h1 className="text-2xl font-bold mb-6">Track Your Order</h1>
        <div className="mb-8">
        <p className="text-gray-600 mb-2">Order ID: {orderProductData?._id}</p>
        </div>

        <StatusIndicator status={orderProductData?.statusShipping} />

        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        <div className="space-y-4">
            {orderProductData?.products.map((product) => (
            <div key={product?.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <img
                src={product?.thumb}
                alt={product?.title}
                className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                <h3 className="font-medium">{product?.title}</h3>
                <p className="text-gray-500">Quantity: {product?.quantity}</p>
                <p className="text-blue-600">{formatPrice(product?.discountPrice * product?.quantity)} VNĐ</p>
                </div>
            </div>
            ))}
        </div>
        </div>

        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Price Breakdown</h2>
        <div className="space-y-2">
            <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatPrice(orderProductData?.totalProductPrice)} VNĐ</span>
            </div>
            <div className="flex justify-between">
            <span className="text-gray-600">Shipping Fee</span>
            <span>{formatPrice(orderProductData?.shippingPrice)} VNĐ</span>
            </div>
            <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(orderProductData?.savingPrice)} VNĐ</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total</span>
            <span>{formatPrice(orderProductData?.totalPrice)} VNĐ</span>
            </div>
        </div>
        </div>

        <button
        onClick={() => setShowCancelModal(true)}
        className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
        Cancel Order
        </button>

        {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Cancellation</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this order?</p>
            <div className="flex space-x-4">
                <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                No, Keep Order
                </button>
                <button
                onClick={handleCancelOrder}
                disabled={isLoading}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                {isLoading ? "Cancelling..." : "Yes, Cancel Order"}
                </button>
            </div>
            </div>
        </div>
        )}

        <ToastContainer position="bottom-right" />
    </div>
  )
}

export default OrderHistoryDetail
