import React ,{useState, useEffect, useCallback, memo, useRef}from 'react'
import {createSearchParams, useLocation, useNavigate, useParams} from 'react-router-dom'
import { apiGetOneProduct, apiGetProduct } from '../../apis/product'
import { apiModifyUser, apiUpdateWishlist } from '../../apis/user'
import { apiGetOneService, apiGetServicePublic, apiRatingService } from '../../apis/service'
import {Breadcrumb, Button, SelectQuantity, ServiceExtra, ServiceInformation, CustomSliderService, ServiceCard} from '../../components'
import Slider from "react-slick";
import { formatPrice, formatPricee, renderStarfromNumber } from '../../ultils/helper';
import {productExtra} from '../../ultils/constant'
import DOMPurify from 'dompurify';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { apiRecordInteraction, apiUpdateUser } from 'apis';
import path from 'ultils/path';
import withBaseComponent from 'hocs/withBaseComponent';
import { FaLocationDot } from "react-icons/fa6";
import Mapbox from 'components/Map/Mapbox'
import { FaClock, FaHeart, FaMapMarkerAlt, FaPhone, FaStar } from 'react-icons/fa'
import { MdDirections, MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'
import avatarDefault from "../../assets/avatarDefault.png";
import { getCurrent } from 'store/user/asyncAction'
import { toast } from 'react-toastify'

const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1
};


