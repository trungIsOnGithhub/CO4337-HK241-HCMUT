
import { Product } from 'components';
import ProductItemWishList from 'components/Products/ProductItemWishList';
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { getCurrent } from 'store/user/asyncAction';

const WishListProduct = () => {
  const {current} = useSelector(state => state.user)
  const dispatch = useDispatch()
  
  useEffect(() => {
    dispatch(getCurrent())
  }, []);

  return (
    <div className='w-full relative px-4'>
      <header className='text-3xl font-semibold py-4 border-b border-b-gray-200'>Product Wish List</header>
      <div className='mt-8 w-full m-auto flex gap-4 flex-wrap mb-4'>
        {current?.wishlistProduct?.map((product, index) => (
          <div key={index} className='w-[32%]'>
            <ProductItemWishList productData={product}/>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WishListProduct