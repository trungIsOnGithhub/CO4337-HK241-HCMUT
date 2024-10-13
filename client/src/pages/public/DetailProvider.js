import { apiGetAllFlashSaleEventsByProviderId, apiGetProductByProviderId, apiGetServiceByProviderId, apiGetServiceProviderById } from 'apis'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import defaultProvider from '../../assets/defaultProvider.jpg'
import clsx from 'clsx'
import { BookingFromProvider, FlashSaleItem, Pagination, Product, Service } from 'components'
import Masonry from 'react-masonry-css'
import { FaLocationDot } from 'react-icons/fa6'
import Mapbox from 'components/Map/Mapbox'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";


const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const DetailProvider = () => {
    const {prid} = useParams()
    const [providerData, setProviderData] = useState(null)
    const [showMap, setShowMap] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [providerLocation, setProviderLocation] = useState(null);

    const [variable, setVariable] = useState('service')

    const [service, setService] = useState(null)
    const [product, setProduct] = useState(null)
    
    const [totalService, setTotalService] = useState(0)
    const [totalProduct, setTotalProduct] = useState(0)

    const [params, setParams] = useSearchParams();
    const [findUs, setFindUs] = useState(false);
    
    const [flashSale, setFlashSale] = useState([])
    const [currentFlashSaleIndex, setCurrentFlashSaleIndex] = useState(0); // Thêm state để theo dõi chỉ số hiện tại

    useEffect(() => {
        const fetchProviderData = async() => {
          const response = await apiGetServiceProviderById(prid)
          if(response?.success){
            setProviderData(response?.payload)
          }
        }
        fetchProviderData()
      }, [prid])
    
    useEffect(() => {
        const fetchData = async() => {
          if(variable === 'service' || variable === 'book'){
            const response = await apiGetServiceByProviderId(prid)
            setService(response?.services)
            setTotalService(response?.counts)
            setFindUs(false)

            const allFlashSale = await apiGetAllFlashSaleEventsByProviderId(prid)
            if(allFlashSale?.success){
              setFlashSale(allFlashSale?.allFlashSale)
            }
          }
          if(variable === 'product'){
            const response = await apiGetProductByProviderId(prid)
            setProduct(response?.products)
            setTotalProduct(response?.counts)
            setFindUs(false)
          }
          if(variable === 'find-us'){
            Swal.fire({
              title: 'Chia sẻ vị trí',
              text: "Bạn có muốn chia sẻ vị trí hiện tại của mình để xem đường đi?",
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Chia sẻ',
              cancelButtonText: 'Không'
            }).then((result) => {
              if (result.isConfirmed) {
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(position => {
                    const { latitude, longitude } = position.coords;
                    // Call the function to show the route using latitude and longitude
                    showFindUs(latitude, longitude);
                  }, () => {
                    Swal.fire('Không thể lấy vị trí của bạn.');
                  });
                } else {
                  Swal.fire('Geolocation không khả dụng.');
                }
              }
            });
          }
        }
        fetchData()
    }, [variable, prid]);

    const fetchServiceByProviderId = async (queries) =>{
      const response = await apiGetServiceByProviderId(prid, queries)
      if(response.success) setService(response?.services)
    }
  
    useEffect(() => {
      window.scrollTo(0,0)
      const queries = Object.fromEntries([...params])
      fetchServiceByProviderId(queries)
    }, [params])

    useEffect(() => {
        // Clear all search params when variable changes
        const clearSearchParams = () => {
            const url = new URL(window.location);
            url.search = ''; // Xóa toàn bộ search params
            window.history.replaceState({}, '', url); // Cập nhật URL
        };
        setParams({});
        clearSearchParams();
    }, [variable]);

    const showRoute = (userLat, userLng) => {
      // Logic to display the route from user's location to the service provider's location
      const providerLat = providerData?.latitude; // Assuming you have the provider's latitude
      const providerLng = providerData?.longitude; // Assuming you have the provider's longitude
      setUserLocation({ latitude: userLat, longitude: userLng });
      setProviderLocation({ latitude: providerLat, longitude: providerLng });

      if(userLat && userLng && providerLat && providerLng){
        setShowMap(true);
      }
      else{
        const errorMessage = !userLat || !userLng ? 'Thiếu thông tin địa chỉ của bạn.' : 'Thiếu thông tin địa chỉ của nhà cung cấp.';
        toast.error(errorMessage);
      }
      
    };

    const showFindUs = (userLat, userLng) => {
      // Logic to display the route from user's location to the service provider's location
      const providerLat = providerData?.latitude; // Assuming you have the provider's latitude
      const providerLng = providerData?.longitude; // Assuming you have the provider's longitude
      setUserLocation({ latitude: userLat, longitude: userLng });
      setProviderLocation({ latitude: providerLat, longitude: providerLng });

      if(userLat && userLng && providerLat && providerLng){
        setFindUs(true);
      }
      else{
        const errorMessage = !userLat || !userLng ? 'Thiếu thông tin địa chỉ của bạn.' : 'Thiếu thông tin địa chỉ của nhà cung cấp.';
        toast.error(errorMessage);
      }
      
    };
  
    const handleGetDirections = () => {
      if(!showMap){
        Swal.fire({
          title: 'Chia sẻ vị trí',
          text: "Bạn có muốn chia sẻ vị trí hiện tại của mình để xem đường đi?",
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Chia sẻ',
          cancelButtonText: 'Không'
        }).then((result) => {
          if (result.isConfirmed) {
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
        });
      }
      else{
        setShowMap(false)
      }
    };


  return (
    <div>
      <div className='w-main h-[120px] flex justify-between items-center'>
        <div className='px-2 w-fit flex gap-2 items-center'>
            <img src={providerData?.images[0] || defaultProvider} className='w-[80px] h-[80px] p-1 rounded-full border border-gray-500 shadow-md'/>
            <span className='text-gray-800 font-bold text-xl'>{providerData?.bussinessName}</span>
        </div>
        <div>
            rating
        </div>
      </div>
      <div className='w-main h-[40px] flex items-center gap-12 border-b-2'>
        <span onClick={()=>{setVariable('service')}} className={clsx('text-gray-800 font-semibold text-xl cursor-pointer capitalize', variable === 'service' && 'text-main')}>Service</span>
        <span onClick={()=>{setVariable('book')}} className={clsx('text-gray-800 font-semibold text-xl cursor-pointer capitalize', variable === 'book' && 'text-main')}>Book Now</span>
        <span onClick={()=>{setVariable('product')}} className={clsx('text-gray-800 font-semibold text-xl cursor-pointer capitalize', variable === 'product' && 'text-main')}>Product</span>
        <span onClick={()=>{setVariable('blog')}} className={clsx('text-gray-800 font-semibold text-xl cursor-pointer capitalize', variable === 'blog' && 'text-main')}>Blog</span>
        <span onClick={()=>{setVariable('find-us')}} className={clsx('text-gray-800 font-semibold text-xl cursor-pointer capitalize', variable === 'find-us' && 'text-main')}>Find us</span>
        <span onClick={()=>{setVariable('faq')}} className={clsx('text-gray-800 font-semibold text-xl cursor-pointer capitalize', variable === 'faq' && 'text-main')}>FAQ</span>
      </div>

      {
        variable === 'service' &&
        <>
        <div className='w-main mt-8 mx-auto justify-between flex'>
          <div>sort/filter</div>
          <div>search</div>
        </div>
        {flashSale?.length > 0 && 
        <div className='w-main mx-auto mt-8 flex justify-between items-center'>
          <button 
            onClick={() => setCurrentFlashSaleIndex(Math.max(currentFlashSaleIndex - 1, 0))} 
            disabled={currentFlashSaleIndex === 0} // Vô hiệu hóa nút nếu đã ở đầu
          >
            <span className='cursor-pointer text-gray-300 text-[28px] font-medium hover:text-gray-500'><FaCircleChevronLeft /></span>
          </button>
          
          <div className='flex flex-1 gap-3 overflow-hidden px-2'>
            {
              flashSale?.slice(currentFlashSaleIndex, currentFlashSaleIndex + 3).map((el) => ( // Hiển thị 3 flash sale tại một thời điểm
                <div className='w-[33%]' key={el._id}>
                  <FlashSaleItem flashsaleData={el}/> 
                </div>
              ))
            }
          </div>
          
          <button 
            onClick={() => setCurrentFlashSaleIndex(Math.min(currentFlashSaleIndex + 1, flashSale.length - 3))} 
            disabled={currentFlashSaleIndex >= flashSale.length - 3} // Vô hiệu hóa nút nếu đã ở cuối
          >
            <span className='cursor-pointer text-gray-300 text-[28px] font-medium hover:text-gray-500'><FaCircleChevronRight /></span>
          </button>
        </div>
        }
        <div className='w-main mt-8 mx-auto'>
          <span className='text-gray-400 font-semibold text-lg capitalize'>
            {+totalService > 0 ? +totalService === 1 ? `${totalService} result` : `${totalService} results` : 'No result'}
          </span> 
        </div>
        <div className={clsx('mt-8 w-main mx-auto')}>
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid flex mx-[-10px]"
            columnClassName="my-masonry-grid_column">
            {service?.map(el => (
              <Service
                key={el._id} 
                serviceData={el}
                normal={true}
              />
            ))}
          </Masonry>
        </div>
        <div className='w-main mx-auto my-4 flex justify-end'>
          {service&&
          <Pagination
          totalCount={totalService}/>}
        </div>
        <div className='w-full h-[200px]'>
        </div>
        </>
      }

      {
        variable === 'product' &&
        <>
        <div className='w-main mt-8 mx-auto justify-between flex'>
          <div>sort/filter</div>
          <div>search</div>
        </div>
        <div className='w-main mt-8 mx-auto'>
          <span className='text-gray-400 font-semibold text-lg capitalize'>
            {+totalProduct > 0 ? +totalProduct === 1 ? `${totalProduct} result` : `${totalProduct} results` : 'No result'}
          </span> 
        </div>
        <div className={clsx('mt-8 w-main mx-auto')}>
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid flex mx-[-10px]"
            columnClassName="my-masonry-grid_column">
            {product?.map(el => (
              <Product
                key={el._id} 
                productData={el}
                normal={true}
              />
            ))}
          </Masonry>
        </div>
        <div className='w-main mx-auto my-4 flex justify-end'>
          {service&&
          <Pagination
          totalCount={totalService}/>}
        </div>
        <div className='w-full h-[200px]'>
        </div>
        </>
      }

      {
        variable === 'book' &&
        <>
        {flashSale?.length > 0 && 
        <div className='w-main mx-auto mt-8 flex justify-between items-center'>
          <button 
            onClick={() => setCurrentFlashSaleIndex(Math.max(currentFlashSaleIndex - 1, 0))} 
            disabled={currentFlashSaleIndex === 0} // Vô hiệu hóa nút nếu đã ở đầu
          >
            <span className='cursor-pointer text-gray-300 text-[28px] font-medium hover:text-gray-500'><FaCircleChevronLeft /></span>
          </button>
          
          <div className='flex flex-1 gap-3 overflow-hidden px-2'>
            {
              flashSale?.slice(currentFlashSaleIndex, currentFlashSaleIndex + 3).map((el) => ( // Hiển thị 3 flash sale tại một thời điểm
                <div className='w-[33%]' key={el._id}>
                  <FlashSaleItem flashsaleData={el}/> 
                </div>
              ))
            }
          </div>
          
          <button 
            onClick={() => setCurrentFlashSaleIndex(Math.min(currentFlashSaleIndex + 1, flashSale.length - 3))} 
            disabled={currentFlashSaleIndex >= flashSale.length - 3} // Vô hiệu hóa nút nếu đã ở cuối
          >
            <span className='cursor-pointer text-gray-300 text-[28px] font-medium hover:text-gray-500'><FaCircleChevronRight /></span>
          </button>
        </div>
        }
        <div className='w-main mx-auto mt-8 flex justify-between'>
          <div className='w-[55%] flex flex-col gap-8'>
          {service?.map((el, index) => 
            <BookingFromProvider serviceData={el}/>
          )}
          </div>

          <div className='w-[35%] flex flex-col gap-4'>
            <div className='border border-gray-800 h-fit pb-5 rounded-md'>
              <div className='mb-4 border-b-2 border-gray-400 px-3 pb-4 flex justify-center'>
                <span className='font-semibold text-3xl'>Booking Details</span>
              </div>
              <div className='px-3 flex flex-col gap-2'>
                <div className='flex gap-2'>
                  <span className='text-gray-700 font-bold'>Service Name:</span>
                  <span className='font-semibold text-gray-600'></span>
                </div>
                <div className='flex gap-2'>
                  <span className='text-gray-700 font-bold'>Duration:</span>
                  <span className='font-semibold text-gray-600'></span>
                </div>
                <div className='flex gap-2'>
                  <span className='text-gray-700 font-bold'>Provider Name:</span>
                  <span className='font-semibold text-gray-600'>{providerData?.bussinessName}</span>
                </div>
                <div className='flex gap-2'>
                  <span className='text-gray-700 font-bold'>Address:</span>
                  <span className='font-semibold text-gray-600'>{providerData?.address}</span>
                </div>
                <div className='flex gap-2'>
                  <span className='text-gray-700 font-bold'>Staff:</span>
                  <span className='font-semibold text-yellow-600'></span>
                </div>
                <div className='flex gap-2'>
                  <span className='text-gray-700 font-bold'>Date & Time:</span>
                  <span className='font-semibold text-green-600'></span>
                </div>
                <div className='flex gap-2'>
                  <span className='text-gray-700 font-bold'>Total Price:</span>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2 bg-green-800 text-white px-2 py-1 rounded-md w-fit cursor-pointer' onClick={handleGetDirections}>
              <span className='text-xl font-semibold'><FaLocationDot /></span>
              <span className='font-semibold text-xl'>Chỉ đường</span>
            </div>

            {
              showMap && 
              <div className='w-full h-[400px] m-auto mt-[8px]'>
                <Mapbox userCoords={userLocation} providerCoords={providerLocation} small={true}/>
              </div>
            }
            
          </div>
        </div>
        <div className='w-main mx-auto my-4 flex justify-end'>
          {service&&
          <Pagination
          totalCount={totalService}/>}
        </div>
        <div className='w-full h-[200px]'>
        </div>
        </>
      }
      {
        variable === 'find-us' &&
        <>
          {
            findUs && 
            <div className='w-main h-[400px] m-auto mt-8'>
              <Mapbox userCoords={userLocation} providerCoords={providerLocation} small={true}/>
            </div>
          }
          <div className='w-full h-[200px]'>
          </div>
        </>
      }
    </div>
  )
}

export default DetailProvider