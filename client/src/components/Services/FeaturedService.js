import React, {useState, useEffect, memo} from 'react' 
import {Product, ServiceCard} from '../index'
import {apiGetProduct, apiGetServiceProviders} from 'apis'
import { apiGetServicePublic } from 'apis/service'
const FeaturedProduct = () => {
    const [product, setProduct] = useState(null)
    const fetchProduct = async ()=>{
        const response = await apiGetServiceProviders()
        // {limit:9, sort: '-totalRatings'}

        if(response?.success){
            setProduct(response.AllServiceProviders)
        }
    }
    useEffect(()=>{
        fetchProduct();
    }, [])
  return (
    <div className='w-main mb-8'>
        <h3 className='text-[15px] font-semibold py-[15px] border-b-2 border-[#0a66c2]'>FEATURED SERVICE PROVIDERS</h3>
        <div className='flex flex-wrap mt-[15px] mx-[-10px] mb-20'>
            {product?.map(el => {
                return (<ServiceCard 
                    provider={el}
                />);
            })}
        </div>
        <div className='grid grid-cols-4 grid-rows-2 gap-4'>

            <img 
                src="https://digital-world-2.myshopify.com/cdn/shop/files/banner1-bottom-home2_b96bc752-67d4-45a5-ac32-49dc691b1958_600x.jpg?v=1613166661"
                className='w-full h-full object-cover col-span-2 row-span-2'
                alt="">
            </img>

            <img 
                src="https://digital-world-2.myshopify.com/cdn/shop/files/banner2-bottom-home2_400x.jpg?v=1613166661"
                alt=""
                className='w-full h-full object-cover col-span-1 row-span-1'
                >
            </img>

            <img 
                src="https://digital-world-2.myshopify.com/cdn/shop/files/banner4-bottom-home2_92e12df0-500c-4897-882a-7d061bb417fd_400x.jpg?v=1613166661"
                className='w-full h-full object-cover col-span-1 row-span-2'
                alt="">
            </img>

            <img 
                src="https://digital-world-2.myshopify.com/cdn/shop/files/banner3-bottom-home2_400x.jpg?v=1613166661"
                alt=""
                className='w-full h-full object-cover col-span-1 row-span-1'
                >
            </img>


        </div>
    </div>
  )
}

export default memo(FeaturedProduct)