// import clsx from 'clsx'
import { Button, InputForm } from 'components'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import avatar from '../../assets/avatarDefault.png'
import { apiUpdateCurrentServiceProvider, apiGetServiceProviderById } from 'apis'
import { getCurrent } from 'store/user/asyncAction'
import { toast } from 'react-toastify'
import { getBase64 } from 'ultils/helper'
import { useSearchParams } from 'react-router-dom'
import withBaseComponent from 'hocs/withBaseComponent'
import Swal from "sweetalert2";

const MyServiceProvider = ({navigate, dispatch}) => {
  const [previewImage, setPreviewImage] = useState('')

  const {register, formState:{errors, isDirty}, handleSubmit, reset, watch} = useForm()
  const {current} = useSelector(state => state.user)
  const [params] = useSearchParams()
  const [currentProvider, setCurrentProvider] = useState({})

  const daysInWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const currentProviderEffectHanlder = async () => {
    if (!current?.provider_id) {
      Swal.fire('Oops!', 'Cannot Specify Current User Provider', 'error');
      return;
    }
    const response = await apiGetServiceProviderById(current.provider_id)
    if (!response?.success) {
      Swal.fire('Oops!', response.mes, 'error');
      return;
    }

    setCurrentProvider(response.payload);
    reset({
      bussinessName: response.payload?.bussinessName,
      province: response.payload?.province,
      district: response.payload?.district,
      ward: response.payload?.district,
      phone: response.payload?.phone,
      address: response.payload?.address,
    })
    // setPreviewImage(current?.avatar)

  }

  const handleUpdateInfo = async(data)=>{
    if (!current?.provider_id) {
      Swal.fire('Oops!', 'Cannot Specify Current User Provider', 'error');
      return;
    }
    const formData = new FormData()
    if(data && data.avatar && data.avatar.length > 0){
      formData.append('avatar', data.avatar[0])
    }
    delete data.avatar


    for(let i of Object.entries(data)){
      formData.append(i[0],i[1])
    }


    const response = await apiUpdateCurrentServiceProvider(current.provider_id, data)
    if(response.success){
      dispatch(getCurrent())
      toast.success(response.mes)
    }
    else{
      toast.error(response.mes)
    }
  }
  useEffect(() => {
    currentProviderEffectHanlder();
  }, [current])

  const handlePreviewAvatar = async(file) => {
    const base64Thumb = await getBase64(file)
    setPreviewImage(prev => (base64Thumb))
  }

  useEffect(() => {
    if(watch('avatar') instanceof FileList && watch('avatar').length > 0) handlePreviewAvatar(watch('avatar')[0])
  }, [watch('avatar')])
  
  return (
    <div className='w-full relative px-4'>
      <header className='text-3xl font-semibold py-4 border-b border-b-gray-200'>My Service Provider</header>
      <form onSubmit={handleSubmit(handleUpdateInfo)} className='w-3/5 mx-auto py-8 flex flex-col gap-4'>
        <span className='font-medium'>Uploaded Images: {currentProvider.images?.length}</span>
        <div className='flex gap-2'>
          {currentProvider.images?.length > 0 &&
          currentProvider.images.map(image => {
            return <img src={image} alt='avatar' className='cursor-pointer w-[200px] h-[200px] ml-8 object-cover border-gray-500 border-4'></img>
          })}
          
          {/* <input type='file' id='avatar' {...register('avatar')} hidden></input> */}
        </div>
        <InputForm 
          label = 'Bussiness Name'
          register={register}
          errors={errors}
          id = 'bussinessName'
          validate = {{
            required: 'Need fill this field'
          }}
        />
        <InputForm 
          label = 'Province'
          register={register}
          errors={errors}
          id = 'province'
          validate = {{
            required: 'Need fill this field'
          }}
          disabled={true}
        />
        <InputForm 
          label = 'District'
          register={register}
          errors={errors}
          id = 'district'
          disabled={true}
        />
        <InputForm 
          label = 'Ward'
          register={register}
          errors={errors}
          id = 'ward'
          disabled={true}
        />
        <InputForm 
          label = 'Phone'
          register={register}
          errors={errors}
          id = 'phone'
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
        {/* <div className='flex items-center gap-2'>
          {
            daysInWeek.map(day => {
                return <div className="flex items-center gap-3">
                    <div>{ day }</div>
                    <InputField 
                        value={timeOpenPayload[`start${day}`]}
                        setValue={setTimeOpenPayload}
                        nameKey={`start${day}`}
                        invalidField={invalidField}
                        setInvalidField={setInvalidField}
                        type="time"
                    />
                    <InputField 
                        value={timeOpenPayload[`end${day}`]}
                        setValue={setTimeOpenPayload}
                        nameKey={`end${day}`}
                        invalidField={invalidField}
                        setInvalidField={setInvalidField}
                        type="time"
                    />
                </div>
            })
          }
        </div> */}

        <div className='flex items-center gap-2'>
          <span className='font-medium'>
            Created At
          </span>
          <span className='font-medium'>
            {moment(currentProvider?.createdAt).fromNow()}                   
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

export default withBaseComponent(MyServiceProvider)