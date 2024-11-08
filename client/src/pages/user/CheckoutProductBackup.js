import React, { memo, useEffect, useState } from 'react'
import paypalLogo from 'assets/card-payment.svg';
import { useSelector } from 'react-redux';
import { formatPrice } from 'ultils/helper';
import { Congratulation, InputForm, PaypalProduct } from 'components';
import { useForm } from 'react-hook-form';
import withBaseComponent from 'hocs/withBaseComponent';
import { getCurrent } from 'store/user/asyncAction';
import path from 'ultils/path';


const CheckoutProduct = ({dispatch, navigate}) => {
  const {currentCartProduct, current} = useSelector(state => state.user)
  const [isSuccess, setIsSuccess] = useState(false)
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
  
  const allProducts = providerProductDetails.flatMap(provider => provider.products);

  console.log(allProducts);


  useEffect(() => {
    if(isSuccess){
      dispatch(getCurrent())
    }
  }, [isSuccess])

  return (
    <div className='p-8 w-full grid grid-cols-10 h-full max-h-screen overflow-y-auto gap-6'>
      {isSuccess && <Congratulation />}
      <div className='w-full flex items-center justify-center col-span-4'>
        <img className='h-[70%] object-contain' src={paypalLogo}></img>
      </div>
      <div className='w-full flex flex-col items-center justify-center gap-6 col-span-6'>
        <h2 className='text-3xl mb-6 font-bold'>Checkout your order !</h2>
        <div className='w-full flex gap-6 justify-between'>
          <div className='flex-1'>
          <table className='table-auto h-fit'>
            <thead>
              <tr className='border bg-gray-200 rounded-md'>
                <th className='text-center p-2'>Name</th>
                <th className='text-center p-2'>Quantity</th>
                <th className='text-center p-2'>Price</th>
              </tr>
            </thead>
            <tbody>
              {allProducts?.map(el=>(
                <tr key={el._id} className='border'>
                  <td className='text-center p-2'>{`${el.title} - ${el.color}`}</td>
                  <td className='text-center p-2'>{el.quantity}</td>
                  <td className='text-center p-2'>{`${formatPrice(el?.discountPrice * el?.quantity)} VND`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className='flex-1 flex flex-col justify-between'>
            <div className='flex flex-col gap-6 mb-6'>
              <span className='flex items-center gap-8 text-sm font-semibold'>
                <span>
                    Subtotal
                </span>
                <span className='text-[#0a66c2] font-semibold text-lg'>
                    {
                        `${formatPrice(totalPrice)} VND`
                    }
                </span>
              </span>
              <span className='flex items-center gap-8 text-sm font-semibold'>
                <span>
                    Address
                </span>
                <span className='text-gray-600 italic font-semibold text-lg'>
                    {
                      current?.address
                    }
                </span>
              </span>
            </div>
            <div className=''>
              <PaypalProduct 
                payload = {{
                  products: currentCartProduct,
                  total: Math.round(+currentCartProduct?.reduce((sum,el)=> +el?.price * +el?.quantity +sum, 0)/23500),
                  address: current?.address
                }}
                setIsSuccess = {setIsSuccess}
                amount = {Math.round(+currentCartProduct?.reduce((sum,el)=> +el?.price * +el?.quantity +sum, 0)/23500)}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withBaseComponent(memo(CheckoutProduct))