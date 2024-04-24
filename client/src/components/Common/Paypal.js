import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";
import { current } from "@reduxjs/toolkit";
import { apiCreateOrder } from "apis/order";
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

    const handleCreateOrder = async() => {
        const response = await apiCreateOrder(payload)
        if(response.success){
            setIsSuccess(true)
            setTimeout(()=>{
                Swal.fire('Congratulation !!!', 'Your order has been successfully completed', 'success').then(()=>{
                    navigate('/')
                })
            }, 500)
        }
    }
    
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
                        console.log(response)
                        console.log(payload)
                        handleCreateOrder()
                    }
                })}
            />
        </>
    );
}

export default function Paypal({amount, payload, setIsSuccess}) {
    return (
        <div style={{ maxWidth: "750px", minHeight: "200px", margin: "auto" }}>
            <PayPalScriptProvider options={{ clientId: "test", components: "buttons", currency: "USD" }}>
                <ButtonWrapper payload={payload} currency={'USD'} amount={amount} showSpinner={false} setIsSuccess={setIsSuccess} />
            </PayPalScriptProvider>
        </div>
    );
}