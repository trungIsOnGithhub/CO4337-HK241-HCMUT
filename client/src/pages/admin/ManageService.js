import React, {useCallback, useEffect, useState} from 'react'
import { InputFormm, Pagination} from 'components'

import { useForm } from 'react-hook-form'
import { apiGetProduct, apiDeleteProduct} from 'apis/product'
import moment from 'moment'
import { useSearchParams, createSearchParams, useNavigate, useLocation} from 'react-router-dom'
import useDebounce from 'hook/useDebounce'
import UpdateProduct from './UpdateProduct'
import icons from 'ultils/icon'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { apiDeleteServiceByAdmin, apiGetServiceByAdmin } from 'apis/service'
import clsx from 'clsx'
import { formatPrice, formatPricee } from 'ultils/helper'
import UpdateService from './UpdateService'
import VariantService from './VariantService'
import bgImage from '../../assets/clouds.svg'
import { CiSearch } from 'react-icons/ci'
import { FaChevronLeft, FaChevronRight, FaEye, FaTimes } from 'react-icons/fa'

const ManageService = () => {
  const {MdModeEdit, MdDelete, FaCopy} = icons
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const {register,formState:{errors}, handleSubmit, watch} = useForm()
  const [services, setServices] = useState(null)
  const [counts, setCounts] = useState(0)
  const [editService, setEditService] = useState(null)
  const [update, setUpdate] = useState(false)
  const [variant, setVariant] = useState(null)
  const [isShowStaff, setIsShowStaff] = useState(false)
  const [expandedService, setExpandedService] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]) 
    fetchService(searchParams)
  }, [params, update])

  const handleExpand = async (serviceId) => {
    setCurrentImageIndex(0);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setExpandedService(expandedService === serviceId ? null : serviceId);
    } catch (error) {
      console.error("Error loading service details:", error);
    } 
  };

  const handleDeleteService = async(sid) => {
    Swal.fire({
      title: 'Are you sure',
      text: 'Are you sure you want to delete this service?',
      icon: 'warning',
      showCancelButton: true
    }).then(async(rs)=>{
      if(rs.isConfirmed){
        const response = await apiDeleteServiceByAdmin(sid)
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

  const render = useCallback(() => { 
    setUpdate(!update)
   })

  const fetchService = async(params) => {
    const response = await apiGetServiceByAdmin({...params, limit: process.env.REACT_APP_LIMIT})
    if(response?.success){
      setServices(response.services)
      setCounts(response.counts)
    }
  }

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

  const handleNavigateUpdateService = (serviceId) => {
    navigate(`/admin/update_service/${serviceId}`)
  }

  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-24 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Manage Services</span>
        </div>
        <div className='w-[95%] h-[600px] shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-6 py-4 flex flex-col gap-4'>
          <div className='w-full h-fit flex justify-between items-center'>
            <h1 className='text-[#00143c] font-medium text-[16px]'>{`All Services (${counts})`}</h1>
            <form className='w-[40%]' >
              <InputFormm
                id='q'
                register={register}
                errors={errors}
                fullWidth
                placeholder= 'Search service by name, category ...'
                style={'w-full bg-[#f4f6fa] h-10 rounded-md pl-2 flex items-center'}
                styleInput={'w-[100%] bg-[#f4f6fa] outline-none text-[#99a1b1]'}
              >
              </InputFormm>
            </form>
          </div>
          <div className='text-[#99a1b1]'>
            <div className='w-full flex gap-1 border-b border-[##dee1e6] py-1'>
              <span className='w-[40%] flex  font-medium justify-start px-[8px]'>Name</span>
              <span className='w-[10%] flex  font-medium justify-center'>Duration</span>
              <span className='w-[10%] flex  font-medium justify-center'>Price</span>
              <span className='w-[20%] flex  font-medium justify-center'>Employees</span>
              <span className='w-[20%] flex  font-medium justify-center'>Action</span>
            </div>
            <div>
              {
                services?.map((el, index)=> (
                  <div key={index} className='w-full flex mt-[12px] rounded-[5px] gap-1 h-[64px] p-[12px]' style={{boxShadow: '0 1px 3px 0 rgba(0, 0, 0, .2)', borderLeft: `3px solid ${getColorByCategory(el?.category)}` }}>
                    <span className='w-[40%] px-2 py-2 text-[#00143c] flex justify-start font-semibold items-center'>
                      <img src={el?.thumb} className='w-[40px] h-[40px] mr-[10px] rounded-full'/>
                      <div className='flex-1 max-w-[80%] line-clamp-2'>{el?.name}</div>
                    </span>
                    <span className='w-[10%] px-2 py-2 text-[#00143c] font-medium flex justify-center'>{el?.duration}min</span>
                    <span className='w-[10%] px-2 py-2 text-[#00143c] font-medium flex justify-center'>{formatPricee(el?.price)}</span>
                    <span className='w-[20%] px-2 text-[#00143c]'>
                      <div className='flex relative cursor-pointer h-full items-center justify-center'
                        onMouseEnter = {e => {
                          e.stopPropagation();
                          setIsShowStaff(el._id)
                        }}
                        onMouseLeave = {e => {
                          e.stopPropagation();
                          setIsShowStaff(null)
                        }}>
                        {el.assigned_staff.map((staff, index) => {
                          if(+index <= 1){
                            return <img className={`w-[34px] h-[34px] border-[3px] border-white rounded-full ml-[-10px] mr-[0px] z-[${el?.assigned_staff?.length - index}]`} src={staff?.avatar}/>
                          }
                          else if(index === 2){
                            return <span className='w-[34px] h-[34px] bg-[rgba(230,239,254,1)] rounded-full ml-[-10px] mr-[0px] text-[#005aee] font-medium border-[3px] border-white text-sm flex items-center justify-center'>{`+ ${el?.assigned_staff?.length - 2}`}</span>
                          }
                        })}

                        { isShowStaff === el._id &&
                          <div className='flex flex-col gap-1 bg-[#00143c] text-white rounded-md w-[200px] p-[12px] absolute top-10 left-[20px] z-50'>
                          {el.assigned_staff.map((item, index) => (
                          <div key={index} className='flex justify-start items-center w-full'>
                            <img key={index} src={item?.avatar} className={'w-[24px] h-[24px] mr-[10px] rounded-full'}></img>
                            <span className='px-0 text-sm font-medium'>{`${item.firstName} ${item.lastName}`}</span>
                          </div>))}
                          </div>
                        }
                      </div>
                    </span>
                    <span className='w-[20%] px-2 py-2 flex justify-center items-center'>
                      <span onClick={() => handleNavigateUpdateService(el?._id)} 
                      className='inline-block hover:underline cursor-pointer text-[#005aee] hover:text-orange-500 px-0.5'><MdModeEdit
                      size={24}/></span>
                      <span onClick={() => handleDeleteService(el?._id)} 
                      className='inline-block hover:underline cursor-pointer text-[#005aee] hover:text-orange-500 px-0.5'><MdDelete size={24}/></span>
                      <span onClick={() => handleExpand(el?._id)}
                      className='inline-block hover:underline cursor-pointer text-[#005aee] hover:text-orange-500 px-0.5'><FaEye 
                      size={22}/></span>
                    </span>

                    {expandedService === el?._id && (
                      <div className="fixed inset-0 z-[500] flex items-center justify-end bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-in-up mr-24">
                          <button
                            onClick={() => setExpandedService(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                          >
                            <FaTimes className="text-xl" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#00143c]">
                            <div>
                              <h3 className="text-lg font-semibold mb-4">Service Details</h3>
                              <div className="space-y-2">
                                <p>
                                  <span className="font-medium">Price: </span>{`${formatPrice(el?.price)} VNĐ`}
                                </p>
                                <p>
                                  <span className="font-medium">Duration:</span> {el?.duration}min
                                </p>
                                <p>
                                  <span className="font-medium">Category:</span> {el?.category}
                                </p>
                                <p>
                                  <span className="font-medium">Created Date:</span> {new Date(el?.createdAt).toLocaleDateString()}
                                </p>
                              </div>

                              <h3 className="text-lg font-semibold mt-6 mb-4 text-[#00143c]">Employee:</h3>
                              <div className="flex flex-wrap gap-4 text-[#00143c]">
                                {el?.assigned_staff.map((provider, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg shadow-sm"
                                  >
                                    <img
                                      src={provider?.avatar}
                                      alt={`${provider?.lastName} ${provider?.firstName}`}
                                      className="w-12 h-12 rounded-full object-cover"
                                      onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1633613286991-611fe299c4be";
                                      }}
                                    />
                                    <div>
                                      <p className="font-medium">{`${provider?.lastName} ${provider?.firstName}`}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
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

export default ManageService