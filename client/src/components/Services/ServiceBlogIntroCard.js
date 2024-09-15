import withBaseComponent from 'hocs/withBaseComponent'
import React, { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import {renderStarfromNumber } from 'ultils/helper'
const ServiceBlogIntroCard = ({provider}) => {
  const navigate = useNavigate()
  return (
    <div 
      onClick={()=> navigate(`/to-provider-detail`)}
      className='px-[10px] mb-[20px] cursor-pointer'>

      <div className='border flex-auto flex w-full'>
        <img src={provider?.images || 'https://noithatkendesign.vn/storage/app/media/uploaded-files/san-vuon8.jpg'} alt='products' className='w-[200px] h-[160px] object-contain p-4'/>
        <div className='flex flex-col mt-[15px] items-start gap-1 w-full'>
          <span className='line-clamp-1 capitalize text-xl'>{provider.bussinessName}</span>
          <span className='flex h-4'>{renderStarfromNumber(4, 14)?.map((el,index)=>(
            <span key={index}>{el}</span>
          ))}</span>
          <span className='line-clamp-1 text-lg'>{`${provider.ward}, ${provider.district}, ${provider.province}`}</span>
          <span className='line-clamp-1 text-md'>Joined Date: {`${new Date(provider?.createdAt).toLocaleDateString('en-US')}`}</span>
          <a href="#">View Provider Details</a>
        </div>
      </div>
    </div>
  )
}

export default withBaseComponent(memo(ServiceBlogIntroCard))