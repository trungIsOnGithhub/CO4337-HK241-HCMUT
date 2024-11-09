import React, { memo, useEffect, useState } from "react";
import banner from 'assets/data-stats-around-person-doing-physical-activity.jpg';


const Banner = () => {
    const sliderImages = [
        {
        id: 1,
        title: "Hairstylist",
        image: "https://images.unsplash.com/photo-1560869713-7d0a29430803"
        },
        {
        id: 2,
        title: "Barber",
        image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1"
        },
        {
        id: 3,
        title: "Nail",
        image: "https://hocvienmyanh.vn/upload/images/hoc-nail-di-nuoc-ngoai-3.jpg"
        },
        {
        id: 4,
        title: "Makeup",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9"
        },
        {
        id: 5,
        title: "Tattoo",
        image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28"
        },
        {
        id: 6,
        title: "Massage",
        image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1"
        },
        {
        id: 7,
        title: "Fitness",
        image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb"
        },
        {
        id: 8,
        title: "Gym",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48"
        },
        {
        id: 9,
        title: "Yoga",
        image: "https://images.unsplash.com/photo-1588286840104-8957b019727f"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
        setCurrentSlide((prevSlide) => 
            prevSlide === sliderImages.length - 1 ? 0 : prevSlide + 1
        );
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleImageError = (e) => {
        e.target.src = "https://images.unsplash.com/photo-1531297484001-80022131f5a1";
      };

    return (
        <div className="relative w-full h-[500px] overflow-hidden">
        {sliderImages.map((slide, index) => (
            <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            >
                <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover shadow-xl"
                    onError={handleImageError}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 flex justify-center">
                    <h2 className="text-xl font-bold">{slide.title}</h2>
                </div>
            </div>
        ))}
    </div>
    )
}


export default memo(Banner)