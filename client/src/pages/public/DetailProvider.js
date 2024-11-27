import React, { useEffect, useRef, useState } from 'react'
import { createSearchParams, Link, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';
import { FaChevronDown, FaChevronUp, FaRegClock, FaWindowClose } from 'react-icons/fa';
import { FaLocationDot, FaUserGear } from 'react-icons/fa6';
import { BookingFromProvider, Button, InputFormm, Pagination, ProductItem, ServiceItem } from 'components';
import clsx from 'clsx';
import { MdOutlineSort, MdSearchOff } from 'react-icons/md';
import { FiClock, FiEye, FiTag, FiUser } from 'react-icons/fi';
import { SlCalender } from 'react-icons/sl';
import { CiSearch } from 'react-icons/ci';
import { BsFillTagsFill } from 'react-icons/bs';
import { apiGetBlogByProviderId } from 'apis/blog';
import { apiGetAdminData, apiGetProductByProviderId, apiGetServiceByProviderId, apiGetServiceProviderById } from 'apis';
import Mapbox from 'components/Map/Mapbox';
import path from 'ultils/path';
import { formatDistanceToNow } from 'date-fns';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import facebookk from '../../assets/facebook.png'
import instagramm from '../../assets/instagram.png'
import likedIn from '../../assets/likedin.png'
import youTube from '../../assets/youtube.png'
import twitter from '../../assets/twitter.jpg'
import tiktok from '../../assets/tiktok.jpg'
// import { TbMessageCircleFilled } from 'react-icons/tb';
import {showMessageBox} from '../../store/app/appSlice'
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import logoWeb from '../../assets/logoWeb.png'
// import { IoChatbubbleEllipsesSharp } from 'react-icons/io5';
import useDebounce from 'hook/useDebounce'
import { useForm } from 'react-hook-form';

const DetailProvider = () => {
    const {register,formState:{errors}, handleSubmit, watch, reset} = useForm()
    const location = useLocation()
    const navigate = useNavigate()
    const [variable, setVariable] = useState('service')
    const [providerData, setProviderData] = useState(null)
    const {prid} = useParams()
    const [service, setService] = useState(null)
    const [product, setProduct] = useState(null)
    const [blogs, setBlogs] = useState(null)
    const [showSort, setShowSort] = useState(false)
    const [showMap, setShowMap] = useState(false);
    const [showWorkingHours, setShowWorkingHours] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [providerLocation, setProviderLocation] = useState(null);
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [indexFooter, setIndexFooter] = useState([])
    const [adminData, setAdminData] = useState(null)
    const {current} = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [params] = useSearchParams()
    const [countServices, setCountServices] = useState(0)
    const [countProducts, setCountProducts] = useState(0)
    const [countBlogs, setCountBlogs] = useState(0)

    const GOONG_API_KEY = 'HjmMHCMNz4xyFqc54FsgxrobHmt48vwp7U8xzQUC';
    const GOONG_MAPTILES_KEY = 'hzX8cXab72XCozZSYvZqkV26qMMQ8JdpkiUwK1Iy';
    useEffect(() => {
        if(mapContainer.current && variable === 'find-us'){
          goongjs.accessToken = GOONG_MAPTILES_KEY;
  
          map.current = new goongjs.Map({
              container: mapContainer.current,
              style: 'https://tiles.goong.io/assets/goong_map_web.json',
              center: [105.83991, 21.02800],
              zoom: 9,
          });
        }
      }, [mapContainer.current, variable]);

  
      useEffect(() => {
        if (map.current && providerData && variable === 'find-us') {
          map.current.setCenter([providerData?.longitude || 105.83991, providerData?.latitude || 21.02800]);
          map.current.setZoom(15);
          
          // Remove existing markers
          const markers = document.getElementsByClassName('mapboxgl-marker');
          while (markers[0]) {
              markers[0].parentNode.removeChild(markers[0]);
          }
  
          // Add new marker
          const el = document.createElement('div');
          el.className = 'marker';
          el.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C7.02944 0 3 4.02944 3 9C3 13.9706 12 24 12 24C12 24 21 13.9706 21 9C21 4.02944 16.9706 0 12 0ZM12 12C10.3431 12 9 10.6569 9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12Z" fill="#3887be"/>
            </svg>
          `;
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.cursor = 'pointer';
  
          const marker = new goongjs.Marker(el)
              .setLngLat([providerData?.longitude || 105.83991, providerData?.latitude || 21.02800])
              .addTo(map.current)
      }
      }, [providerData, mapContainer.current, variable]);

    useEffect(() => {
        const fetchProviderData = async() => {
          const response = await apiGetServiceProviderById(prid)
          if(response?.success){
            setProviderData(response?.payload)
          }
        }
        fetchProviderData()
    }, [prid])

    const queryDebounce = useDebounce(watch('q'),800)

    useEffect(() => {
      if(queryDebounce) {
        navigate({
          pathname: location.pathname,
          search: createSearchParams({q:queryDebounce}).toString()
        })
      }
      else{
        navigate({
          pathname: location.pathname,
        })
      }
    }, [queryDebounce])

    useEffect(() => {
      const fetchAdminData = async () => {
        const response = await apiGetAdminData({prid: providerData?._id})
        setAdminData(response?.admin)
      }
      fetchAdminData()
    }, [providerData]);

    useEffect(() => {
      setIndexFooter(providerData?.indexFooter)
    }, [providerData]);

    useEffect(() => {
      const searchParams = Object.fromEntries([...params]) 
      const fetchData = async() => {
        const response = await apiGetServiceByProviderId(prid,  {...searchParams, limit: process.env.REACT_APP_LIMIT})
        setService(response?.services)
        setCountServices(response?.counts)
      }
      fetchData()
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }, [prid, params]);

    useEffect(() => {
      console.log('aaa')
        const searchParams = Object.fromEntries([...params]) 
        const fetchData = async() => {
          const response = await apiGetProductByProviderId(prid, {...searchParams, limit: process.env.REACT_APP_LIMIT})
          setProduct(response?.products)
          setCountProducts(response?.counts)
        }
        fetchData()
    }, [prid,params]);

    useEffect(() => {
      const searchParams = Object.fromEntries([...params]) 
      const fetchData = async() => {
        const response = await apiGetBlogByProviderId(prid, {...searchParams, limit: process.env.REACT_APP_LIMIT})
        setBlogs(response?.blogs)
        setCountBlogs(response?.counts)
      }
      fetchData()
    }, [prid, params]);

    useEffect(() => {
        // Cuộn lên đầu trang khi component được render
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, []);
    
    const handleChooseBlogPost = (id) => { 
      navigate({
        pathname:  `/${path.VIEW_POST}`,
        search: createSearchParams({id}).toString()
      })
    }
  
    const handleShowDistance = () => {
      if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          // Call the function to show the route using latitude and longitude
          showRoute(latitude, longitude);
        }, () => {
          Swal.fire('Cannot get your position.');
        });
      } else {
        Swal.fire('Geolocation is not available.');
      }
    }

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

    const handleShowChat = () => {
      const to = {
        id: adminData[0]?._id, firstName: adminData[0]?.firstName, lastName: adminData[0]?.lastName, avatar: adminData[0]?.avatar
      }
      dispatch(showMessageBox({from:current?._id, to: to}))
    }
  
    const handleBackOurProvider = () => {
      navigate(`/${path.OUR_PROVIDERS}`)
    }

    const renderFooter = () => {
      if (!indexFooter) return null;
    
      // Sắp xếp theo order (thứ tự thấp hơn sẽ ở trên cùng)
      const sortedFooter = [...indexFooter].sort((a, b) => a.order - b.order);
    
      // Tạo cấu trúc footer
      const leftColumn = sortedFooter.filter(item => item.column === 'left');
      const rightColumn = sortedFooter.filter(item => item.column === 'right');
    
      return (
        <div className="footer flex justify-center pt-[32px] pb-[28px] px-[18px] w-full h-full">
          <div className='w-[1200px] flex gap-4 justify-between'>
            <div className="flex flex-col gap-6">
              {leftColumn.map((item,index) => {
                if(item?.isVisible && item?.field === 'logo'){
                  if(providerData?.logoSize === 'small'){
                    return <img className='w-[52px] max-h-[32px] object-cover' key={index} src={providerData?.images[0]} alt="Logo" />;
                  }
                  else{
                    return <img className='w-[102px] max-h-[64px] object-cover' key={index} src={providerData?.images[0]} alt="Logo" />;
                  }
                }
                else if(item?.isVisible && item?.field === 'slogan' && providerData?.slogan !== ""){
                  return <span key={index} className='text-white text-sm italic font-light'>{`"${providerData?.slogan}"`}</span>
                }
                else if(item?.isVisible && item?.field === 'businessName'){
                  return <span key={index} className='text-white text-sm'>{providerData?.bussinessName}</span>
                }
                else if(item?.isVisible && item?.field === 'address' && providerData?.address !== ""){
                  return <span key={index} className='text-white text-sm'>{`Address: ${providerData?.address}`}</span>
                }
                else if(item?.isVisible && item?.field === 'mobile'){
                  return <span key={index} className='text-white text-sm'>{providerData?.mobile}</span>
                }
                else if(item?.isVisible && item?.field === 'social'){
                  return (
                    <div className='flex items-center gap-[8px]'>
                      {providerData?.socialMedia?.facebook !== "" && (
                        <a href={providerData?.socialMedia?.facebook} target="_blank" rel="noopener noreferrer">
                          <img src={facebookk} className='w-[32px] h-[32px] object-cover'/>
                        </a>
                      )}
                      {providerData?.socialMedia?.instagram !== "" && (
                        <a href={providerData?.socialMedia?.instagram} target="_blank" rel="noopener noreferrer">
                          <img src={instagramm} className='w-[28px] h-[28px] object-cover'/>
                        </a>
                      )}
                      {providerData?.socialMedia?.linkedin !== "" && (
                        <a href={providerData?.socialMedia?.linkedin} target="_blank" rel="noopener noreferrer">
                          <img src={likedIn} className='w-[24px] h-[24px] object-cover'/>
                        </a>
                      )}
                      {providerData?.socialMedia?.youtube !== "" && (
                        <a href={providerData?.socialMedia?.youtube} target="_blank" rel="noopener noreferrer">
                          <img src={youTube} className='w-[24px] h-[24px] object-cover'/>
                        </a>
                      )}
                      {providerData?.socialMedia?.twitter !== "" && (
                        <a href={providerData?.socialMedia?.twitter} target="_blank" rel="noopener noreferrer">
                          <img src={twitter} className='w-[24px] h-[24px] object-cover'/>
                        </a>
                      )}
                      {providerData?.socialMedia?.tiktok !== "" && (
                        <a href={providerData?.socialMedia?.tiktok} target="_blank" rel="noopener noreferrer">
                          <img src={tiktok} className='w-[24px] h-[24px] object-cover'/>
                        </a>
                      )}
                    </div>
                  );
                }
              })}
            </div>
            <div className="flex flex-col gap-6 items-end">
              {rightColumn.map((item, index) => {
                if(item?.isVisible && item?.field === 'logo'){
                  if(providerData?.logoSize === 'small'){
                    return <img className='w-[52px] max-h-[32px] object-cover' key={index} src={providerData?.images[0]} alt="Logo" />;
                  }
                  else{
                    return <img className='w-[102px] max-h-[64px] object-cover' key={index} src={providerData?.images[0]} alt="Logo" />;
                  }
                }
                else if(item?.isVisible && item?.field === 'slogan' && providerData?.slogan !== ""){
                  return <span key={index} className='text-white text-sm italic font-light'>{`"${providerData?.slogan}"`}</span>
                }
                else if(item?.isVisible && item?.field === 'businessName'){
                  return <span key={index} className='text-white text-sm'>{providerData?.bussinessName}</span>
                }
                else if(item?.isVisible && item?.field === 'address' && providerData?.address !== ""){
                  return <span key={index} className='text-white text-sm'>{`Address: ${providerData?.address}`}</span>
                }
                else if(item?.isVisible && item?.field === 'mobile'){
                  return <span key={index} className='text-white text-sm'>{providerData?.mobile}</span>
                }
                else if(item?.isVisible && item?.field === 'social'){
                  return (
                    <div className='flex items-center gap-[8px]'>
                      {providerData?.socialMedia?.facebook !== "" && (
                        <a href={providerData?.socialMedia?.facebook} target="_blank" rel="noopener noreferrer">
                          <img src={facebookk} className='w-[32px] h-[32px] object-cover'/>
                        </a>
                      )}
                      {providerData?.socialMedia?.instagram !== "" && (
                        <a href={providerData?.socialMedia?.instagram} target="_blank" rel="noopener noreferrer">
                          <img src={instagramm} className='w-[28px] h-[28px] object-cover'/>
                        </a>
                      )}
                      {providerData?.socialMedia?.linkedin !== "" && (
                        <a href={providerData?.socialMedia?.linkedin} target="_blank" rel="noopener noreferrer">
                          <img src={likedIn} className='w-[24px] h-[24px] object-cover'/>
                        </a>
                      )}
                      {providerData?.socialMedia?.youtube !== "" && (
                        <a href={providerData?.socialMedia?.youtube} target="_blank" rel="noopener noreferrer">
                          <img src={youTube} className='w-[24px] h-[24px] object-cover'/>
                        </a>
                      )}
                      {providerData?.socialMedia?.twitter !== "" && (
                        <a href={providerData?.socialMedia?.twitter} target="_blank" rel="noopener noreferrer">
                          <img src={twitter} className='w-[24px] h-[24px] object-cover'/>
                        </a>
                      )}
                      {providerData?.socialMedia?.tiktok !== "" && (
                        <a href={providerData?.socialMedia?.tiktok} target="_blank" rel="noopener noreferrer">
                          <img src={tiktok} className='w-[24px] h-[24px] object-cover'/>
                        </a>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      );
    };

  const handleSetSort = (sort) => {
    if(sort !== ""){
      navigate({
        pathname: location.pathname,
        search: createSearchParams({
          sort
        }).toString()
      })
    }
  }

  useEffect(() => {
    reset({
      q: ''
    })

    navigate({
      pathname: location.pathname,
      search: '' // Clear tất cả search parameters
    });

    setShowSort(false)
  }, [variable]);


  return (
    <div className='w-full'>
        <div className={clsx('w-full fixed top-0 left-0 h-[86px] flex justify-center z-[100]', providerData?.theme === 'dark' && 'bg-[#212529] text-white')}>
          <div className='w-[90%] h-full flex gap-10 items-center text-[15px]'>
            <div onClick={handleBackOurProvider} className='flex items-center py-2 gap-1 justify-center cursor-pointer'>
                <img src={logoWeb} className='w-12 h-12'/>
                <span className='font-semibold text-4xl mb-1'>Biz<span className='text-blue-500'>Serv</span></span>
            </div>
            <span onClick={()=>{setVariable('service')}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'service' && 'border-b-2 border-[#15a9e8]')}>Service</span>
            <span onClick={()=>{setVariable('book')}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'book' && 'border-b-2 border-[#15a9e8]')}>Book Now</span>
            <span onClick={()=>{setVariable('product')}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'product' && 'border-b-2 border-[#15a9e8]')}>Product</span>
            <span onClick={()=>{setVariable('blog')}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'blog' && 'border-b-2 border-[#15a9e8]')}>Blog</span>
            <span onClick={()=>{setVariable('find-us')}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'find-us' && 'border-b-2 border-[#15a9e8]')}>Find us</span>
          </div>
        </div>
        <div className='w-full h-[86px]'></div>
        {
            variable === 'service' &&
            <div className={clsx('w-full min-h-[476px] flex justify-center', providerData?.theme === 'dark' &&  'bg-[#343a40] text-white')}>
            <div className='w-[90%] pt-[24px] pb-[48px] flex flex-col'>
              <div className='w-full flex justify-between'>
                <span className='text-[22px] font-semibold'>Services</span>
                <div className='relative'>
                  <Button handleOnclick={()=>{setShowSort(prev => !prev)}} style={'px-[23px] rounded-l-full rounded-r-full text-white border border-[##e6ebef] w-fit h-[40px] flex items-center gap-2'}><MdOutlineSort />Sort by</Button>
                  {
                    showSort && 
                    <div className='absolute w-[160px] h-[152px] px-[8px] py-[6px] bg-[#212529] rounded-md right-0 mt-2 z-50 flex flex-col'>
                      <span onClick={()=>handleSetSort("price")} className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Price (lowest)</span>
                      <span onClick={()=>handleSetSort("-price")} className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Price (highest)</span>
                      <span onClick={()=>handleSetSort("-bookingQuantity")} className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Popularity</span>
                      <span onClick={()=>handleSetSort("name")} className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Name (ascending)</span>
                      <span onClick={()=>handleSetSort("-name")} className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Name (descending)</span>
                    </div>
                  }
                </div>
              </div>
              <div className='w-full h-full flex gap-6'>
                <div className='w-[18%] h-full  mt-[32px] border-r border-white'>
                  <div className='w-[187px] h-[40px] flex gap-1 items-center border rounded-l-full rounded-r-full pl-[8px] pr-[16px] py-[8px] bg-[#212529]'>
                    <span className='text-xl'><CiSearch size={20}/></span>
                    <form className='flex-1' >
                      <InputFormm
                        id='q'
                        register={register}
                        errors={errors}
                        fullWidth
                        placeholder= 'Search service'
                        style={'w-full  h-10 rounded-md pl-2 flex items-center'}
                        styleInput={'w-[100%] bg-[#212529] outline-none text-white'}
                      >
                      </InputFormm>
                    </form>
                  </div>
                </div>
                <div className='w-[80%] h-full mt-[32px]'>
                  {
                    service?.length > 0 ? 
                    <div className='flex flex-col gap-8'>
                      <div className='flex flex-wrap gap-4 min-h-[300px]'>
                        {
                          service?.map((el,index) => (
                            <div key={index} className='w-[31%]'>
                              <ServiceItem serviceData={el} providerData={providerData}/>
                            </div>
                          ))
                        }
                      </div>
                      <div className='text-white flex-1 flex items-end'>
                        <Pagination totalCount={countServices} />
                      </div>
                    </div>
                  :
                  <div className='w-full h-full flex flex-col gap-1 items-center justify-center'>
                      <MdSearchOff size={128}/>
                      <span>No services available</span>
                    </div>
                  }
                </div>
              </div>
            </div>
        </div>
        }

        {
            variable === 'product' &&
            <div className={clsx('w-full min-h-[476px] flex justify-center', providerData?.theme === 'dark' &&  'bg-[#343a40] text-white')}>
            <div className='w-[90%] pt-[24px] pb-[48px] flex flex-col'>
              <div className='w-full flex justify-between'>
                <span className='text-[22px] font-semibold'>Products</span>
                <div className='relative'>
                  <Button handleOnclick={()=>{setShowSort(prev => !prev)}} style={'px-[23px] rounded-l-full rounded-r-full text-white border border-[##e6ebef] w-fit h-[40px] flex items-center gap-2'}><MdOutlineSort />Sort by</Button>
                  {
                    showSort && 
                    <div className='absolute w-[160px] h-[152px] px-[8px] py-[6px] bg-[#212529] rounded-md right-0 mt-2 z-50 flex flex-col'>
                      <span onClick={()=>handleSetSort("price")} className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Price (lowest)</span>
                      <span onClick={()=>handleSetSort("-price")} className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Price (highest)</span>
                      <span onClick={()=>handleSetSort("-soldQuantity")} className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Best Seller</span>
                      <span onClick={()=>handleSetSort("title")} className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Name (ascending)</span>
                      <span onClick={()=>handleSetSort("-title")} className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Name (descending)</span>
                    </div>
                  }
                </div>
              </div>
              <div className='w-full h-full flex gap-6'>
                <div className='w-[18%] h-full  mt-[32px] border-r border-white'>
                <div className='w-[187px] h-[40px] flex gap-1 items-center border rounded-l-full rounded-r-full pl-[8px] pr-[16px] py-[8px] bg-[#212529]'>
                  <span className='text-xl'><CiSearch size={20}/></span>
                  <form className='flex-1' >
                    <InputFormm
                      id='q'
                      register={register}
                      errors={errors}
                      fullWidth
                      placeholder= 'Search product'
                      style={'w-full  h-10 rounded-md pl-2 flex items-center'}
                      styleInput={'w-[100%] bg-[#212529] outline-none text-white'}
                    >
                    </InputFormm>
                  </form>
                </div>
                </div>
                <div className='w-[80%] h-full mt-[32px]'>
                  {
                    product?.length > 0 ?
                      <div className='flex flex-col gap-8'>
                        <div className='flex flex-wrap gap-4 min-h-[300px]'>    
                          {product?.map((el,index) => (
                            <div key={index} className='w-[31%]'>
                              <ProductItem productData={el}/>
                            </div>
                          ))} 
                        </div>
                        <div className='text-white flex-1 flex items-end'>
                          <Pagination totalCount={countProducts} />
                        </div>
                      </div>
                    :
                    <div className='w-full h-full flex flex-col gap-1 items-center justify-center'>
                      <MdSearchOff size={128}/>
                      <span>No products available</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        {
            variable === 'book' && 
            <div className={clsx('w-full min-h-[476px] flex justify-center', providerData?.theme === 'dark' &&  'bg-[#343a40] text-white')}>
          <div className='w-[90%] flex gap-8'>
            <div className='w-[66%] h-fit bg-[#212529] mt-[32px] rounded-md p-[24px] flex flex-col gap-4 mb-16'>
                <div className='w-full h-[40px] flex justify-between items-center'>
                  <span className='text-[18px] font-semibold'>Choose Service</span>
                  <div className='w-[187px] h-[40px] flex gap-1 items-center border rounded-l-full rounded-r-full pl-[8px] pr-[16px] py-[8px] bg-[#212529]'>
                      <span className='text-xl'><CiSearch size={20}/></span>
                      <form className='flex-1' >
                        <InputFormm
                          id='q'
                          register={register}
                          errors={errors}
                          fullWidth
                          placeholder= 'Search service'
                          style={'w-full  h-10 rounded-md pl-2 flex items-center'}
                          styleInput={'w-[100%] bg-[#212529] outline-none text-white'}
                        >
                        </InputFormm>
                      </form>
                  </div>
                </div>
                {
                service?.length > 0 ?       
                  <div className='w-full flex flex-col gap-8'>
                    <div className='w-full flex flex-col gap-4 min-h-[300px]'>
                      {service?.map((el, index) => 
                        <BookingFromProvider providerData={providerData} serviceData={el}/>
                      )}
                    </div> 

                    <div className='text-white flex-1 flex items-end'>
                      <Pagination totalCount={countServices} />
                    </div>
                  </div> 
                  :
                  <div className='w-full h-[272px] flex flex-col gap-1 items-center justify-center'>
                        <MdSearchOff size={128}/>
                        <span>No services available</span>
                  </div>
                }
            </div>
            <div className='w-[30%] flex flex-col gap-4'>
                <div className='h-fit pt-[20px] pb-[16px] bg-[#212529] mt-[32px] rounded-md'>
                  <div className='border-b border-[#868e96] w-full h-[49px] pl-[20px] pr-[12px] py-[12px] text-[18px] font-semibold leading-6'>Booking Details</div>
                  <div className='px-[8px] pt-[8px]'>
                    <div className='w-full p-[8px] border-b border-[#868e96]'>
                      <div className='w-full py-[4px] flex gap-2 items-center'>
                        <FaLocationDot color='#1696ca'/>
                        <span className='text-[12px] text-[#868e96] font-medium'>Location</span>
                      </div>
                      <div className='w-full pl-[26px] flex flex-col gap-1'>
                        <span className='text-[13px] font-medium'>{providerData?.bussinessName}</span>
                        <span className='text-[#868e96] text-[12px] leading-4 line-clamp-2'>{providerData?.address}</span>
                      </div>
                    </div>
                    <div className='w-full p-[8px] border-b border-[#868e96]'>
                      <div className='w-full py-[4px] flex gap-2 items-center text-[#868e96] text-[12px] font-medium'>
                        <span><BsFillTagsFill/></span>
                        <span>Service</span>
                      </div>
                      <div className='w-full pl-[26px] flex flex-col gap-1'>
                        <span className='text-[13px] font-medium'>{""}</span>
                      </div>
                    </div>
                    <div className='w-full p-[8px] border-b border-[#868e96]'>
                      <div className='w-full py-[4px] flex gap-2 items-center text-[#868e96] text-[12px] font-medium'>
                        <span><FaUserGear /></span>
                        <span>Employee</span>
                      </div>
                      <div className='w-full pl-[26px] flex flex-col gap-1'>
                        <span className='text-[13px] font-medium'>{""}</span>
                      </div>
                    </div>
                    <div className='w-full p-[8px]'>
                      <div className='w-full py-[4px] flex gap-2 items-center text-[#868e96] text-[12px] font-medium'>
                        <span><SlCalender /></span>
                        <span>Date & Time</span>
                      </div>
                      <div className='w-full pl-[26px] flex flex-col gap-1'>
                        <span className='text-[13px] font-medium'>{""}</span>
                      </div>
                        
                    </div>
                  </div>
                </div>
              </div>
          </div>
            </div>
        }

        {
            variable === 'blog' &&
            <div className={clsx('w-full min-h-[476px] flex justify-center', providerData?.theme === 'dark' &&  'bg-[#343a40] text-white')}>
          <div className='w-[90%] pt-[24px] pb-[48px] flex flex-col'>
            <div className='w-full flex justify-start'>
              <span className='text-[22px] font-semibold'>Blogs</span>
            </div>
            <div className='w-full h-full flex gap-6'>
              <div className='w-[18%] h-full  mt-[32px] border-r border-white'>
                <div className='w-[187px] h-[40px] flex gap-1 items-center border rounded-l-full rounded-r-full pl-[8px] pr-[16px] py-[8px] bg-[#212529]'>
                  <span className='text-xl'><CiSearch size={20}/></span>
                  <form className='flex-1' >
                    <InputFormm
                      id='q'
                      register={register}
                      errors={errors}
                      fullWidth
                      placeholder= 'Search blog'
                      style={'w-full  h-10 rounded-md pl-2 flex items-center'}
                      styleInput={'w-[100%] bg-[#212529] outline-none text-white'}
                    >
                    </InputFormm>
                  </form>
                </div>
              </div>
              <div className='w-[80%] h-full mt-[32px]'>
                {
                  blogs?.length > 0 ?
                  <div className='w-full flex flex-col gap-8'>
                    <div className='flex flex-col gap-4 min-h-[300px]'>    
                      {
                        blogs?.map(blog => (
                          <div
                              onClick={() => handleChooseBlogPost(blog?._id)}
                              key={blog.id}
                              className="w-full cursor-pointer bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-[1.02]"
                            >
                            <div className="md:flex">
                              <div className="md:flex-shrink-0">
                                <img
                                  className="h-36 w-full md:w-36 object-cover"
                                  src={blog.thumb}
                                  alt={blog.title}
                                />
                              </div>
                              <div className="p-6">
                                <div className="flex items-center space-x-4 mb-2">
                                  <div className="flex items-center text-gray-500">
                                    <FiUser className="h-4 w-4 mr-1" />
                                    <span className="text-sm">{`${blog?.author?.lastName} ${blog?.author?.firstName}`}</span>
                                  </div>
                                  <div className="flex items-center text-gray-500">
                                    <FiClock className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                      {formatDistanceToNow(new Date(blog?.createdAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-500">
                                    <FiEye className="h-4 w-4 mr-1" />
                                    <span className="text-sm">{blog?.numberView}</span>
                                  </div>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                                  {blog.title}
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                  {blog.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                                    >
                                      <FiTag className="h-3 w-3 mr-1" />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                    <div className='text-white flex-1 flex items-end'>
                      <Pagination totalCount={countBlogs} />
                    </div>
                  </div>
                  :
                  <div className='w-full h-full flex flex-col gap-1 items-center justify-center'>
                    <MdSearchOff size={128}/>
                    <span>No blogs available</span>
                  </div>
                }
              </div>
            </div>
          </div>
            </div>
        }

        {
            variable === 'find-us' &&
            <>
            <div className={clsx('w-full min-h-[476px] flex justify-center', providerData?.theme === 'dark' &&  'bg-[#343a40] text-white')}>
            <div className='w-[90%]'>
              <div className='w-[800px] h-fit pt-[24px] pb-[48px] mx-auto flex flex-col gap-8'>
                <div className='w-full text-[22px] leading-7 font-semibold'>Location</div>
                <div className='w-full h-fit p-[20px] border border-[#868e96] rounded-md bg-[#212529] flex flex-col gap-6'>
                  <div className='w-full flex items-center justify-between h-[40px]'>
                    <span className='text-[22px] font-semibold leading-7'>{providerData?.bussinessName}</span>
                    <Button handleOnclick={handleShowDistance} style={'px-[23px] rounded-md text-white bg-[#15a9e8] w-fit h-[40px]'}>Show distance</Button>
                  </div>
                  <div className='w-full h-fit flex gap-8'>
                    <div className='flex flex-1 flex-col gap-2'>
                      <div className='w-full h-[40px] flex gap-2 items-center text-[#868e96]'>
                        <FaLocationDot />
                        <span className='text-[14px] leading-5 font-normal text-white'>{providerData?.address}</span>
                      </div>
                      <div className='w-full flex flex-col gap-4'>
                        <div className='w-full h-[24px] flex gap-2 items-center text-[#868e96]'>
                          <FaRegClock />
                          <span className='text-[14px] leading-5 font-normal text-white'>Working Hours</span>
                          <span onClick={()=>{setShowWorkingHours(prev => !prev)}} className='cursor-pointer'>{!showWorkingHours ? <FaChevronDown /> : <FaChevronUp />}</span>
                        </div>
                        {
                          showWorkingHours &&
                          <div className='w-full pl-[36px] flex flex-col gap-2'>
                            <div className='w-full border-b border-dashed border-[#868e96] flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Monday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.startmonday} - ${providerData?.time?.endmonday}`}</span>
                            </div>
                            <div className='w-full border-b border-dashed border-[#868e96] flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Tuesday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.starttuesday} - ${providerData?.time?.endtuesday}`}</span>
                            </div>
                            <div className='w-full border-b border-dashed border-[#868e96] flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Wednesday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.startwednesday} - ${providerData?.time?.endwednesday}`}</span>
                            </div>
                            <div className='w-full border-b border-dashed border-[#868e96] flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Thursday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.startthursday} - ${providerData?.time?.endthursday}`}</span>
                            </div>
                            <div className='w-full border-b border-dashed border-[#868e96] flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Friday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.startfriday} - ${providerData?.time?.endfriday}`}</span>
                            </div>
                            <div className='w-full border-b border-dashed border-[#868e96] flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Saturday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.startsaturday} - ${providerData?.time?.endsaturday}`}</span>
                            </div>
                            <div className='w-full flex justify-between pb-[6px]'>
                              <span className='text-[14px] leading-5'>Sunday</span>
                              <span className='text-[14px] leading-5 font-medium'>{`${providerData?.time?.startsunday} - ${providerData?.time?.endsunday}`}</span>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                    <div className='flex flex-1 flex-col h-[188px]'>
                      {/* Hiển thị bản đồ */}
                      <div className='w-full h-full rounded-lg' ref={mapContainer} style={{ zIndex: 1000 }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            {
                showMap && 
                <div className='w-full h-full z-[1000] fixed top-0 left-0 bg-overlay flex items-center justify-center'>
                <div className='w-[800px] h-[600px] border-2 border-[#868e96] rounded-md relative'>
                    <Mapbox userCoords={userLocation} providerCoords={providerLocation} small={true}/>
                    <div onClick={()=>setShowMap(false)} className='w-fit h-fit absolute top-2 right-2 cursor-pointer hover:text-[#868e96]'><FaWindowClose size={20}/></div>
                </div>
                </div>
            }
            </>
        }
        <div className={clsx('w-full h-[229px]', providerData?.theme === 'dark' ? 'bg-[#2b3035]' : 'bg-[rgba(248,249,250,0.5)]')}>
          {renderFooter()}
        </div>

        {
          (adminData && current?._id !== adminData[0]?._id) &&
          <div className='fixed right-6 bottom-6'>
            <span onClick={()=>handleShowChat()}
              className="cursor-pointer bg-[#0a66c2] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#084a93] transition-all"
            >
            💬 Chat with Us
            </span>
          </div>
        }
      </div>
  )
}

export default DetailProvider
