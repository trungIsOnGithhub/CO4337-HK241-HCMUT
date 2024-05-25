import React ,{useState, useEffect, useCallback, memo, useRef}from 'react'
import {createSearchParams, useParams} from 'react-router-dom'
import { apiGetOneProduct, apiGetProduct } from '../../apis/product'
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
import { apiUpdateCartProduct } from 'apis';
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


const DetailProduct = ({isQuickView, data, location, dispatch, navigate}) => {
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
      fetchProductData()
      fetchProductCate()
    }
    window.scrollTo(0,0)
    nameRef.current?.scrollIntoView({block: 'center'})
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
        title: product?.variants?.find(el => el.sku === variant)?.title,
        color: product?.variants?.find(el => el.sku === variant)?.color,
        thumb: product?.variants?.find(el => el.sku === variant)?.thumb,
        images: product?.variants?.find(el => el.sku === variant)?.image,
        price: product?.variants?.find(el => el.sku === variant)?.price,
      })
    }
    else{
      setCurrentProduct({
        title: product?.title,
        color: product?.color,
        thumb: product?.thumb,
        images: product?.image,
        price: product?.price,
      })
    }
  }, [variant])
  
  const fetchProductData = async ()=>{
    const response = await apiGetOneProduct(sid)
    if(response.success){
      setProduct(response?.product)
      setCurrentImage(response?.product?.thumb)
      setCurrentProduct({
        title: response?.product?.title,
        thumb: response?.product?.thumb,
        images: response?.product?.image,
        price: response?.product?.price,
        description: response?.product?.description,
      })
    }
  }

  const fetchProductCate = async ()=>{
    const response = await apiGetProduct({category})
    if(response.success){
      setProductCate(response.products)
    }
  }

  useEffect(() => {
    if(sid){
      fetchProductData()
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
    const response = await apiUpdateCartProduct({
        pid: sid, 
        color: currentProduct?.color || product?.color, 
        quantity, 
        price: currentProduct?.price || product?.price, 
        thumb: currentProduct?.thumb || product?.thumb,
        title: currentProduct?.title || product?.title,
        provider:product?.provider_id,
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
          <h3 className='font-semibold uppercase '>{currentProduct?.title || product?.title}</h3>
          <Breadcrumb name={currentProduct?.title || product?.title} category={category} />
        </div>
      </div>}
      <div onClick={e => e.stopPropagation()} className={clsx('bg-white m-auto mt-4 flex', isQuickView ? 'max-w-[900px] gap-16 p-8 max-h-[90vh] overflow-y-auto': 'w-main')}>
        <div className={clsx('flex flex-col gap-4', isQuickView ? 'w-1/2' : 'w-2/5')}>
          <div className='h-[458px] w-[458px] border overflow-hidden flex items-center justify-center'>
            <img src={currentProduct?.thumb || currentImage} className='w-full h-full object-contain'></img>
          </div>
          {/* <img src={product?.image} alt='product' className='border h-[458px] w-[458px] object-cover' /> */}
          <div className='w-[458px]'>
            <Slider className='image_slider flex gap-2'{...settings}>


              {!currentProduct?.images?.length > 0 && currentProduct?.images?.map(el => (
                <div key={el}>
                  <img onClick={e=> handleClickImage(e,el)} src={el} alt="sup_product" className='cursor-pointer border h-[141px] w-[141px] object-cover'/>
                </div>
              ))}

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
              {`In stock: ${product?.quantity}`}
            </span>
          </div>
          <div className='flex items-center gap-1'>
            {renderStarfromNumber(product?.totalRatings)?.map((el, index)=>(
              <span key={index}>{el}</span>
            ))}
            <span className='text-sm text-main'>
              {`(Sold: ${product?.soldQuantity})`}
            </span>
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

          <div className='my-4 flex gap-4'>
            <span className='font-bold'>
              Color
            </span>
            <div className='flex flex-wrap items-center w-full'>
              <div 
              onClick={() =>  setVariant(null)} 
              className= {clsx('flex items-center gap-2 p-2 border cursor-pointer', variant === null && 'border-red-500')}>
                <img src={product?.thumb} alt='thumb' className='w-16 h-16 border rounded-md object-cover'></img>
                <span className='flex flex-col'>
                  <span>{product?.color}</span>
                  <span className='text-sm '>{product?.price}</span>
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
            <Button fullWidth handleOnclick={handleAddtoCart}>
              Add to cart
            </Button>
          </div>
        </div>
        {!isQuickView && 
          <div className='w-1/5'> 
            {productExtra.map(el =>(
              <ServiceExtra key={el.id} name={el.name} icon={el.icon} sup={el.sup}/>
            ))}
          </div>
        }
      </div>

      {!isQuickView && <div className='w-main m-auto mt-[8px]'>
        <ServiceInformation ratings={product?.rating} totalRatings={product?.totalRatings} nameProduct={product?.title} sid={product?._id} reRender={reRender}/>
      </div>}

      {!isQuickView && 
      <>
        <div className='w-main m-auto mt-[8px]'>
          <h3 className='text-[20px] font-semibold py-[15px] border-b-2 border-main'>OTHER CUSTOMERS ALSO BUY:</h3>
          <CustomSliderProduct products={productCate} normal={true}/>
        </div>
        <div className='h-[100px] w-full'></div>
      </>}
    </div>
  )
}

export default withBaseComponent(memo(DetailProduct))