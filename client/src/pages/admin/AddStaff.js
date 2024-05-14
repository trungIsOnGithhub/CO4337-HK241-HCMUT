import React, { useCallback, useState, useEffect} from 'react'
import {InputForm, Select, Button, MarkdownEditor, Loading} from 'components'
import { useForm } from 'react-hook-form'
import {useSelector, useDispatch} from 'react-redux'
import { validate, getBase64 } from 'ultils/helper'
import { toast } from 'react-toastify'
import icons from 'ultils/icon'
import { apiAddStaff } from 'apis'
import { showModal } from 'store/app/appSlice'
import { FaUserGear } from "react-icons/fa6";
import { getCurrent } from 'store/user/asyncAction'

const AddStaff = () => {
  const {categories} = useSelector(state => state.app)

  const dispatch = useDispatch()
  const {register, formState:{errors}, reset, handleSubmit, watch} = useForm()


  const [preview, setPreview] = useState({
    avatar: null
  })

  const {current} = useSelector(state => state.user)
  useEffect(() => {
    dispatch(getCurrent());
  }, []);

//   const changeValue = useCallback((e)=>{
//     setPayload(e)
//   },[payload])



  const handlePreviewAvatar = async(file) => {
    const base64Avatar = await getBase64(file)
    setPreview({avatar: base64Avatar})
  }


  useEffect(() => {
    handlePreviewAvatar(watch('avatar')[0])
  }, [watch('avatar')])



  const handleAddStaff = async(data) => {
    data.provider_id = current.provider_id
    const formData = new FormData()
    for(let i of Object.entries(data)){
    formData.append(i[0],i[1])
    }
    if (!current?.provider_id) {
      toast.error('No Provider Specifed With Current User!!');
      return;
    }
    if(data.avatar) formData.append('avatar', data.avatar[0])
    // dispatch(showModal({isShowModal: true, modalChildren: <Loading />}))
    const response = await apiAddStaff(formData)
    // dispatch(showModal({isShowModal: false, modalChildren: null}))
    if(response.success){
    toast.success(response.mes)
    reset()
    }
  }


  return (
    <div className='w-full'>
      <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
        <span>Add Staff</span>
      </h1>
      <div className='p-4 '>
        <form onSubmit={handleSubmit(handleAddStaff)}>
          <div className='w-full my-6 flex gap-4'>
            <InputForm 
              label = 'First Name'
              register={register}
              errors={errors}
              id = 'firstName'
              validate = {{
                required: 'Need fill this field'
              }}
              style='flex-auto'
              placeholder='First Name ...'
            />
            <InputForm 
              label = 'Last Name'
              register={register}
              errors={errors}
              id = 'lastName'
              validate = {{
                required: 'Need fill this field'
              }}
              style='flex-auto'
              placeholder='Last Name ...'
            />
          </div>
          <div className='w-full my-6 flex gap-4'>
            <InputForm 
              label = 'Email Address'
              register={register}
              errors={errors}
              id = 'email'
              validate={{
                    required: 'Require fill', 
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "invalid email address"
                    }
                }} 
              style='flex-auto'
              placeholder='Email Address ...'
            />
            <InputForm 
              label = 'Phone Number'
              register={register}
              errors={errors}
              id = 'mobile'
              validate={{
                    required: 'Require fill', 
                    pattern: {
                      value: /^((\+)33|0)[1-9](\d{2}){4}$/,
                      message: "invalid phone number"
                    }
                  }} 
              style='flex-auto'
              placeholder='Phone Number ...'
            />
          </div>
          
          <div className='flex flex-col gap-2 mt-8'>
            <label className='font-semibold' htmlFor='avatar'>Upload Avatar</label>
            <input 
              {...register('avatar', {required: 'Need upload avatar'})}
              type='file' 
              id='avatar'
            />
            {errors['avatar'] && <small className='text-xs text-red-500'>{errors['avatar']?.message}</small>}
          </div>
          
          {preview.avatar 
            && 
          <div className='my-4'>
            <img src={preview.avatar} alt='avatar' className='w-[200px] object-contain'></img>
          </div>
          }
          <div className='mt-8'>
            <Button type='submit'>
              Add a new staff
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddStaff