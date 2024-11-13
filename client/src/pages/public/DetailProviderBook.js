import { apiGetServiceByProviderId, apiGetServiceProviderById } from 'apis';
import clsx from 'clsx';
import { BookingFromProvider } from 'components';
import React, { useEffect, useState } from 'react'
import { BsFillTagsFill } from 'react-icons/bs';
import { CiSearch } from 'react-icons/ci';
import { FaLocationDot, FaUserGear } from 'react-icons/fa6';
import { MdSearchOff } from 'react-icons/md';
import { SlCalender } from 'react-icons/sl';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import facebookk from '../../assets/facebook.png'
import instagramm from '../../assets/instagram.png'
import likedIn from '../../assets/likedin.png'
import youTube from '../../assets/youtube.png'
import twitter from '../../assets/twitter.jpg'
import tiktok from '../../assets/tiktok.jpg'

const DetailProviderBook = () => {
  const navigate = useNavigate();
  const {current} = useSelector(state => state.user)
  const [providerData, setProviderData] = useState(null)
  const {prid} = useParams()
  const [service, setService] = useState(null)
  const [indexFooter, setIndexFooter] = useState([])

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

  useEffect(() => {
    const fetchData = async() => {
      const response = await apiGetServiceByProviderId(prid)
      setService(response?.services)
    }
    fetchData()
  }, []);

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

  return (
    <div className='w-full'>
        <div className={clsx('w-full fixed top-0 left-0 h-[86px] flex justify-center z-[100]', providerData?.theme === 'dark' && 'bg-[#212529] text-white')}>
          <div className='w-[90%] h-full flex gap-10 items-center text-[15px]'>
            <span onClick={()=>{navigate(`/detail_provider/service/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize')}>Service</span>
            <span onClick={()=>{navigate(`/detail_provider/book/${providerData?._id}`);}} className={clsx('font-semibold cursor-pointer capitalize border-b-2 border-[#15a9e8]')}>Book Now</span>
            <span onClick={()=>{navigate(`/detail_provider/product/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize')}>Product</span>
            <span onClick={()=>{navigate(`/detail_provider/blog/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize')}>Blog</span>
            <span onClick={()=>{navigate(`/detail_provider/find-us/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize')}>Find us</span>
          </div>
        </div>
        <div className='w-full h-[86px]'></div>

        <div className={clsx('w-full min-h-[476px] flex justify-center', providerData?.theme === 'dark' &&  'bg-[#343a40] text-white')}>
          <div className='w-[90%] flex gap-8'>
            <div className='w-[66%] h-fit bg-[#212529] mt-[32px] rounded-md p-[24px] flex flex-col gap-4'>
              {
                service?.length > 0 ? 
                <>
                <div className='w-full h-[40px] flex justify-between items-center'>
                <span className='text-[18px] font-semibold'>Choose Service</span>
                <div className='w-[187px] h-[40px] flex gap-1 items-center border rounded-l-full rounded-r-full pl-[8px] pr-[16px] py-[8px] bg-[#212529]'>
                  <span className='text-xl'><CiSearch size={20}/></span>
                  <input className=' h-full w-[129px] bg-transparent outline-none text-[15px] text-[white] placeholder:text-white' placeholder='Search services'/>
                </div>
              </div>
              <div className='w-full flex flex-col gap-4'>
                {service?.map((el, index) => 
                  <BookingFromProvider providerData={providerData} serviceData={el}/>
                )}
              </div>
                </>
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
      <div className={clsx('w-full h-[229px]', providerData?.theme === 'dark' ? 'bg-[#2b3035]' : 'bg-[rgba(248,249,250,0.5)]')}>
          {renderFooter()}
        </div>
      </div>
  )
}

export default DetailProviderBook
