import React, {useState, useEffect, memo} from 'react'
import {apiGetProduct} from 'apis/product'
import {Service, CustomSliderService} from '..'
import { useDispatch, useSelector} from 'react-redux'
import clsx from 'clsx'
import { apiGetServicePublic } from 'apis/service'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { createSearchParams } from 'react-router-dom'

const serviceData = [
    {
      id: 1,
      name: "Hairstylist",
      image: "images.unsplash.com/photo-1560869713-7d0a29430803"
    },
    {
      id: 2,
      name: "Barber",
      image: "images.unsplash.com/photo-1503951914875-452162b0f3f1"
    },
    {
      id: 3,
      name: "Nail",
      image: "kbeauty.fpt.edu.vn/wp-content/uploads/2020/07/FPT_Polytechnic_-nail.1.jpg"
    },
    {
      id: 4,
      name: "Makeup",
      image: "images.unsplash.com/photo-1487412947147-5cebf100ffc2"
    },
    {
      id: 5,
      name: "Tattoo",
      image: "images.unsplash.com/photo-1598371839696-5c5bb00bdc28"
    },
    {
      id: 6,
      name: "Massage",
      image: "images.unsplash.com/photo-1600334129128-685c5582fd35"
    },
    {
      id: 7,
      name: "Fitness",
      image: "images.unsplash.com/photo-1534258936925-c58bed479fcb"
    },
    {
      id: 8,
      name: "Gym",
      image: "images.unsplash.com/photo-1534438327276-14e5300c3a48"
    },
    {
      id: 9,
      name: "Yoga",
      image: "images.unsplash.com/photo-1588286840104-8957b019727f"
    }
  ];

const BestSeller = () => {
    const {isShowModal} = useSelector(state => state.app)
    const [currentIndex, setCurrentIndex] = useState(0);
    const [services, setServices] = useState([])

    useEffect(() => {
        const fetchServiceData = async () => {
          const response = await apiGetServicePublic({limit: 10})
          setServices(response.services)
        }
        fetchServiceData()
    }, [])
    

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
        prevIndex === serviceData.length - 2 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? serviceData.length - 2 : prevIndex - 1
        );
    };
    return (
        <div className={clsx('px-8 py-4', isShowModal ? 'hidden' : '' )} style={{marginBottom:'20px'}}>
            <div className='mx-[-10px]'>
                <CustomSliderService services={services} normal={false}/>
            </div>
            <div className="relative w-full">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 relative">
                    {[currentIndex, currentIndex + 1].map((index) => (
                        <div
                        key={serviceData[index].id}
                        className="relative w-full md:w-1/2 h-[300px] transition-transform duration-500 ease-in-out transform hover:scale-105"
                        >
                        <img
                            src={`https://${serviceData[index].image}`}
                            alt={serviceData[index].name}
                            className="w-full h-full object-cover rounded-lg shadow-2xl"
                            onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1560869713-7d0a29430803";
                            }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                            <h2 className="text-white text-3xl font-bold tracking-wider">
                            {serviceData[index].name}
                            </h2>
                        </div>
                        </div>
                    ))}
                    </div>

                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        aria-label="Previous slide"
                        >
                        <FaChevronLeft className="text-gray-800 text-xl" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        aria-label="Next slide"
                        >
                        <FaChevronRight className="text-gray-800 text-xl" />
                    </button>
                </div>
            </div>
        </div>

    )
}

export default memo(BestSeller)