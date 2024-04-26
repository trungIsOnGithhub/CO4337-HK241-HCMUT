import React, {useCallback, useEffect, useState} from 'react'
import { InputForm, Pagination, Variant} from 'components'
import { useForm } from 'react-hook-form'
import {apiGetAllStaffs, apiModifyStaff} from 'apis/staff'
import moment from 'moment'
import { useSearchParams, createSearchParams, useNavigate, useLocation} from 'react-router-dom'
import useDebounce from 'hook/useDebounce'
import UpdateStaff from './UpdateStaff'
import icons from 'ultils/icon'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'


const ManageProduct = () => {
  const {MdModeEdit, MdDelete, FaCopy} = icons
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const {register,formState:{errors}, handleSubmit, watch} = useForm()
  const [staffs, setStaffs] = useState(null)
  const [counts, setCounts] = useState(0)
  const [editStaff, setEditStaff] = useState(null)
  const [update, setUpdate] = useState(false)

  // const handleDeleteProduct = async(pid) => {
  //   Swal.fire({
  //     title: 'Are you sure',
  //     text: 'Are you sure you want to delete this product?',
  //     icon: 'warning',
  //     showCancelButton: true
  //   }).then(async(rs)=>{
  //     if(rs.isConfirmed){
  //       const response = await apiDeleteProduct(pid)
  //       if(response.success){
  //         console.log('sure')
  //        toast.success(response.mes)
  //       }
  //       else{
  //         console.log('not sure')
  //        toast.error(response.mes)
  //       }
  //       render()
  //     }
  //   })
    
  // }

  const render = useCallback(() => { 
    setUpdate(!update)
   })

  const handleSearchProduct = (data) => {
    console.log(data)
  }

  const fetchStaff = async(params) => {
    const response = await apiGetAllStaffs({...params, limit: process.env.REACT_APP_LIMIT})
    if(response.success){
      setStaffs(response.staffs)
      setCounts(response.counts)
    }
  }

  const queryDebounce = useDebounce(watch('q'),800)
  
  useEffect(() => {
    const searchParams = Object.fromEntries([...params]) 
    fetchStaff(searchParams)
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
  
  
  console.log(params.get('page'))
  return (
    <div className='w-full flex flex-col gap-4 relative'>
      {editStaff &&  
      <div className='absolute inset-0 bg-zinc-900 h-[200%] z-50 flex-auto'>
        <UpdateStaff editStaff={editStaff} render={render} setEditStaff={setEditStaff}/>
      </div>}
      <div className='h-[69px] w-full'>
      </div>
      <div className='p-4 border-b w-full flex justify-between items-center fixed top-0 bg-black'>
        <h1 className='text-3xl font-bold tracking-tight'>Manage Staffs</h1>
      </div>

      <div className='flex w-full justify-end items-center px-4 '>
        <form className='w-[45%]' onSubmit={handleSubmit(handleSearchProduct)}>
          <InputForm
            id='q'
            register={register}
            errors={errors}
            fullWidth
            placeholder= 'Search staffs by name or email address ...'
          >
            
          </InputForm>
        </form>
      </div>
      <table className='table-auto p-0'>
        <thead className='font-bold bg-blue-500 text-[13px] text-white'>
          <tr className='border border-gray-500'>
            <th className='text-center py-2'>#</th>
            <th className='text-center py-2'>Avatar</th>            
            <th className='text-center py-2'>Email Address</th>
            <th className='text-center py-2'>First Name</th>
            <th className='text-center py-2'>Last Name</th>
            <th className='text-center py-2'>Phone</th>
            <th className='text-center py-2'>Action</th>
          </tr>
        </thead>
        <tbody>
          {staffs?.map((el,idx)=>(
            <tr key={el._id} className='border border-gray-500'>
              <td className='text-center py-2'>{((+params.get('page')||1)-1)*+process.env.REACT_APP_LIMIT + idx + 1}</td>
              <td className='text-center py-2'><img src={el.avatar} alt='thumb' className='w-12 h-12 object-cover'></img></td>
              <td className='text-center py-2'>{el.email}</td>
              <td className='text-center py-2'>{el.firstName}</td>
              <td className='text-center py-2'>{el.lastName}</td>
              <td className='text-center py-2'>{el.mobile}</td>
              <td className='text-center py-2'>
                <span onClick={() => setEditStaff(el)} 
                className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><MdModeEdit
                size={24}/></span>
                {/* <span onClick={() => handleDeleteProduct(el._id)} 
                className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><MdDelete size={24}/></span>
                <span onClick={() => setVariant(el)} 
                className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><FaCopy 
                size={22}/></span> */}
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

export default ManageProduct