import { apiUpdateCartProduct, apiUpdateWishlistProduct } from 'apis'
import Button from 'components/Buttons/Button'
import React, { useEffect, useState } from 'react'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { FaCartPlus } from 'react-icons/fa'
import { MdOutlineCategory } from 'react-icons/md'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getCurrent } from 'store/user/asyncAction'
import Swal from 'sweetalert2'
import { formatPrice, formatPricee } from 'ultils/helper'
import path from 'ultils/path'

const ProductItemWishList = ({productData}) => {
    const {current} = useSelector(state => state.user)
    const {isLogin} = useSelector(state => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()
    const [isWishlisted, setIsWishlisted] = useState(false)

    useEffect(() => {
        if(current?.wishlistProduct?.some(el => el?._id === productData?._id)){
          setIsWishlisted(true)
        }
        else{
          setIsWishlisted(false)
        }
      }, [current, productData]);
  
    const handleNavigateLearnMoreProduct = ( ) => {
      navigate(`/product/${productData.category?.toLowerCase()}/${productData?._id}/${productData?.title}`)
      console.log(productData)
    }
  
    const handleWishlist = async() => {
        if(!isLogin){
          Swal.fire({
              text: 'Login to add wishlist',
              cancelButtonText: 'Cancel',
              confirmButtonText: 'Go login',
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              title: 'Oops!',
              showCancelButton: true,
          }).then((rs)=>{
              if(rs.isConfirmed){
                  navigate(`/${path.LOGIN}`)
              }
          })
        }
        else{
          const response = await apiUpdateWishlistProduct({pid: productData?._id})
          if(response.success){
            dispatch(getCurrent())
            toast.success(response.mes)
          }
          else{
            toast.error(response.mes)
          }
        }
      }
    return (
      <div className='cursor-pointer w-full h-fit rounded-md relative shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300'>
        <button
            onClick={handleWishlist}
            className="absolute top-2 left-2 group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full p-2 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
            <div className="transition-transform duration-300 ease-in-out transform group-hover:scale-125">
            {isWishlisted ? (
                <AiFillHeart className="w-6 h-6 text-red-500 transition-colors duration-300 animate-pulse" />
            ) : (
                <AiOutlineHeart className="w-6 h-6 text-red-500 hover:text-red-600 transition-colors duration-300" />
            )}
            </div>
        </button>
          <div className='w-full h-[200px]' onClick={()=>{navigate(`/product/${productData.category?.toLowerCase()}/${productData?._id}/${productData?.title}`)}}>
              <img className='h-full w-full object-contain rounded-t-md' src={productData?.thumb} alt={productData?.name} />
          </div>
          <div className='w-full h-[184px] rounded-b-md px-[16px] py-[12px] flex flex-col justify-between'>
              <div className='w-full flex flex-col gap-1'>
                  <span className='text-[18px] font-medium line-clamp-1'>{productData?.title}</span>
                  <span className='flex items-center gap-4'>
                      <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Quantity <span className='text-black font-medium'>{`${productData?.quantity >= 0 ? productData?.quantity : 0}`}</span></span>
                      <span className='text-[14px] text-[#868e96] flex gap-2 items-center'>Sold <span className='text-black font-medium'>{`${productData?.soldQuantity}`}</span></span>
                  </span>
                  <span className='text-[14px] text-[#868e96] flex items-center gap-2'><span className='flex gap-1 items-center'><MdOutlineCategory/> Category</span> <span className='font-medium'>{`${productData?.category}`}</span></span>
              </div>
              <div className='flex justify-between'>
              <Button handleOnclick={handleNavigateLearnMoreProduct} style={'px-[10px] rounded-md text-black border border-[#868e96] w-full h-[40px] hover:bg-gray-400'}>Learn more</Button>
              </div>
          </div>
          <div className='absolute right-2 top-2 w-fit h-fit px-[8px] py-[4px] bg-[#0a66c2] text-white rounded-md'>
              <span className='text-[14px] flex items-center font-medium'>{`${formatPrice(formatPricee(productData?.price))} VNĐ`}</span>
          </div>
      </div>
    )
  }

export default ProductItemWishList