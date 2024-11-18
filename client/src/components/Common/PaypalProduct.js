import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";
import { current } from "@reduxjs/toolkit";
import { apiUpdateCouponUsage } from "apis";
import { apiCreateOrder } from "apis/orderProduct";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// This value is from the props in the UI
const style = {"layout":"vertical"};

// Custom component to wrap the PayPalButtons and show loading spinner
const ButtonWrapper = ({ currency, showSpinner, amount, payload, setIsSuccess}) => {
    const [{ isPending, options }, dispatch] = usePayPalScriptReducer();
    const navigate = useNavigate()

    useEffect(() => {
        dispatch({
            type: 'resetOptions',
            value: {
                ...options, currency: currency
            }
        })
    }, [currency, showSpinner])

    const handleCreateOrder = async () => {
        try {
            const { providerProductDetails, providerTotalPrice, providerTotalProductPrice, providerTotalSavingPrice, providerTotalShippingPrice, providerSelectedDiscount } = payload;
    
            // Duyệt qua từng provider và tạo đơn hàng
            for (let i = 0; i < providerProductDetails.length; i++) {
                const provider = providerProductDetails[i];
                const providerId = provider.providerId;
                
                // Tìm các thông tin liên quan đến provider hiện tại
                const totalProductPriceObj = providerTotalProductPrice.find(item => item.providerId === providerId);
                const totalPriceObj = providerTotalPrice.find(item => item.providerId === providerId);
                const totalSavingPriceObj = providerTotalSavingPrice.find(item => item.providerId === providerId);
                const shippingPriceObj = providerTotalShippingPrice.find(item => item.providerId === providerId);
                const discountObj = providerSelectedDiscount.find(item => item.providerId === providerId);
                
                // Tạo đối tượng dữ liệu cho yêu cầu tạo đơn hàng
                const orderData = {
                    products: provider.products.map(product => ({
                        productId: product?.productId,
                        variantId: product?.variantId,
                        quantity: product?.quantity,
                        color: product?.color,
                        colorCode: product?.colorCode,
                        thumb: product?.thumb,
                        title: product?.title,
                        originalPrice: product?.originalPrice,
                        discountPrice: product?.discountPrice,
                    })),
                    shippingPrice: shippingPriceObj ? shippingPriceObj.shippingPrice : 0,
                    totalProductPrice: totalProductPriceObj ? totalProductPriceObj.totalPrice : 0,
                    totalPrice: totalPriceObj ? totalPriceObj.totalPrice : 0,
                    savingPrice: totalSavingPriceObj ? totalSavingPriceObj.totalSavings : 0,
                    provider: providerId,
                    discountCode: discountObj && discountObj.selectedDiscount ? discountObj.selectedDiscount : null, // Kiểm tra selectedDiscount
                    statusPayment: 'Successful',
                    statusShipping: 'Pending'
                };
    
                // Gửi yêu cầu tạo đơn hàng lên backend
                const response = await apiCreateOrder(orderData);
    
                if (response.success) {
                    console.log(`Order created successfully for provider ${providerId}`);
                    if(discountObj?.selectedDiscount){
                        await apiUpdateCouponUsage({ couponCode: discountObj?.selectedDiscount?.code, userId: current._id });
                    }
                } else {
                    console.log(`Failed to create order for provider ${providerId}`);
                }
            }
    
            // Thông báo khi hoàn tất
            setIsSuccess(true);
            setTimeout(() => {
                Swal.fire('Congratulation !!!', 'Your order has been successfully completed', 'success').then(() => {
                    navigate('/');
                });
            }, 1500);
        } catch (error) {
            console.error('Error creating order:', error);
            Swal.fire('Error', 'Failed to create order', 'error');
        }
    };
    return (
        <>
            { (showSpinner && isPending) && <div className="spinner" /> }
            <PayPalButtons
                style={style}
                disabled={false}
                forceReRender={[style, currency, amount]}
                fundingSource={undefined}
                createOrder={(data, actions)=> actions.order.create({
                    purchase_units: [{
                        amount:{currency_code: currency, value: amount}
                    }]
                }).then(orderId => orderId)}
                    
                onApprove={(data, actions)=>actions.order.capture().then(async(response)=>{
                    if(response.status === 'COMPLETED'){
                        handleCreateOrder()
                    }
                })}
            />
        </>
    );
}

export default function PaypalProduct({amount, payload, setIsSuccess}) {
    console.log(payload)
    return (
        <div style={{ maxWidth: "750px", minHeight: "200px", margin: "auto" }}>
            <PayPalScriptProvider options={{ clientId: "test", components: "buttons", currency: "USD" }}>
                <ButtonWrapper payload={payload} currency={'USD'} amount={amount} showSpinner={false} setIsSuccess={setIsSuccess} />
            </PayPalScriptProvider>
        </div>
    );
}