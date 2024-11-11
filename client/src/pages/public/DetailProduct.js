import React ,{useState, useEffect, useCallback, memo, useRef}from 'react'
import {createSearchParams, useParams} from 'react-router-dom'
import { apiGetOneProduct, apiGetProduct, apiRatings } from '../../apis/product'
import { apiGetOneService } from '../../apis/service'
import {Breadcrumb, Button, SelectQuantity, ServiceExtra, ServiceInformation, CustomSliderProduct} from '../../components'
import Slider from "react-slick";
import ReactImageMagnify from 'react-image-magnify';
import { formatPrice, formatPricee, renderStarfromNumber } from '../../ultils/helper';
import {productExtra} from '../../ultils/constant'
import DOMPurify from 'dompurify';
import clsx from 'clsx';
import { set } from 'react-hook-form';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { apiUpdateCartProduct, apiUpdateWishlistProduct } from 'apis';
import path from 'ultils/path';
import withBaseComponent from 'hocs/withBaseComponent';
import { toast } from 'react-toastify';
import { getCurrent } from 'store/user/asyncAction';
import { MdCategory, MdDateRange } from 'react-icons/md'
import { IoColorPaletteOutline } from 'react-icons/io5'
import { BsBoxSeam } from 'react-icons/bs'
import { FaChevronLeft, FaChevronRight, FaHeart, FaStar } from 'react-icons/fa'
import avatarDefault from '../../assets/avatarDefault.png'

const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1
};


