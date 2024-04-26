import { Button, InputForm, Loading, MarkdownEditor, Select } from 'components'
import React, { memo, useCallback, useEffect, useState} from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { validate, getBase64 } from 'ultils/helper'
import {apiModifyStaff} from 'apis/staff'
import { showModal } from 'store/app/appSlice'

const UpdateStaff = ({editStaff, render, setEditStaff}) => {
  console.log(editStaff._id)
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
      console.log(data)
      let finalPayload = {...data}
      if(data.avatar?.length === 0){
        console.log('check_1')
        finalPayload.avatar = preview.avatar
      }
      else{
        console.log('check_2')
        finalPayload.avatar = data.avatar[0]
      }
      console.log(finalPayload)
      const formData = new FormData()

      for(let i of Object.entries(finalPayload)){
        formData.append(i[0],i[1])
      }

      for (var pair of formData.entries())
      {
      console.log(pair[0]+ ', '+ pair[1]); 
      }
    
      // dispatch(showModal({isShowModal: true, modalChildren: <Loading />}))
      const response = await apiModifyStaff(formData, editStaff._id)
      // dispatch(showModal({isShowModal: false, modalChildren: null}))
      console.log(response)
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
    <div className='w-full'>
        <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
          <span>Update Staff</span>
          <span className='text-main text-lg hover:underline cursor-pointer' onClick={()=>setEditStaff(null)}>Cancel</span>
        </h1>
        <div className='p-4 '>
        <form onSubmit={handleSubmit(handleUpdateStaff)}>
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
              placeholder='First Name'
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
              placeholder='Last Name'
            />
          </div>
          <div className='w-full my-6 flex gap-4'>
            <InputForm 
              label = 'Email Address'
              register={register}
              errors={errors}
              id = 'email'
              validate = {{
                required: 'Need fill this field'
              }}
              style='flex-auto'
              placeholder='Email Address'
            />
            <InputForm 
              label = 'Phone Number'
              register={register}
              errors={errors}
              id = 'mobile'
              validate = {{
                required: 'Need fill this field'
              }}
              style='flex-auto'
              placeholder='Phone Number'
            />
          </div>

          <div className='flex flex-col gap-2 mt-8'>
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
  )
}

export default memo(UpdateStaff)