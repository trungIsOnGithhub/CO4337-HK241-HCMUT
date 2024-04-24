import clsx from 'clsx'
import { Button, InputForm } from 'components'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import avatar from '../../assets/avatarDefault.png'
import { apiUpdateCurrent } from 'apis'
import { getCurrent } from 'store/user/asyncAction'
import { toast } from 'react-toastify'
import { getBase64 } from 'ultils/helper'
import { useSearchParams } from 'react-router-dom'
import withBaseComponent from 'hocs/withBaseComponent'

const Personal = ({navigate, dispatch}) => {
  const [previewImage, setPreviewImage] = useState('')

  const {register, formState:{errors, isDirty}, handleSubmit, reset, watch} = useForm()
  const {current} = useSelector(state => state.user)
  const [params] = useSearchParams()
  
  const handleUpdateInfo = async(data)=>{
    const formData = new FormData()
    if(data.avatar.length > 0){
      formData.append('avatar', data.avatar[0])
    }
    delete data.avatar

    for(let i of Object.entries(data)){
      formData.append(i[0],i[1])
    }

    const response = await apiUpdateCurrent(formData)
    if(response.success){
      dispatch(getCurrent())
      toast.success(response.mes)
      if(params?.get('redirect')){
        navigate(params.get('redirect'))
      }
    }
    else{
      toast.error(response.mes)
    }
  }
  useEffect(() => {
    reset({
      firstName: current?.firstName,
      lastName: current?.lastName,
      email: current?.email,
      mobile: current?.mobile,
      avatar: current?.avatar,
      address: current?.address
    })
    setPreviewImage(current?.avatar)
  }, [current])

  const handlePreviewAvatar = async(file) => {
    const base64Thumb = await getBase64(file)
    setPreviewImage(prev => (base64Thumb))
    console.log(previewImage)
  }


  useEffect(() => {
    if(watch('avatar') instanceof FileList && watch('avatar').length > 0) handlePreviewAvatar(watch('avatar')[0])
  }, [watch('avatar')])
  
  console.log(isDirty)
  return (
    <div className='w-full relative px-4'>
      <header className='text-3xl font-semibold py-4 border-b border-b-gray-200'>Personal</header>
      <form onSubmit={handleSubmit(handleUpdateInfo)} className='w-3/5 mx-auto py-8 flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <span className='font-medium'>Avatar:</span>
          <label htmlFor='avatar'>
          <img src={previewImage||avatar} alt='avatar' className='cursor-pointer w-[300px] h-[300px] ml-8 object-cover border-gray-500 border-4'></img>
          </label>
          <input type='file' id='avatar' {...register('avatar')} hidden></input>
        </div>
        <InputForm 
          label = 'First Name'
          register={register}
          errors={errors}
          id = 'firstName'
          validate = {{
            required: 'Need fill this field'
          }}
        />
        <InputForm 
          label = 'Last Name'
          register={register}
          errors={errors}
          id = 'lastName'
          validate = {{
            required: 'Need fill this field'
          }}
        />
        <InputForm 
          label = 'Email Address'
          register={register}
          errors={errors}
          id = 'email'
          validate = {{
            required: 'Need fill this field',
            pattern:{
              value: /^\S+@\S+\.\S+$/,
              message: 'Email address invalid'
            }
          }}
        />
        <InputForm 
          label = 'Phone'
          register={register}
          errors={errors}
          id = 'mobile'
          validate = {{
            required: 'Need fill this field',
            pattern:
            {
              value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/gm,
              message: 'Phone invalid'
            }
          }}
        />

        <InputForm 
          label = 'Address'
          register={register}
          errors={errors}
          id = 'address'
          validate = {{
            required: 'Need fill this field',
          }}
        />
        <div className='flex items-center gap-2'>
          <span className='font-medium'>
            Account Status:
          </span>
          <span className={clsx(current?.isBlocked ? 'text-red-800 font-bold' : 'text-green-800 font-bold')}>
            {current?.isBlocked ? 'Blocked' : 'Active'}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <span className='font-medium'>
            Role:
          </span>
          <span className='font-medium'>
            {+current?.role === 1411 ? 'Admin' : 'User'}                   
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <span className='font-medium'>
            Created At
          </span>
          <span className='font-medium'>
            {moment(current?.createdAt).fromNow()}                   
          </span>
        </div>

        {isDirty && 
        <div className='w-full flex justify-end'>
        <Button type='submit'>Update Information</Button>
        </div>
        }
      </form>
    </div>
  )
}

export default withBaseComponent(Personal)