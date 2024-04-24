import React, { memo } from 'react'
import Slider from "react-slick";
import {Product} from '..'
const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1
  };
const CustomSlider = ({products, activeTab, normal}) => {
  return (
    <>
        {products &&<Slider className='custom_slider' {...settings}>
            {products?.map(el =>(
                <Product key={el._id} 
                    productData={el}
                    isNew={ activeTab === 1 ? false : true}
                    pid= {el._id}
                    normal={normal}
                />
            ))}
        </Slider>}
    </>
  )
}

export default memo(CustomSlider)