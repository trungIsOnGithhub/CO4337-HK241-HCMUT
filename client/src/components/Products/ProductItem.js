import React from 'react'
import { MdOutlineCategory } from "react-icons/md";
import { formatPrice, formatPricee } from 'ultils/helper';
import { Button } from 'components'
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx'

const ProductItem = ({providerData, productData}) => {
    // removed log
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
        <div className={clsx('w-full h-[184px] rounded-b-md px-[16px] py-[12px] flex flex-col justify-between', providerData?.theme === 'dark' ? 'bg-[#212529]' : providerData?.theme === 'light' ? 'bg-white' : '')}>
            <div className='w-full flex flex-col gap-1'>
                <span className='text-[18px] font-medium line-clamp-1'>{productData?.title}</span>
                <span className='flex items-center gap-4'>
                    <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Quantity <span  className={clsx('font-medium', providerData?.theme === 'dark' ? 'text-white' : providerData?.theme === 'light' ? 'text-black' : '')}>{`${productData?.quantity >= 0 ? productData?.quantity : 0}`}</span></span>
                    <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Sold <span  className={clsx('font-medium', providerData?.theme === 'dark' ? 'text-white' : providerData?.theme === 'light' ? 'text-black' : '')}>{`${productData?.soldQuantity}`}</span></span>
                </span>
                <span className='text-[14px] text-[#868e96] flex items-center gap-2'><span className='flex gap-1 items-center'><MdOutlineCategory /> Category</span> <span className='font-medium'>{`${productData?.category}`}</span></span>
            </div>
            <div className='flex justify-between'>
            <Button handleOnclick={handleNavigateProductDetail} style={clsx('px-[23px] rounded-md w-full h-[40px] hover:opacity-50', providerData?.theme === 'dark' ? 'text-white border border-[#868e96]' : providerData?.theme === 'light' ? 'text-black border border-gray-200 shadow-sm' : '')}> Learn more</Button>
            </div>
        </div>
        <div className={clsx('absolute right-2 top-2 w-fit h-fit px-[8px] py-[4px] rounded-md',providerData?.theme === 'dark' ? 'bg-[#494e53]' : providerData?.theme === 'light' ? 'bg-[rgba(230,235,239,1)]' : '')}>
            <span className='text-[14px] flex items-center font-medium'>{`${formatPrice(formatPricee(productData?.price))} VNĐ`}</span>
        </div>
    </div>
  )
}

export default ProductItem
