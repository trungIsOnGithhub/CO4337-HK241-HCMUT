import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';
import { apiGetServiceProviderById } from 'apis';
import clsx from 'clsx';
import { Button } from 'components';
import Mapbox from 'components/Map/Mapbox';
import React, { useEffect, useRef, useState } from 'react'
import { FaChevronDown, FaChevronUp, FaRegClock, FaWindowClose } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import facebookk from '../../assets/facebook.png'
import instagramm from '../../assets/instagram.png'
import likedIn from '../../assets/likedin.png'
import youTube from '../../assets/youtube.png'
import twitter from '../../assets/twitter.jpg'
import tiktok from '../../assets/tiktok.jpg'


const GOONG_API_KEY = 'HjmMHCMNz4xyFqc54FsgxrobHmt48vwp7U8xzQUC';
const GOONG_MAPTILES_KEY = 'IXqHXe9w2riica5A829SuB6HUl5Fi1Yg7LC9OHF2';
const DetailProviderFindUs = () => {
  const navigate = useNavigate();
  const {current} = useSelector(state => state.user)
  const [providerData, setProviderData] = useState(null)
  const {prid} = useParams()
  const [showMap, setShowMap] = useState(false);
  const [showWorkingHours, setShowWorkingHours] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [providerLocation, setProviderLocation] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [indexFooter, setIndexFooter] = useState([])

  const renderFooter = () => {
    if (!indexFooter) return null;
  
    // Sắp xếp theo order (thứ tự thấp hơn sẽ ở trên cùng)
    const sortedFooter = [...indexFooter].sort((a, b) => a.order - b.order);
  
    // Tạo cấu trúc footer
    const leftColumn = sortedFooter.filter(item => item.column === 'left');
    const rightColumn = sortedFooter.filter(item => item.column === 'right');
  
    console.log(leftColumn)
    console.log(rightColumn)
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

  useEffect(() => {
    goongjs.accessToken = GOONG_MAPTILES_KEY;

    map.current = new goongjs.Map({
        container: mapContainer.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [105.83991, 21.02800],
        zoom: 9,
    });
  }, []);

  useEffect(() => {
    if (map.current && providerData) {
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
  }, [providerData, mapContainer.current]);

  const handleShowDistance = () => {
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
    setIndexFooter(providerData?.indexFooter)
  }, [providerData]);


  return (
    <div className='w-full'>
        <div className={clsx('w-full fixed top-0 left-0 h-[86px] flex justify-center z-[100]', providerData?.theme === 'dark' && 'bg-[#212529] text-white')}>
          <div className='w-[90%] h-full flex gap-10 items-center text-[15px]'>
            <span onClick={()=>{navigate(`/detail_provider/service/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize')}>Service</span>
            <span onClick={()=>{navigate(`/detail_provider/book/${providerData?._id}`);}} className={clsx('font-semibold cursor-pointer capitalize')}>Book Now</span>
            <span onClick={()=>{navigate(`/detail_provider/product/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize')}>Product</span>
            <span onClick={()=>{navigate(`/detail_provider/blog/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize')}>Blog</span>
            <span onClick={()=>{navigate(`/detail_provider/find-us/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize border-b-2 border-[#15a9e8]')}>Find us</span>
          </div>
        </div>
        <div className='w-full h-[86px]'></div>
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
        <div className={clsx('w-full h-[229px]', providerData?.theme === 'dark' ? 'bg-[#2b3035]' : 'bg-[rgba(248,249,250,0.5)]')}>
          {renderFooter()}
        </div>
      </div>
  )
}

export default DetailProviderFindUs
