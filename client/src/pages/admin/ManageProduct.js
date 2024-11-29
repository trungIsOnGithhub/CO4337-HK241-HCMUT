import React, {useCallback, useEffect, useState} from 'react'
import { InputForm, InputFormm, Pagination} from 'components'
import { useForm } from 'react-hook-form'
import { apiGetProductByAdmin, apiDeleteProduct, apiUpdateHiddenStatus} from 'apis/product'
import moment from 'moment'
import { useSearchParams, createSearchParams, useNavigate, useLocation} from 'react-router-dom'
import useDebounce from 'hook/useDebounce'
import UpdateProduct from './UpdateProduct'
import icons from 'ultils/icon'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { VariantProduct } from '.'
import bgImage from '../../assets/clouds.svg'
import { FaCirclePlus } from 'react-icons/fa6'
import { FaEye, FaEyeSlash, FaInfoCircle, FaPlus, FaTimes } from 'react-icons/fa'
import { formatPrice } from 'ultils/helper'
import path from 'ultils/path'
import { CiCircleInfo } from 'react-icons/ci'
import { IoMdInformationCircleOutline } from 'react-icons/io'


const ManageProduct = () => {
  const {MdModeEdit, MdDelete, FaCopy} = icons
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const {register,formState:{errors}, handleSubmit, watch} = useForm()
  const [products, setProducts] = useState(null)
  const [counts, setCounts] = useState(0)
  const [editProduct, setEditProduct] = useState(null)
  const [update, setUpdate] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedProduct, setExpandedProduct] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, []);

  const handleHiddenProduct = async(productId, status) => {
    if(status === "true"){
      Swal.fire({
        title: 'Are you sure',
        text: 'Are you sure you want to hide this product?',
        icon: 'warning',
        showCancelButton: true
      }).then(async(rs)=>{
        if(rs.isConfirmed){
          const response = await apiUpdateHiddenStatus(productId, {status: "true"})
          if(response.success){
           toast.success(response.mes)
          }
          else{
           toast.error(response.mes)
          }
          render()
        }
      })
    }
    else if(status === "false"){
      Swal.fire({
        title: 'Are you sure',
        text: 'Are you sure you want to unhide this product?',
        icon: 'warning',
        showCancelButton: true
      }).then(async(rs)=>{
        if(rs.isConfirmed){
          const response = await apiUpdateHiddenStatus(productId, {status: "false"})
          if(response.success){
           toast.success(response.mes)
          }
          else{
           toast.error(response.mes)
          }
          render()
        }
      })
    }
  }
  const render = useCallback(() => { 
    setUpdate(!update)
   })

  const fetchProduct = async(params) => {
    const response = await apiGetProductByAdmin({...params, limit: process.env.REACT_APP_LIMIT})
    if(response.success){
      setProducts(response.products)
      setCounts(response.counts)
    }
  }

  const queryDebounce = useDebounce(watch('q'),800)
  
  useEffect(() => {
    const searchParams = Object.fromEntries([...params]) 
    fetchProduct(searchParams)
  }, [params, update])

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

  const data = [
    {
        cate: 'Hairstylist',
        color: 'rgba(255, 0, 0, 0.5)' // Màu đỏ
    },
    {
        cate: 'Barber',
        color: 'rgba(0, 255, 0, 0.5)' // Màu xanh lá cây
    },
    {
        cate: 'Nail',
        color: 'rgba(0, 0, 255, 0.5)' // Màu xanh dương
    },
    {
        cate: 'Makeup',
        color: 'rgba(255, 255, 0, 0.5)' // Màu vàng
    },
    {
        cate: 'Tattoo',
        color: 'rgba(255, 0, 255, 0.5)' // Màu tím
    },
    {
        cate: 'Massage',
        color: 'rgba(0, 255, 255, 0.5)' // Màu cyan
    },
    {
        cate: 'Gym',
        color: 'rgba(255, 128, 0, 0.5)' // Màu cam
    },
    {
        cate: 'Yoga',
        color: 'rgba(128, 0, 255, 0.5)' // Màu violet
    },
    {
        cate: 'Fitness',
        color: 'rgba(255, 128, 128, 0.5)' // Màu hồng
    }
  ];


  const getColorByCategory = (category) => {
    const item = data.find(el => el.cate === category);
    return item ? item.color : 'rgba(0, 0, 0, 0.1)'; // Màu mặc định nếu không tìm thấy
  };

  const handleNavigateAddVariant = (productId) => {
    navigate(`/admin/add_variant_product/${productId}`)
  }
  
  const handleNavigateUpdateProduct = (productId) => {
    navigate(`/admin/update_product/${productId}`)
  }

  const handleExpand = async (productId) => {
    setCurrentImageIndex(0);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setExpandedProduct(expandedProduct === productId ? null : productId);
    } catch (error) {
      console.error("Error loading service details:", error);
    } 
  }
  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-24 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Manage Products</span>
        </div>
        <div className='w-[95%] h-[600px] shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-6 py-4 flex flex-col gap-4'>
          <div className='w-full h-fit flex justify-between items-center'>
            <h1 className='text-[#00143c] font-medium text-[16px]'>{`All Products (${counts})`}</h1>
            <form className='w-[40%]' >
              <InputFormm
                id='q'
                register={register}
                errors={errors}
                fullWidth
                placeholder= 'Search product by name, category ...'
                style={'w-full bg-[#f4f6fa] h-10 rounded-md pl-2 flex items-center'}
                styleInput={'w-[100%] bg-[#f4f6fa] outline-none text-[#99a1b1]'}
              >
              </InputFormm>
            </form>
          </div>
          <div className='text-[#99a1b1]'>
            <div className='w-full flex gap-1 border-b border-[##dee1e6] py-1'>
              <span className='w-[30%] flex  font-medium justify-start px-[8px]'>Product</span>
              <span className='w-[10%] flex  font-medium justify-center'>Price</span>
              <span className='w-[10%] flex  font-medium justify-center'>Quantity</span>
              <span className='w-[10%] flex  font-medium justify-center'>Sold</span>
              <span className='w-[10%] flex  font-medium justify-center'>Rating</span>
              <span className='w-[10%] flex  font-medium justify-center'>Color</span>
              <span className='w-[20%] flex  font-medium justify-center'>Action</span>
            </div>
            <div>
              {
                products?.map((el, index)=> (
                  <div key={index} className='w-full flex mt-[12px] rounded-[5px] gap-1 h-[64px] p-[12px]' style={{boxShadow: '0 1px 3px 0 rgba(0, 0, 0, .2)', borderLeft: `3px solid ${getColorByCategory(el?.category)}` }}>
                    <span className='w-[30%] px-2 py-2 text-[#00143c] flex justify-start font-semibold items-center'>
                      <img src={el?.thumb} className='w-[48px] h-[48px] mr-[10px] rounded-sm p-1 border border-[##dee1e6]'/>
                      <div className='flex-1 max-w-[80%] line-clamp-2'>{el?.title}</div>
                    </span>
                    <span className='w-[10%] px-2 py-2 text-[#00143c] font-medium flex justify-center'>{el?.price}</span>
                    <span className='w-[10%] px-2 py-2 text-[#00143c] font-medium flex justify-center'>{el?.quantity >= 0 ? el?.quantity : 0}</span>
                    <span className='w-[10%] px-2 py-2 text-[#00143c] font-medium flex justify-center'>{el?.soldQuantity}</span>
                    <span className='w-[10%] px-2 py-2 text-[#00143c] font-medium flex justify-center'>{el?.totalRatings}</span>
                    <span className='w-[10%] px-2 py-2 text-[#00143c] font-medium flex justify-center'>{el?.color}</span>
                    <span className='w-[20%] px-2 py-2 flex justify-center items-center'>
                      <span onClick={() => handleNavigateUpdateProduct(el?._id)} 
                      className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><MdModeEdit size={24}/></span>
                     {
                      !el?.isHidden ?
                      <span onClick={() => handleHiddenProduct(el._id, "true")} 
                      className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><FaEye size={24}/></span>
                      :
                      <span onClick={() => handleHiddenProduct(el._id, "false")}
                      className='inline-block hover:underline cursor-pointer text-blue-200 hover:text-orange-500 px-0.5'><FaEyeSlash size={24}/></span>
                     }
                      <span onClick={() => handleNavigateAddVariant(el?._id)} 
                      className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><FaPlus size={24}/></span>
                      <span onClick={() => handleExpand(el?._id)} 
                      className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><IoMdInformationCircleOutline size={24}/></span>
                    </span>

                    {expandedProduct === el?._id && (
                      <div className="fixed inset-0 z-[500] flex items-center justify-end bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-in-up mr-24">
                          <button
                            onClick={() => setExpandedProduct(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                          >
                            <FaTimes className="text-xl" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#00143c]">
                            <div>
                              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                              <div className="space-y-2">
                                <p>
                                  <span className="font-medium">Price: </span>{`${formatPrice(el?.price)} VNĐ`}
                                </p>
                                <p>
                                  <span className="font-medium">Category:</span> {el?.category}
                                </p>
                                <p>
                                  <span className="font-medium">Created Date:</span> {new Date(el?.createdAt).toLocaleDateString()}
                                </p>
                                <p>
                                  <span className='font-medium'>{`Color: ${el?.color}`}</span>
                                </p>
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-white"
                                  style={{ backgroundColor: el?.colorCode || '#111111' }}
                                ></div>
                              </div>

                              {el?.variants?.length > 0 && (
                                <>
                                  <h3 className="text-lg font-semibold mt-6 mb-4 text-[#00143c]">Variant:</h3>
                                  <div className="flex flex-col gap-2 text-[#00143c]">
                                  {el?.variants?.map((variant, index) => (
                                    <div
                                      key={index}
                                      onClick={()=>navigate(`/${path.ADMIN}/update_variant_product/${el?._id}/${variant?._id}`)}
                                      className="cursor-pointer flex w-[80%] overflow-x-auto items-center space-x-3 bg-gray-50 border border-gray-200 p-3 rounded-lg shadow-sm"
                                    >
                                      <img
                                        src={variant?.thumb}
                                        alt={`image variant`}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => {
                                          e.target.src = "https://images.unsplash.com/photo-1633613286991-611fe299c4be";
                                        }}
                                      />
                                      <div className='flex flex-col gap-1 items-start'>
                                        <p className="font-medium">{variant?.title}</p>
                                        <div className='flex items-center gap-1'>
                                          <span>Color:</span>
                                          <div
                                            className="w-6 h-6 rounded-full border-2 border-white"
                                            style={{ backgroundColor: variant?.colorCode || '#111111' }}
                                          ></div>
                                        </div>
                                      </div>

                                    </div>
                                  ))}
                                  </div>
                                </>
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold mb-4">Gallery</h3>
                              <div className="relative">
                                <img
                                  src={[el?.thumb, ...el?.image][currentImageIndex]}
                                  alt={currentImageIndex + 1}
                                  className="rounded-lg object-cover w-full h-80"
                                  onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1633613286991-611fe299c4be";
                                  }}
                                />
                               
                                <div className="flex justify-center mt-4 space-x-2">
                                  {[el?.thumb, ...el?.image]?.map((_, index) => (
                                    <button
                                      key={index}
                                      onClick={() => setCurrentImageIndex(index)}
                                      className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-blue-500" : "bg-gray-300"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-6 gap-2 mt-4">
                                {[el?.thumb, ...el?.image]?.map((image, index) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={index + 1}
                                    className={`rounded-lg object-cover w-full h-12 cursor-pointer ${index === currentImageIndex ? "ring-2 ring-blue-500" : ""}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                    onError={(e) => {
                                      e.target.src = "https://images.unsplash.com/photo-1633613286991-611fe299c4be";
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
          <div className='text-[#00143c] flex-1 flex items-end'>
            <Pagination totalCount={counts} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageProduct
