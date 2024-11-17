import { Button, InputForm, Loading, MarkdownEditor, Select, InputFormm } from 'components'
import React, { memo, useCallback, useEffect, useState} from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { validate, getBase64 } from 'ultils/helper'
import {apiModifyStaff} from 'apis/staff'
import bgImage from '../../assets/clouds.svg';
import { showModal } from 'store/app/appSlice';
import { FaArrowLeft } from 'react-icons/fa'

const UpdateStaff = ({editStaff, render, setEditStaff}) => {
  const dispatch = useDispatch()

  const {register, formState:{errors}, reset, handleSubmit, watch} = useForm()

  const [preview, setPreview] = useState({
    avatar: null,
  })

  useEffect(() => {
    reset({
      email: editStaff?.email || '',
      mobile: editStaff?.mobile || '',
      firstName: editStaff?.firstName || '',
      lastName: editStaff?.lastName || '',
    })
    setPreview({
      avatar: editStaff?.avatar || '',
    })
  }, [editStaff])
  
  const [invalidField, setInvalidField] = useState([])
  
  const handlePreviewAvatar = async(file) => {
    const base64Avatar = await getBase64(file)
    setPreview({avatar: base64Avatar})
  }


  useEffect(() => {
    if(watch('avatar') instanceof FileList && watch('avatar').length > 0) handlePreviewAvatar(watch('avatar')[0])
  }, [watch('avatar')])

  const handleUpdateStaff = async(data) => {
    // const invalid = validate(payload, setInvalidField)
    // if(invalid === 0){
      let finalPayload = {...data}
      if(data.avatar?.length === 0){
        finalPayload.avatar = preview.avatar
      }
      else{
        finalPayload.avatar = data.avatar[0]
      }
      const formData = new FormData()

      for(let i of Object.entries(finalPayload)){
        formData.append(i[0],i[1])
      }

      // for (var pair of formData.entries())
      // {
      // }
    
      // dispatch(showModal({isShowModal: true, modalChildren: <Loading />}))
      const response = await apiModifyStaff(formData, editStaff._id)
      // dispatch(showModal({isShowModal: false, modalChildren: null}))
      if(response.success){
        toast.success(response.mes)
        render()
        setEditStaff(null)
      }
      else{
        toast.error(response.mes)
      }
    //}
  }

  return (
    <div className='w-full h-full relative'>
    <div className='inset-0 absolute z-0'>
      <img src={bgImage} className='w-full h-full object-cover'/>
    </div>
    <div className='relative z-10 w-full'>
      <div className='w-full h-fit flex justify-start gap-4 p-4'>
      <div onClick={()=>setEditStaff(null)} className='text-[#00143c] cursor-pointer mr-4 ml-1'><FaArrowLeft size={28}/></div>
        <span className='text-[#00143c] text-3xl h-fit font-semibold'>Update Staff</span>
        {/* <span className='text-lg hover:underline cursor-pointer bg-red-500 rounded-md p-2' onClick={}>Back to Manage</span> */}
      </div>
        <div className='p-4 '>
        <form onSubmit={handleSubmit(handleUpdateStaff)}>
          <div className='w-full my-6 flex gap-4'>
          <InputFormm
            label='First Name'
            register={register}
            errors={errors}
            id='firstName'
            validate={{
                required: 'Need fill this field'
            }}
            style='flex-auto'
            placeholder='First Name ...'
            styleLabel={'text-[#00143c] font-medium mb-1'}
            styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none rounded-md border-[#dee1e6]'}
        />

        <InputFormm
            label='Last Name'
            register={register}
            errors={errors}
            id='lastName'
            validate={{
                required: 'Need fill this field'
            }}
            style='flex-auto'
            placeholder='First Name ...'
            styleLabel={'text-[#00143c] font-medium mb-1'}
            styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none rounded-md border-[#dee1e6]'}
        />
          </div>
          <div className='w-full my-6 flex gap-4'>
          <InputFormm
            label='Email Address'
            register={register}
            errors={errors}
            id='email'
            validate={{
                required: 'Require fill', 
                pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "invalid email address"
                }
            }} 
            style='flex-auto'
            placeholder='Email Address ...'
            styleLabel={'text-[#00143c] font-medium mb-1'}
            styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none rounded-md border-[#dee1e6]'}
        />
        <InputFormm
            label='Phone Number'
            register={register}
            errors={errors}
            id='mobile'
            validate={{
                required: 'Require fill', 
                pattern: {
                    value: /^((\+)33|0)[1-9](\d{2}){4}$/,
                    message: "invalid phone number"
                }
            }} 
            style='flex-auto'
            placeholder='Phone Number ...'
            styleLabel={'text-[#00143c] font-medium mb-1'}
            styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none rounded-md border-[#dee1e6]'}
        />
          </div>

          <div className='flex flex-col gap-2 mt-8 text-gray-600'>
            <label className='font-semibold' htmlFor='avatar'>Upload Avatar</label>
            <input 
              {...register('avatar')}
              type='file' 
              id='avatar'
            />
            {errors['avatar'] && <small className='text-xs text-red-500'>{errors['avatar']?.message}</small>}
          </div>
          
          {preview?.avatar 
            && 
          <div className='my-4'>
            <img src={preview?.avatar} alt='avatar' className='w-[200px] object-contain'></img>
          </div>
          }

          <div className='mt-8'>
            <Button type='submit'>
              Update Staff
            </Button>
          </div>
        </form>
      </div>
    </div>
    </div>
  )
}

export default memo(UpdateStaff)