const DetailService = ({isQuickView, data}) => {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const nameRef = useRef()

  const {isLogin} = useSelector(state => state.user)
  const {current} = useSelector(state => state.user)
  const params =useParams()
  const [serviceData, setServiceData] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [productCate, setProductCate] = useState(null)
  const [newReview, setNewReview] = useState({
    comment: "",
    rating: 0,
  });
  
  const [category, setCategory] = useState(null)
  const [variant, setVariant] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [sid, setSid] = useState(null)
  const [providerId, setProviderId] = useState("")
  const [update, setUpdate] = useState(false)
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [providerLocation, setProviderLocation] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false)

  const reRender = useCallback(() => {
    setUpdate(!update)
  },[update])
  
  useEffect(() => {
    if(sid){
      fetchServiceData()
      fetchServiceCate()
    }
    window.scrollTo(0,0)
    nameRef.current?.scrollIntoView({block: 'center'})
  }, [sid])

  // useEffect(() => {
  //   apiRecordInteraction({
  //       user_id: current._id,
  //       type: 2,
  //       provider_id: providerId
  //   })
  // }, [providerId])
  
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
  
  const fetchServiceData = async ()=>{
    const response = await apiGetOneService(sid)
    if(response?.success){
      setServiceData(response?.service)
      
      setCurrentImage(response?.service?.thumb)
      
      setProviderId(response?.service?.provider_id)
    }
  }

  const fetchServiceCate = async ()=>{
    const response = await apiGetServicePublic({category})
    if(response?.success){
      setProductCate(response?.services)
    }
  }

  useEffect(() => {
    if(sid){
      fetchServiceData()
    }
  }, [update])
  
  useEffect(() => {
    if(current?.wishlist?.some(el => el?._id === serviceData?._id)){
      setIsWishlisted(true)
    }
    else{
      setIsWishlisted(false)
    }
  }, [current, serviceData]);

  console.log(current)

  console.log(isWishlisted)
  
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
      const response = await apiUpdateWishlist({sid: serviceData?._id})
      if(response.success){
        dispatch(getCurrent())
        toast.success(response.mes)
      }
      else{
        toast.error(response.mes)
      }
    }
  }

  const editQuantity = useCallback((number)=>{
    if(!Number(number)||Number(number)<1) {
      return
    }
    else{
      setQuantity(Number(number))
    }
  },[quantity])
  const handleChange = useCallback((flag)=>{
    if(flag==='minus'){
      if(quantity>=2) setQuantity(prev => prev-1)
    }
    else{
      setQuantity(prev => prev+1)
    }
  },[quantity])

  const handleBookService = async() => { 
    if(!current){
      return Swal.fire({
        name: "You haven't logged in",
        text: 'Please login and try again',
        icon: 'warning',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Go to Login',
        cancelButtonText: 'Not now',                
      }).then((rs)=>{
        if(rs.isConfirmed){
          navigate({
            pathname: `/${path.LOGIN}`,
            search: createSearchParams({
              redirect: location.pathname}).toString(),
          })
        }
      })
    }
    else{
      navigate({
        pathname:  `/${path.BOOKING}`,
        search: createSearchParams({sid: sid}).toString()
    })
    }
   }

  const showRoute = (userLat, userLng) => {
    // Logic to display the route from user's location to the service provider's location
    const providerLat = serviceData?.provider_id?.latitude; // Assuming you have the provider's latitude
    const providerLng = serviceData?.provider_id?.longitude; // Assuming you have the provider's longitude
    setUserLocation({ latitude: userLat, longitude: userLng });
    setProviderLocation({ latitude: providerLat, longitude: providerLng });
    setShowMap(true);
    
  };
  const handleGetDirections = () => {
    if(!showMap){
      if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          // Call the function to show the route using latitude and longitude
          showRoute(latitude, longitude);
        }, () => {
          Swal.fire('Không thể lấy vị trí của bạn.');
        });
      } else {
        Swal.fire('Geolocation không khả dụng.');
      }
    }
    else{
      setShowMap(false)
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === serviceData?.image?.length ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? serviceData?.image?.length : prev - 1
    );
  };
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState("");

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
        await apiRatingService({star: newReview?.rating, comment: newReview?.comment, sid: serviceData?._id, updatedAt:Date.now() })
        setNewReview({ comment: "", rating: 0});
        fetchServiceData()
      }
    }
  };

  const handleNavigateBookService = () => {
    if(!current){
      return Swal.fire({
        name: "You haven't logged in",
        text: 'Please login and try again',
        icon: 'warning',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Go to Login',
        cancelButtonText: 'Not now',                
      }).then((rs)=>{
        if(rs.isConfirmed){
          navigate({
            pathname: `/${path.LOGIN}`,
            search: createSearchParams({
              redirect: location.pathname}).toString(),
          })
        }
      })
    }
    else{
      navigate({
        pathname:  `/${path.BOOKING}`,
        search: createSearchParams({sid: sid}).toString()
    })
    }
  }

  return (
   <div className='w-full'>
    <div className='h-[81px] flex items-center justify-center bg-gray-100'>
      <div ref={nameRef} className='w-main'>
        <h3 className='font-semibold uppercase '>{serviceData?.name}</h3>
        <Breadcrumb name={serviceData?.name} category={category} />
      </div>
    </div>
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-4">
      <div className="grid lg:grid-cols-2 gap-8 mt-4">
        {/* Image Carousel Section */}
        <div className="relative group">
          <img
            src={currentImageIndex === 0 ? serviceData?.thumb : serviceData?.image[currentImageIndex - 1]}
            alt={`Service preview ${currentImageIndex + 1}`}
            className="w-[600px] h-[500px] object-contain rounded-lg transition-transform duration-300 hover:scale-[1.02]"
          />
          <button
            onClick={prevImage}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <MdKeyboardArrowLeft size={24} />
          </button>
          <button
            onClick={nextImage}
            aria-label="Next image"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <MdKeyboardArrowRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {[...(Array.isArray(serviceData?.image) ? serviceData.image : []), serviceData?.thumb].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentImageIndex === index
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Service Details Section */}
        <div className="space-y-6">
          <div>
            <div className='flex justify-between items-start'>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {serviceData?.name}
              </h1>
              <button
                onClick={handleWishlist}
                className={`p-2 rounded-full ${isWishlisted ? "text-red-500" : "text-gray-400"} hover:bg-gray-100`}
              >
                <FaHeart size={24} />
              </button>        
            </div>

            <div className="my-4 flex items-center gap-2">
              <div className="flex items-center justify-center gap-1 my-2 text-xl">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < Math.round(serviceData?.totalRatings) ? "text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>

            <p className="text-2xl text-[#0a66c2] font-semibold">
            {`${formatPrice(formatPricee(serviceData?.price))} VNĐ`}
            </p>
          </div>

          {
            serviceData?.description?.length === 1 
              &&
            <div className='text-base leading-6 line-clamp-[10] mb-8' dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(serviceData?.description[0])}}></div>
          }
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <FaClock className="text-blue-600" />
              <span className='text-[#0a66c2]'>{`${serviceData?.duration} minutes`}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <FaPhone className="text-blue-600" />
              <span className='text-[#0a66c2]'>{serviceData?.contact || 8888}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <FaMapMarkerAlt className="text-blue-600" />
              <span className='text-[#0a66c2]'>{`${serviceData?.provider_id?.address}, ${serviceData?.provider_id?.province}`}</span>
            </div>
          </div>

          <button
            onClick={handleNavigateBookService}
            className="w-full bg-[#0a66c2] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transform transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Book this service"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Directions Section */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Directions</h2>
          <button
            onClick={handleGetDirections}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <MdDirections className="text-xl" />
            Get Directions
          </button>
        </div>
        <div className="flex items-start gap-3">
          <FaMapMarkerAlt className="text-blue-600 mt-1" />
          <p className="text-gray-600">{`${serviceData?.provider_id?.businessName} - ${serviceData?.provider_id?.address}, ${serviceData?.provider_id?.province}`}</p>
        </div>
        {
          showMap && 
          <div className='w-full h-[500px] m-auto mt-[8px]'>
            <Mapbox userCoords={userLocation} providerCoords={providerLocation} />
          </div>
        }
      </div>

      {/* Thumbnail Gallery */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentImageIndex(0)}
            className="relative group overflow-hidden rounded-lg"
          >
            <img
              src={serviceData?.thumb}
              alt="Main gallery image"
              className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          </button>
          {serviceData?.image.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index + 1)}
              className="relative group overflow-hidden rounded-lg"
            >
              <img
                src={img}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Customer Reviews</h2>

        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800">{serviceData?.totalRating?.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 my-2">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < Math.round(serviceData?.totalRatings) ? "text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">{serviceData?.rating?.length} reviews</div>
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
                        width: `${serviceData?.rating?.length === 0 ? 0 : (serviceData?.rating?.filter(el => el?.star === rating).length / serviceData?.rating?.length) * 100}%`
                      }}
                    />
                  </div>
                  <div className="w-16 text-sm text-gray-600">
                    {serviceData?.rating?.filter(el => el?.star === rating).length} reviews
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
          {serviceData?.rating?.map((review) => (
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

export default memo(DetailService)