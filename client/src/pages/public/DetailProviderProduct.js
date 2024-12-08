import { apiGetProductByProviderId, apiGetServiceProviderById } from 'apis';
import clsx from 'clsx';
import { Button, ProductItem } from 'components';
import React, { useEffect, useState } from 'react'
import { CiSearch } from 'react-icons/ci';
import { MdOutlineSort, MdSearchOff } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import facebookk from '../../assets/facebook.png'
import instagramm from '../../assets/instagram.png'
import likedIn from '../../assets/likedin.png'
import youTube from '../../assets/youtube.png'
import twitter from '../../assets/twitter.jpg'
import tiktok from '../../assets/tiktok.jpg'

const DetailProviderProduct = () => {
  const navigate = useNavigate();
  const {current} = useSelector(state => state.user)
  const [providerData, setProviderData] = useState(null)
  const {prid} = useParams()
  const [showSort, setShowSort] = useState(false)
  const [product, setProduct] = useState(null)
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
      const response = await apiGetProductByProviderId(prid)
      setProduct(response?.products)
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
  
    // removed log
    // removed log
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
            <span onClick={()=>{navigate(`/detail_provider/book/${providerData?._id}`);}} className={clsx('font-semibold cursor-pointer capitalize')}>Book Now</span>
            <span onClick={()=>{navigate(`/detail_provider/product/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize border-b-2 border-[#15a9e8]')}>Product</span>
            <span onClick={()=>{navigate(`/detail_provider/blog/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize')}>Blog</span>
            <span onClick={()=>{navigate(`/detail_provider/find-us/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize')}>Find us</span>
          </div>
        </div>
        <div className='w-full h-[86px]'></div>
        <div className={clsx('w-full min-h-[476px] flex justify-center', providerData?.theme === 'dark' &&  'bg-[#343a40] text-white')}>
            <div className='w-[90%] pt-[24px] pb-[48px] flex flex-col'>
              <div className='w-full flex justify-between'>
                <span className='text-[22px] font-semibold'>Products</span>
                <div className='relative'>
                  <Button handleOnclick={()=>{setShowSort(prev => !prev)}} style={'px-[23px] rounded-l-full rounded-r-full text-white border border-[##e6ebef] w-fit h-[40px] flex items-center gap-2'}><MdOutlineSort />Sort by</Button>
                  {
                    showSort && 
                    <div className='absolute w-[160px] h-[152px] px-[8px] py-[6px] bg-[#212529] rounded-md right-0 mt-2 z-50 flex flex-col'>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Price (lowest)</span>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Price (highest)</span>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Popularity</span>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Name (ascending)</span>
                      <span className='h-[20%] text-[14px] px-[8px] py-[4px] font-medium cursor-pointer hover:bg-gray-700'>Name (descending)</span>
                    </div>
                  }
                </div>
              </div>
              <div className='w-full h-full flex gap-6'>
                <div className='w-[18%] h-full  mt-[32px] border-r border-white'>
                  <div className='w-[187px] h-[40px] flex gap-1 items-center border rounded-l-full rounded-r-full pl-[8px] pr-[16px] py-[8px] bg-[#212529]'>
                    <span className='text-xl'><CiSearch size={20}/></span>
                    <input className=' h-full w-[129px] bg-transparent outline-none text-[15px] text-[white] placeholder:text-white' placeholder='Search products'/>
                  </div>
                </div>
                <div className='w-[80%] h-full mt-[32px]'>
                  {
                    product?.length > 0 ?
                    <div className='flex flex-wrap gap-4'>    
                      {product?.map((el,index) => (
                        <div key={index} className='w-[31%]'>
                          <ProductItem productData={el}/>
                        </div>
                      ))} 
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
          <div className={clsx('w-full h-[229px]', providerData?.theme === 'dark' ? 'bg-[#2b3035]' : 'bg-[rgba(248,249,250,0.5)]')}>
            {renderFooter()}
          </div>
      </div>
  )
}

export default DetailProviderProduct
