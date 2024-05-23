import React, {useCallback, useEffect, useState} from 'react'
import { InputForm, Pagination} from 'components'

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
import { formatPricee } from 'ultils/helper'
import UpdateService from './UpdateService'
import VariantService from './VariantService'

const ManageService = () => {
  const {MdModeEdit, MdDelete, FaCopy} = icons
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const {register,formState:{errors}, handleSubmit, watch} = useForm()
  const [products, setProducts] = useState(null)
  const [counts, setCounts] = useState(0)
  const [editService, setEditService] = useState(null)
  const [update, setUpdate] = useState(false)
  const [variant, setVariant] = useState(null)
  const [isShowStaff, setIsShowStaff] = useState(false)
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

  const handleSearchProduct = (data) => {
  }

  const fetchProduct = async(params) => {
    const response = await apiGetServiceByAdmin({...params, limit: process.env.REACT_APP_LIMIT})
    if(response?.success){
      setProducts(response.services)
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
  
  
  return (
    <div className='w-full flex flex-col gap-4 relative'>
      {editService &&  
      <div className='absolute inset-0 bg-zinc-900 h-fit z-50 flex-auto'>
        <UpdateService editService={editService} render={render} setEditService={setEditService}/>
      </div>}

      {variant &&  
      <div className='absolute inset-0 bg-zinc-900 h-fit z-50 flex-auto'>
        <VariantService variant={variant} render={render} setVariant={setVariant}/>
      </div>}

      <div className='h-[69px] w-full'>
      </div>
      <div className='p-4 border-b w-full flex justify-between items-center fixed top-0 bg-black z-30'>
        <h1 className='text-3xl font-bold tracking-tight'>Manage Service</h1>
      </div>

      <div className='flex w-full justify-end items-center px-4 '>
        <form className='w-[45%]' onSubmit={handleSubmit(handleSearchProduct)}>
          <InputForm
            id='q'
            register={register}
            errors={errors}
            fullWidth
            placeholder= 'Search service by name, category ...'
          >
            
          </InputForm>
        </form>
      </div>
      <table className='table-auto p-0'>
        <thead className='font-bold bg-blue-500 text-[13px] text-white'>
          <tr className='border border-gray-500'>
            <th className='text-center py-2'>#</th>
            <th className='text-center py-2'>Name</th>
            <th className='text-center py-2'>Category</th>
            <th className='text-center py-2'>Duration</th>
            <th className='text-center py-2'>Price</th>
            <th className='text-center py-2'>Staffs</th>
            <th className='text-center py-2'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((el,idx)=>(
            <tr key={el._id}>
              <td className='text-center py-2'>
                {((+params.get('page')||1)-1)*+process.env.REACT_APP_LIMIT + idx + 1}
              </td>
              <td className='text-center py-2'>
                <div className='flex gap-2 justify-start items-center font-semibold ml-5 pl-10'>
                  <img src={el.thumb} alt='thumb' className='w-14 h-14 rounded-md object-cover border-2 border-gray-600 shadow-inner'></img>
                  {el.name}
                </div>
              </td>
              <td className='text-center py-2'>
                {el.category}
              </td>
              <td className='text-center py-2'>
                {`${el.duration} minutes`}
              </td>
              <td className='text-center py-2'>
              {el.price}
              </td>
              <td className='text-center py-2'>
                <div className='relative cursor-pointer' 
                     onMouseEnter = {e => {
                      e.stopPropagation();
                      setIsShowStaff(el._id)
                     }}
                     onMouseLeave = {e => {
                      e.stopPropagation();
                      setIsShowStaff(null)
                     }}
                >
                  <div
                 className='flex justify-center'>
                  {el.assigned_staff.map((item, index) => (<img key={index} src={item?.avatar}  className={clsx('w-10 h-10 rounded-full ml-[-10px]')}></img>))}
                </div>
                { isShowStaff === el._id &&
                  <div className='flex flex-col gap-1 bg-white text-black rounded-md w-fit px-8 absolute top-11 left-6 z-10'>
                  {el.assigned_staff.map((item, index) => (
                  <div key={index} className='flex justify-center gap-2 w-fit items-center'>
                    <img key={index} src={item?.avatar}  className={clsx('w-8 h-8 rounded-full')}></img>
                    <span className='px-0 font-medium'>{`${item.firstName} ${item.lastName}`}</span>
                  </div>))}
                  </div>
                }
                </div>
              </td>
              <td className='text-center py-2'>
                <span onClick={() => setEditService(el)} 
                className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><MdModeEdit
                size={24}/></span>
                <span onClick={() => handleDeleteService(el._id)} 
                className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><MdDelete size={24}/></span>
                <span onClick={() => setVariant(el)} 
                className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><FaCopy 
                size={22}/></span>
              </td>  
            </tr>
          ))}
        </tbody>
      </table>
      <div className='w-full flex justify-end'>
        <Pagination totalCount={counts} />
      </div>
    </div>
  )
}

export default ManageService