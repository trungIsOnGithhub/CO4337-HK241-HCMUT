import React, { memo } from 'react'
import Slider from "react-slick";
import {Service} from '..'
const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1
  };
const CustomSliderService = ({products, activeTab, normal}) => {
  return (
    <>
        {products &&<Slider className='custom_slider' {...settings}>
            {products?.map(el =>(
                <Service key={el._id} 
                    serviceData={el}
                    isNew={ activeTab === 1 ? false : true}
                    normal={normal}
                />
            ))}
        </Slider>}
    </>
  )
}

export default memo(CustomSliderService)