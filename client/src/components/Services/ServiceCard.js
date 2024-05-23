import withBaseComponent from 'hocs/withBaseComponent'
import React, { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import {renderStarfromNumber, formatPrice} from 'ultils/helper'
const ServiceCard = ({provider}) => {
  const navigate = useNavigate()
  return (
    <div 
      onClick={()=> navigate(`/to-provider-detail`)}
      className='w-1/3 px-[10px] mb-[20px] cursor-pointer'>

      <div className='border flex-auto flex w-full'>
        <img src={provider?.images[0]} alt='products' className='w-[200px] h-[160px] object-contain p-4'/>
        <div className='flex flex-col mt-[15px] items-start gap-1 w-full text-xs'>
          <span className='line-clamp-1 capitalize text-sm'>{provider.bussinessName}</span>
          <span className='flex h-4'>{renderStarfromNumber(4, 14)?.map((el,index)=>(
            <span key={index}>{el}</span>
          ))}</span>
          <span>{`${provider.ward}, ${provider.district}, ${provider.province}`}</span>
          <button>Go To Detail</button>
        </div>
      </div>
    </div>
  )
}

export default withBaseComponent(memo(ServiceCard))