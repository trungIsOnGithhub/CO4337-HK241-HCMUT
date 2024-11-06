import React, {useCallback, useEffect, useState} from 'react'
import { InputForm, InputFormm, Pagination} from 'components'
import { useForm } from 'react-hook-form'
import { apiGetProductByAdmin, apiDeleteProduct} from 'apis/product'
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
import { FaPlus } from 'react-icons/fa'


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
  const handleDeleteProduct = async(pid) => {
    Swal.fire({
      title: 'Are you sure',
      text: 'Are you sure you want to delete this product?',
      icon: 'warning',
      showCancelButton: true
    }).then(async(rs)=>{
      if(rs.isConfirmed){
        const response = await apiDeleteProduct(pid)
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
                    <span className='w-[10%] px-2 py-2 text-[#00143c] font-medium flex justify-center'>{el?.quantity}</span>
                    <span className='w-[10%] px-2 py-2 text-[#00143c] font-medium flex justify-center'>{el?.soldQuantity}</span>
                    <span className='w-[10%] px-2 py-2 text-[#00143c] font-medium flex justify-center'>{el?.totalRatings}</span>
                    <span className='w-[10%] px-2 py-2 text-[#00143c] font-medium flex justify-center'>{el?.color}</span>
                    <span className='w-[20%] px-2 py-2 flex justify-center items-center'>
                      <span onClick={() => setEditProduct(el)} 
                      className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><MdModeEdit size={24}/></span>
                      <span onClick={() => handleDeleteProduct(el._id)} 
                      className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><MdDelete size={24}/></span>
                      <span onClick={() => handleNavigateAddVariant(el?._id)} 
                      className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><FaPlus size={24}/></span>
                    </span>
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
