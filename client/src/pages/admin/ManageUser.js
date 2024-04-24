import React, { useEffect, useState, useCallback} from 'react'
import { apiUsers, apiModifyUser, apiDeleteUser} from 'apis/user'
import { roles, blockStatus } from 'ultils/constant'
import moment from 'moment'
import { InputField, Pagination, InputForm, Select, Button } from 'components'
import useDebounce from 'hook/useDebounce'
import { useSearchParams} from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import clsx from 'clsx'

const ManageUser = () => {
  const {handleSubmit, register, formState:{errors}, reset } = useForm({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    phone: '',
    isBlocked: ''
  })

  const [user, setUser] = useState(null)
  const [query, setQuery] = useState({
    q: ''
  })

  const [update, setUpdate] = useState(false)
  const [editEl, setEditEl] = useState(null)
  const [params] = useSearchParams()
  const fetchUsers = async(params) => {
    const response = await apiUsers({...params, limit:process.env.REACT_APP_LIMIT})
    if(response.success){
      setUser(response)
    }
  }
  
  const render = useCallback(() => {
    setUpdate(!update)}
  ,[update])

  const queriesDebounce = useDebounce(query.q,800)

  useEffect(() => {
    const queries = Object.fromEntries([...params]) 
    if(queriesDebounce) queries.q = queriesDebounce
    fetchUsers(queries)
  }, [queriesDebounce, params, update])

  const handleUpdate = async (data) => { 
    const response = await apiModifyUser(data, editEl._id)
    if(response.success) {
      setEditEl(null)
      render()
      toast.success(response.mes)
    }
    else{
      toast.error(response.mes)
    }
   }

  const handleDelete = (uid) => {
    Swal.fire({
      title: 'Delete this user',
      text: 'Are you ready to delete this user?',
      showCancelButton: true
    }).then(async(rs)=>{
      if(rs.isConfirmed){
        const response = await apiDeleteUser(uid)
        if(response.success) {
          render()
          toast.success(response.mes)
        }
        else{
          toast.error(response.mes)
        }
      }
    })
  }
  
  // useEffect(() => {
  //   if(editEl){
  //    reset({
  //     role: editEl.role,
  //     status: editEl.isBlocked,

  //    }) 
  //   }
  // }, [editEl])
  
  return (
    <div className={clsx('w-full', editEl&&'pl-[8rem]')}>
      <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
        <span>Manage Users</span>
      </h1>
      <div className='w-full p-4'>
        <div className='flex justify-end py-4'>
          <InputField 
            nameKey={'q'}
            value={query?.q}
            setValue = {setQuery}
            style = {'w400'}
            placeholder= 'Search user name or email address'
            isHideLabel={true}
          />
        </div>

        <form onSubmit={handleSubmit(handleUpdate)}>
        {editEl&&
          <Button type='submit'>
          Update
          </Button>
        }
        <table className='table-auto mb-6 text-left w-full'>
          <thead className='font-bold bg-blue-500 text-[13px] text-white'>
           <tr className='border border-gray-500'>
            <th className='px-2 py-2'>#</th>
            <th className='px-2 py-2'>Email Address</th>
            <th className='px-2 py-2'>First Name</th>
            <th className='px-2 py-2'>Last Name</th>
            <th className='px-2 py-2'>Role</th>
            <th className='px-2 py-2'>Phone</th>
            <th className='px-2 py-2'>Status</th>
            <th className='px-2 py-2'>Created At</th>
            <th className='px-2 py-2'>Actions</th>
           </tr>
          </thead>
          <tbody>
            {user?.users?.map((el,idx)=>(
              <tr key={el._id} className='border border-gray-500'>
                <td className='py-2 px-4'>{idx+1}</td>
                <td className='py-2 px-4'>{
                editEl?._id === el._id ? 
                <InputForm 
                  register={register} 
                  fullWidth
                  errors={errors} 
                  defaultValue={editEl?.email}
                  id={'email'} 
                  validate={{
                    required: 'Require fill', 
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "invalid email address"
                    }
                  }} 
                /> 
                :
                el.email}</td>
                <td className='py-2 px-4'>
                {
                editEl?._id === el._id ? 
                <InputForm 
                  register={register} 
                  fullWidth
                  errors={errors} 
                  defaultValue={editEl?.firstName}
                  id={'firstName'} 
                  validate={{required: 'Require fill'}} 
                /> 
                :
                el.firstName}
                </td>
                <td>
                  {
                  editEl?._id === el._id ? 
                  <InputForm 
                    register={register} 
                    fullWidth
                    errors={errors} 
                    defaultValue={editEl?.lastName}
                    id={'lastName'} 
                    validate={{required: 'Require fill'}} 
                  /> 
                  :
                  el.lastName}
                </td>
                <td className='py-2 px-4'>
                {
                editEl?._id === el._id ? 
                <Select 
                  register={register} 
                  fullWidth
                  errors={errors} 
                  defaultValue={el.role}      
                  id={'role'} 
                  validate={{required: 'Require fill'}} 
                  options={roles}
                /> 
                : 
                roles.find(role => +role.code === +el.role)?.value}
                </td>
                <td className='py-2 px-4'>
                {
                editEl?._id === el._id ? 
                <InputForm 
                  register={register} 
                  fullWidth
                  errors={errors} 
                  defaultValue={editEl?.mobile}
                  id={'mobile'} 
                  validate={{
                    required: 'Require fill', 
                    pattern: {
                      value: /^[62|0]+\d{9}/gi,
                      message: "invalid phone number"
                    }
                  }} 
                /> 
                : 
                el.mobile}</td>
                <td className='py-2 px-4'>{
                editEl?._id === el._id ? 
                <Select 
                  register={register} 
                  fullWidth
                  errors={errors} 
                  defaultValue={el.isBlocked}      
                  id={'isBlocked'} 
                  validate={{required: 'Require fill'}} 
                  options={blockStatus}
                /> 
                : 
                el.isBlocked? 'Block': 'Active'}</td>
                <td className='py-2 px-4'>{moment(el.createdAt).format('DD/MM/YYYY')}</td>
                <td className='py-2 px-4 '>
                  {editEl?._id === el._id ? <span onClick={()=>{setEditEl(null)}} className='px-2 text-orange-400 hover:underline cursor-pointer'>Back</span>
                          :
                          <span onClick={()=>{setEditEl(el)}} className='px-2 text-orange-400 hover:underline cursor-pointer'>Edit</span>}
                  <span onClick={()=>handleDelete(el._id)} className='px-2 text-orange-400 hover:underline cursor-pointer'>Delete</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </form>  
        
        <div className='w-full text-right'>
          <Pagination
            totalCount={user?.counts}
          />
        </div>
      </div>
    </div>
  )
}

export default ManageUser