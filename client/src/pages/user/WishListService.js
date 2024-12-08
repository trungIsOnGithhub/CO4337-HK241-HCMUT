import { Button, Product, Service } from 'components'
import ServiceItemWishlist from 'components/Services/ServiceItemWishlist'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { getCurrent } from 'store/user/asyncAction'

const WishListService = () => {
  const {current} = useSelector(state => state.user)
  const dispatch = useDispatch()
  
  useEffect(() => {
    dispatch(getCurrent())
  }, []);

  // removed log

  return (
    <div className='w-full relative px-4'>
      <header className='text-3xl font-semibold py-4 border-b border-b-gray-200'>Service Wish List</header>
      <div className='mt-8 w-full m-auto flex gap-4 flex-wrap mb-4'>
        {current?.wishlist?.map((service, index) => (
          <div key={index} className='w-[32%]'>
            <ServiceItemWishlist serviceData={service}/>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WishListService