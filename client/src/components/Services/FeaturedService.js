import React, {useState, useEffect, memo} from 'react' 
import {apiGetProduct, apiGetServiceProviders} from 'apis'
import { apiGetServicePublic } from 'apis/service'
import { FaBuilding, FaMapMarkerAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import defaultProvider from "../../assets/defaultProvider.jpg";
const FeaturedProduct = () => {
    const [providers, setProviders] = useState(null)
    const navigate = useNavigate()
    const fetchServiceProvider = async ()=>{
        const response = await apiGetServiceProviders({limit:6})

        if(response?.success){
            setProviders(response.AllServiceProviders)
        }
    }
    useEffect(()=>{
        fetchServiceProvider();
    }, [])

    const handleViewDetails = (providerId) => {
        navigate(`/detail_provider/${providerId}`)
    }

    console.log(providers)
  return (
    <div className='w-main mb-8'>
        <h3 className='text-[20px] font-semibold py-[12px] border-b-2 border-[#0a66c2] mb-8'>OUR SERVICE PROVIDERS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {providers?.map((provider) => (
          <div
            key={provider._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 cursor-pointer"
            role="article"
            aria-label={`Service provider ${provider?.bussinessName}`}
          >
            <div className="relative h-36">
              <img
                src={provider?.images[0] || defaultProvider}
                alt={provider?.bussinessName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740";
                }}
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">{provider?.bussinessName}</h2>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <FaBuilding className="mr-2" />
                  <span className='line-clamp-1'>{provider?.province}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2" />
                  <span className='line-clamp-1'>{provider.address}</span>
                </div>
              </div>
              <button
                onClick={() => handleViewDetails(provider?._id)}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`View details for ${provider.name}`}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
        <h3 className='text-[20px] font-semibold py-[12px] border-b-2 border-[#0a66c2] mb-8'>OUR GALLERY</h3>
        <div className="grid grid-cols-4 grid-rows-2 gap-4 cursor-pointer">
            <img
            src="https://thietkethicong.org/Uploads/images/SALONTOC/1/thiet-ke-salon-toc%20(8).jpg"
            className="w-full h-full object-cover col-span-2 row-span-2 transition-transform duration-300 hover:scale-110"
            alt="Book your service today"
            />
            <img
                src="https://cdn.dealtoday.vn/img/c500x334/bcab3057a7fb404ba36cd6dd372d9492.jpg?sign=iRf3wRKFPRC_hhDi48xuFg"
                className="w-full h-full object-cover col-span-1 row-span-1 transition-transform duration-300 hover:scale-110"
                alt="Top rated gym"
            />
            <img
                src="https://toplistvietnam.com/index.php/upload/media/entries/2023-01/11/396-entry-0-1673430874.jpg"
                className="w-full h-full object-cover col-span-1 row-span-2 transition-transform duration-300 hover:scale-110"
                alt="Massage"
            />
            <img
                src="https://barber-shop.vn/wp-content/uploads/2019/08/barber-shop-la-gi-8.jpeg"
                className="w-full h-full object-cover col-span-1 row-span-1 transition-transform duration-300 hover:scale-110"
                alt="Exclusive offers"
            />
        </div>
    </div>
  )
}

export default memo(FeaturedProduct)