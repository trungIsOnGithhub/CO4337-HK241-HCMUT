import React from 'react'
import { MdOutlineCategory } from "react-icons/md";
import { formatPrice, formatPricee } from 'ultils/helper';
import { Button } from 'components'
import { useNavigate } from 'react-router-dom';


const ProductItem = ({productData}) => {
    console.log(productData)
    const navigate = useNavigate()

    const handleNavigateProductDetail  = () => {
        navigate(`/product/${productData.category?.toLowerCase()}/${productData?._id}/${productData?.title}`)
    }
    const handleOrderProduct = () => {

    }
  return (
    <div className='w-full h-fit rounded-md border border-[#868e96] relative'>
        <div className='w-full h-[200px]'>
            <img className='h-full w-full object-cover rounded-t-md' src={productData?.thumb} alt={productData?.name} />
        </div>
        <div className='w-full h-[184px] bg-[#212529] rounded-b-md px-[16px] py-[12px] flex flex-col justify-between'>
            <div className='w-full flex flex-col gap-1'>
                <span className='text-[18px] font-medium line-clamp-1'>{productData?.title}</span>
                <span className='flex items-center gap-4'>
                    <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Quantity <span className='text-white font-medium'>{`${productData?.quantity}`}</span></span>
                    <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Sold <span className='text-white font-medium'>{`${productData?.soldQuantity}`}</span></span>
                </span>
                <span className='text-[14px] text-[#868e96] flex items-center gap-2'><span className='flex gap-1 items-center'><MdOutlineCategory /> Category</span> <span className='font-medium'>{`${productData?.category}`}</span></span>
            </div>
            <div className='flex justify-between'>
            <Button handleOnclick={handleNavigateProductDetail} style={'px-[23px] rounded-md text-white border border-[#868e96] w-fit h-[40px]'}> Learn more</Button>
            <Button handleOnclick={handleOrderProduct} style={'px-[23px] rounded-md text-white bg-[#15a9e8] w-fit h-[40px]'}> Add to cart</Button>
            </div>
        </div>
        <div className='absolute right-2 top-2 w-fit h-fit px-[8px] py-[4px] bg-[rgba(52,58,64,1)] rounded-md'>
            <span className='text-[14px] flex items-center font-medium'>{`${formatPrice(formatPricee(productData?.price))} VNĐ`}</span>
        </div>
    </div>
  )
}

export default ProductItem
