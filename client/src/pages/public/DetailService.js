import React ,{useState, useEffect, useCallback, memo, useRef}from 'react'
import {createSearchParams, useParams} from 'react-router-dom'
import { apiGetOneProduct, apiGetProduct } from '../../apis/product'
import { apiGetOneService, apiGetServicePublic } from '../../apis/service'
import {Breadcrumb, Button, SelectQuantity, ProductExtra, ProductInformation, CustomSlider} from '../../components'
import Slider from "react-slick";
import ReactImageMagnify from 'react-image-magnify';
import { formatPrice, formatPricee, renderStarfromNumber } from '../../ultils/helper';
import {productExtra} from '../../ultils/constant'
import DOMPurify from 'dompurify';
import clsx from 'clsx';
import { set } from 'react-hook-form';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { apiUpdateCart } from 'apis';
import path from 'ultils/path';
import withBaseComponent from 'hocs/withBaseComponent';
import { toast } from 'react-toastify';
import { getCurrent } from 'store/user/asyncAction';

const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1
};


const DetailService = ({isQuickView, data, location, dispatch, navigate}) => {
  const nameRef = useRef()
  const {current} = useSelector(state => state.user)
  const params =useParams()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [productCate, setProductCate] = useState(null)
  
  const [category, setCategory] = useState(null)
  
  const [variant, setVariant] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  
  const [sid, setSid] = useState(null)
  
  const [update, setUpdate] = useState(false)
  const reRender = useCallback(() => {
    setUpdate(!update)
  },[update])
  
  const [currentProduct, setCurrentProduct] = useState({
    name:'',
    thumb:'',
    images: [],
    price:'',
    color: ''
  })
  useEffect(() => {
    if(sid){
      fetchServiceData()
      fetchServiceCate()
    }
    window.scrollTo(0,0)
    nameRef.current?.scrollIntoView({block: 'center'})
    setCurrentProduct({
      name:'',
      thumb:'',
      images: [],
      price:'',
      color: ''
    })
  }, [sid])
  
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
    if(variant){
      setCurrentProduct({
        name: product?.variants?.find(el => el.sku === variant)?.name,
        thumb: product?.variants?.find(el => el.sku === variant)?.thumb,
        images: product?.variants?.find(el => el.sku === variant)?.image,
        price: product?.variants?.find(el => el.sku === variant)?.price,
      })
    }
    else{
      setCurrentProduct({
        name: product?.name,
        thumb: product?.thumb,
        images: product?.image,
        price: product?.price,
      })
    }
  }, [variant])
  
  const fetchServiceData = async ()=>{
    const response = await apiGetOneService(sid)
    console.log(response)
    if(response?.success){
      setProduct(response?.service)
      setCurrentImage(response?.service?.thumb)
      setCurrentProduct({
        name: response?.service?.name,
        thumb: response?.service?.thumb,
        images: response?.service?.image,
        price: response?.service?.price,
      })
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
  
  const handleClickImage = (e,el) => {
    e.stopPropagation();
    setCurrentImage(el)
    setCurrentProduct(prev => ({
      ...prev,
      thumb: el
    }))
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

  const handleAddtoCart = async() => { 
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
    const response = await apiUpdateCart({
        sid, 
        color: currentProduct?.color || product?.color, 
        quantity, 
        price: currentProduct?.price || product?.price, 
        thumb: currentProduct?.thumb || product?.thumb,
        name: currentProduct?.name || product?.name,
      })
    if(response.success){
      toast.success(response.mes)
      dispatch(getCurrent())
    }
    else{
      toast.error(response.mes)
    }
   }

  return (
    <div className={clsx('w-full')}> 
      {!isQuickView && <div className='h-[81px] flex items-center justify-center bg-gray-100'>
        <div ref={nameRef} className='w-main'>
          <h3 className='font-semibold'>{currentProduct?.name || product?.name}</h3>
          <Breadcrumb name={currentProduct?.name || product?.name} category={category} />
        </div>
      </div>}
      <div onClick={e => e.stopPropagation()} className={clsx('bg-white m-auto mt-4 flex', isQuickView ? 'max-w-[900px] gap-16 p-8 max-h-[90vh] overflow-y-auto': 'w-main')}>
        <div className={clsx('flex flex-col gap-4', isQuickView ? 'w-1/2' : 'w-2/5')}>
          <div className='h-[458px] w-[458px] border overflow-hidden flex items-center justify-center'>
            <ReactImageMagnify {...{
              smallImage: {
                  alt: 'Wristwatch by Ted Baker London',
                  isFluidWidth: true,
                  src: currentProduct?.thumb || currentImage,
              },
              largeImage: {
                  src: currentProduct?.thumb || currentImage,
                  width: 1200,
                  height: 1200
              },
            }} />
          </div>
          {/* <img src={product?.image} alt='product' className='border h-[458px] w-[458px] object-cover' /> */}
          <div className='w-[458px]'>
            <Slider className='image_slider flex gap-2'{...settings}>


              {currentProduct?.images?.length > 0 && currentProduct?.images?.map(el => (
                <div key={el}>
                  <img onClick={e=> handleClickImage(e,el)} src={el} alt="sup_product" className='cursor-pointer border h-[141px] w-[141px] object-cover'/>
                </div>
              ))}
            </Slider>
          </div>
        </div>
        <div className={clsx('pr-[24px] flex flex-col gap-4', isQuickView  ? 'w-1/2' : 'w-2/5')}>
          <div className='flex items-center justify-between'>
            <h2 className='text-[30px] font-semibold'>
              {`${formatPrice(formatPricee(currentProduct?.price || product?.price))} VNĐ`}
            </h2>
            <span className='text-sm text-main'>
              {`(Booking: ${product?.bookingQuantity})`}
            </span>
          </div>
          <div className='flex items-center gap-1'>
            {renderStarfromNumber(product?.totalRatings)?.map((el, index)=>(
              <span key={index}>{el}</span>
            ))}
          </div>
          <ul className='text-sm text-gray-500 list-square pl-4'>
            {product?.description?.length > 1 
              &&
            product?.description?.map(el=>(
              <li className=' leading-6' key={el}>{el}</li>
            )) }
            {product?.description?.length === 1 
              &&
            <div className='text-sm line-clamp-[10] mb-8' dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(product?.description[0])}}></div>}
          </ul>

          <div className='my-4 flex flex-col gap-4'>
            <span className='font-bold'>
              Other options
            </span>
            <div className='flex flex-wrap items-center w-full'>
              <div 
              onClick={() =>  setVariant(null)} 
              className= {clsx('flex items-center gap-2 p-2 border cursor-pointer', variant === null && 'border-gray-500 shadow-md rounded-md')}>
                <img src={product?.thumb} alt='thumb' className='w-16 h-16 border rounded-md object-cover'></img>
                <span className='flex flex-col'>
                  <span>{product?.name}</span>
                  <span className='text-sm '>{`${formatPrice(formatPricee(currentProduct?.price || product?.price))} VNĐ`}</span>
                </span>
              </div>
              {
                product?.variants?.map(el=>(
                  <div 
                  key={el?.sku}
                  onClick={() =>  setVariant(el?.sku)} 
                  className= {clsx('flex items-center gap-2 p-2 border cursor-pointer', variant === el?.sku && 'border-red-500')}>
                    <img src={el?.thumb} alt='thumb' className='w-16 h-16 border rounded-md object-cover'></img>
                    <span className='flex flex-col'>
                      <span>{el?.color}</span>
                      <span className='text-sm '>{el?.price}</span>
                    </span>
                  </div>
                ))

              }
            </div>
          </div>

          <div className='flex flex-col gap-8'>
            <div className='flex items-center gap-4'>
              <span className='font-semibold'>Quantity: </span>
              <SelectQuantity quantity={quantity} editQuantity={editQuantity} handleChange={handleChange} />
            </div>
            <div className='flex gap-4'>
            <Button handleOnclick={handleAddtoCart} style={`px-4 py-2 rounded-md text-white font-semibold my-2 bg-blue-500 w-fit`}>
              Book now
            </Button>
            <Button handleOnclick={handleAddtoCart}>
              Add to wishlist
            </Button>
            </div>
          </div>
        </div>
        {!isQuickView && 
          <div className='w-1/5'> 
            {productExtra.map(el =>(
              <ProductExtra key={el.id} name={el.name} icon={el.icon} sup={el.sup}/>
            ))}
          </div>
        }
      </div>

      {!isQuickView && <div className='w-main m-auto mt-[8px]'>
        <ProductInformation ratings={product?.rating} totalRatings={product?.totalRatings} nameProduct={product?.name} sid={product?._id} reRender={reRender}/>
      </div>}

      {!isQuickView && 
      <>
        <div className='w-main m-auto mt-[8px]'>
          <h3 className='text-[20px] font-semibold py-[15px] border-b-2 border-gray-500 shadow-sm'>OTHER CUSTOMERS ALSO BUY:</h3>
          <CustomSlider products={productCate} normal={true}/>
        </div>
        <div className='h-[100px] w-full'></div>
      </>}
    </div>
  )
}

export default withBaseComponent(memo(DetailService))