const DetailProduct = ({isQuickView, data, location, dispatch, navigate}) => {
  const nameRef = useRef()
  const {current} = useSelector(state => state.user)
  const {isLogin} = useSelector(state => state.user)
  const params =useParams()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  
  const [category, setCategory] = useState(null)
  
  const [variantt, setVariantt] = useState(null)
  
  const [sid, setSid] = useState(null)
  
  const [update, setUpdate] = useState(false)
  const [currentProduct, setCurrentProduct] = useState({
    title:'',
    color: '',
    price: 0,
    quantity: 0,
    colorCode: '',
    thumb:'',
    image: [],
    pid: null,
    variantId: null
  })

  const reRender = useCallback(() => {
    setUpdate(!update)
  },[update])

  const [selectedColor, setSelectedColor] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState("");

  const [newReview, setNewReview] = useState({
    comment: "",
    rating: 0,
  });

  const validateReview = () => {
    if (newReview.rating === 0) {
      setError("Please select a rating between 1 and 5 stars");
      return false;
    }
    if (!newReview.comment.trim()) {
      setError("Please enter a comment");
      return false;
    }
    return true;
  };
  
  const handleSubmitReview = async(e) => {
    if(!isLogin){
      Swal.fire({
          text: 'Login to review',
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
      e.preventDefault();
      setError("");
      if (validateReview()) {
        await apiRatings({star: newReview?.rating, comment: newReview?.comment, pid: product?._id, updatedAt:Date.now() })
        setNewReview({ comment: "", rating: 0});
        fetchProductData()
      }
    }
  };

  const images = [ currentProduct?.thumb, ...(Array.isArray(currentProduct?.image) ? currentProduct.image : [])] || []
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  useEffect(() => {
    if(sid){
      fetchProductData()
    }
    window.scrollTo(0,0)
    nameRef.current?.scrollIntoView({block: 'center'})
  }, [sid])

  useEffect(() => {
    if(!variantt){
      setCurrentProduct({
        title: product?.title,
        thumb: product?.thumb,
        image: product?.image,
        price: product?.price,
        colorCode: product?.colorCode,
        color: product?.color,
        quantity: product?.quantity,
        pid: product?._id,
        variantId: null
      })
      setSelectedColor(product?.colorCode)
    }
  }, [product]);
  console.log(product)
  
  useEffect(() => {
    if(data){
      setSid(data.sid)
      setCategory(data.category)
    }
    else if(params){
      setSid(params.sid)
      setCategory(params.category)
    }

  }, [data, params])

  
  useEffect(() => {
    if(variantt){
      setCurrentProduct({
        title: product?.variants?.find(el => el?._id === variantt)?.title,
        color: product?.variants?.find(el => el?._id === variantt)?.color,
        price: product?.price,
        quantity: product?.variants?.find(el => el?._id === variantt)?.quantity,
        thumb: product?.variants?.find(el => el?._id === variantt)?.thumb,
        image: product?.variants?.find(el => el?._id === variantt)?.image,
        colorCode: product?.variants?.find(el => el?._id === variantt)?.colorCode,
        pid: product?._id,
        variantId: product?.variants?.find(el => el?._id === variantt)?._id,
      })
    }
    else{
      setCurrentProduct({
        title: product?.title,
        color: product?.color,
        thumb: product?.thumb,
        image: product?.image,
        price: product?.price,
        colorCode: product?.colorCode,
        quantity: product?.quantity,
        pid: product?._id,
        variantId: null
      })
    }
    setCurrentImageIndex(0)
    setQuantity(1)
  }, [variantt])
  
  const fetchProductData = async ()=>{
    const response = await apiGetOneProduct(sid)
    if(response.success){
      setProduct(response?.product)
    }
  }


  // useEffect(() => {
  //   if(sid){
  //     fetchProductData()
  //   }
  // }, [update])

  // const handleAddtoCart = async() => { 
  //   if(!current){
  //     return Swal.fire({
  //       name: "You haven't logged in",
  //       text: 'Please login and try again',
  //       icon: 'warning',
  //       showConfirmButton: true,
  //       showCancelButton: true,
  //       confirmButtonText: 'Go to Login',
  //       cancelButtonText: 'Not now',                
  //     }).then((rs)=>{
  //       if(rs.isConfirmed){
  //         navigate({
  //           pathname: `/${path.LOGIN}`,
  //           search: createSearchParams({
  //             redirect: location.pathname}).toString(),
  //         })
  //       }
  //     })
  //   }
  //   const response = await apiUpdateCartProduct({
  //       pid: sid, 
  //       color: currentProduct?.color || product?.color, 
  //       quantity, 
  //       price: currentProduct?.price || product?.price, 
  //       thumb: currentProduct?.thumb || product?.thumb,
  //       title: currentProduct?.title || product?.title,
  //       provider:product?.provider_id,
  //     })
  //   if(response.success){
  //     toast.success(response.mes)
  //     dispatch(getCurrent())
  //   }
  //   else{
  //     toast.error(response.mes)
  //   }
  //  }

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
      const response = await apiUpdateWishlistProduct({pid: product?._id})
      if(response.success){
        dispatch(getCurrent())
        toast.success(response.mes)
      }
      else{
        toast.error(response.mes)
      }
    }
  }

  useEffect(() => {
    if(current?.wishlistProduct?.some(el => el === product?._id)){
      setIsWishlisted(true)
    }
    else{
      setIsWishlisted(false)
    }
  }, [current, product]);

  const handleAddProductToCart = async() => {
    if(!isLogin){
      Swal.fire({
          text: 'Login to review',
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
      const response = await apiUpdateCartProduct({
        pid: product?._id, 
        quantity: quantity, 
        color: currentProduct?.color, 
        colorCode: currentProduct?.colorCode || "#000000",
        price: currentProduct?.price, 
        thumb: currentProduct?.thumb, 
        title: currentProduct?.title, 
        provider: product?.provider_id,
        variantId: currentProduct?.variantId
      })
      if(response.success){
        toast.success(response.mes)
        dispatch(getCurrent())
      }
      else{
        toast.error(response.mes)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 md:p-8">
      <div className="w-main mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Image Gallery */}
          <div className="md:w-1/2 relative">
            <img
              src={images[currentImageIndex]}
              alt="Product"
              className="w-[600px] h-[500px] object-contain cursor-pointer shadow-xl"
              // onClick={() => setShowModal(true)}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1522338140262-f46f5913618a";
              }}
            />
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            >
              <FaChevronLeft className="text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            >
              <FaChevronRight className="text-gray-800" />
            </button>
            <div className='flex gap-2 max-w-[600px] justify-center overflow-x-auto mt-4 scrollbar-thin'>
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className={`w-20 h-20 object-cover cursor-pointer rounded-lg ${currentImageIndex === index ? "border-2 border-[#0a66c2]" : "border border-gray-400"}`}
                  onClick={() => setCurrentImageIndex(index)}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1522338140262-f46f5913618a";
                  }}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-8">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900">{currentProduct?.title}</h1>
              <button
                onClick={handleWishlist}
                className={`p-2 rounded-full ${isWishlisted ? "text-red-500" : "text-gray-400"} hover:bg-gray-100`}
              >
                <FaHeart size={24} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center justify-center gap-1 my-2 text-xl">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < Math.round(product?.totalRatings) ? "text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-3xl font-bold text-[#0a66c2]">{`${formatPrice(formatPricee(currentProduct?.price))} VNĐ`}</p>
              <p className="text-sm text-gray-500 mt-1">Free shipping on orders over $100</p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <MdCategory className="text-gray-600" size={20} />
                <span className="text-gray-600">{`Category: ${product?.category}`}</span>
              </div>
              <div className="flex items-center gap-4">
                <BsBoxSeam className="text-gray-600" size={20} />
                <span className="text-gray-600">In Stock: {currentProduct?.quantity} items</span>
              </div>
              <div className="flex items-center gap-4">
                <IoColorPaletteOutline className="text-gray-600" size={20} />
                <div className='flex gap-4 items-center'>
                  <span className="text-gray-600">{`Color: ${currentProduct?.color}`}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MdDateRange className="text-gray-600" size={20} />
                <span className="text-gray-600">Estimated Delivery: 3-5 business days</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Select Color</h3>
              <div className='flex flex-wrap gap-1 items-center'>
                <div onClick={()=>{setVariantt(null); setSelectedColor(product?.colorCode)}} className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${selectedColor === product?.colorCode ? "border-[#0a66c2]" : "border-gray-300"} hover:border-[#0a66c2] transition-colors`}>
                    <span
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: product?.colorCode }}
                    ></span>
                    <span className="text-gray-700">{product?.color}</span>
                    <span className="text-gray-500 text-sm">{`${formatPrice(formatPricee(product?.price))} VNĐ`}</span>
                </div>
                {
                  product?.variants?.map((variant) => (
                    <div onClick={()=>{setVariantt(variant?._id); setSelectedColor(variant?.colorCode)}}  className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${selectedColor === variant?.colorCode ? "border-[#0a66c2]" : "border-gray-300"} hover:border-[#0a66c2] transition-colors`}>
                      <span
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: variant?.colorCode }}
                      ></span>
                      <span className="text-gray-700">{variant?.color}</span>
                      <span className="text-gray-500 text-sm">{`${formatPrice(formatPricee(product?.price))} VNĐ`}</span>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-1">
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className='flex gap-4'>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentProduct?.quantity, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <button onClick={handleAddProductToCart} className="flex-1 bg-[#0a66c2] text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Product Description */}
        <div className="p-8 border-t border-gray-200 flex gap-4">
          <div className={clsx(product?.specifications?.length > 0 ? 'flex-7' : 'flex-1')}>
            <h2 className="text-2xl font-semibold mb-4">Product Description</h2>
            {
              product?.description?.length === 1 
                &&
              <div className='text-base leading-6 max-h-[600px] overflow-y-auto mt-6 scrollbar-thin' dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(product?.description[0])}}></div>
            }
          </div>
          {
            product?.specifications?.length > 0 &&
            <div className='flex-3'>
            <div className="bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium p-6 border-b">Technical Specifications</h3>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {product?.specifications?.map((spec, index) => (
                  <div
                    key={index}
                    className={`flex justify-between p-4 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  >
                    <span className="text-gray-600 font-medium">{spec?.key}</span>
                    <span className="text-gray-800">{spec?.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          }
        </div>

        {/* Reviews Section */}
        <div className="p-8 border-t border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800">{product?.totalRating?.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 my-2">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={index < Math.round(product?.totalRatings) ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">{product?.rating?.length} reviews</div>
              </div>
              
              <div className="flex-1 ml-8">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1 w-24">
                      <span className="text-sm">{rating}</span>
                      <FaStar className="text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: `${product?.rating?.length === 0 ? 0 : (product?.rating?.filter(el => el?.star === rating).length / product?.rating?.length) * 100}%`
                        }}
                      />
                    </div>
                    <div className="w-16 text-sm text-gray-600">
                      {product?.rating?.filter(el => el?.star === rating).length} reviews
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none"
                    >
                      <FaStar
                        className={star <= newReview.rating ? "text-yellow-400" : "text-gray-300"}
                        size={24}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  id="comment"
                  rows="4"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
              >
                Submit Review
              </button>
            </div>
          </form>

          <div className="space-y-6">
            {product?.rating?.map((review) => (
              <div key={review.id} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={review?.postedBy?.avatar || avatarDefault}
                    alt={'avatar_user'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{`${review?.postedBy?.lastName} ${review?.postedBy?.firstName}`}</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          className={index < review?.star ? "text-yellow-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-sm text-gray-500">
                    {new Date(review?.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600">{review?.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  )
}

export default withBaseComponent(memo(DetailProduct))