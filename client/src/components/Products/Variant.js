import { apiAddVariant } from 'apis'
import Button from 'components/Buttons/Button'
import Loading from 'components/Common/Loading'
import InputForm from 'components/Input/InputForm'
import React, { memo, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { showModal } from 'store/app/appSlice'
import Swal from 'sweetalert2'
import { getBase64 } from 'ultils/helper'

const Variant = ({variant, setVariant, render}) => {
  const dispatch = useDispatch()
  const {register,formState:{errors}, reset, handleSubmit, watch} = useForm()
  const [preview, setPreview] = useState({
    thumb: '',
    images: []
  })

  useEffect(() => {
    reset({
      title: variant?.title,
      price: variant?.price,
      color: variant?.color,
    })
  }, [variant])


  const handleAddVariant = async(data) => {
    console.log(data)
    if(data?.color === variant?.color){
      Swal.fire('Oops!', 'Color not changed', 'info')
    }
    else{
      const formData = new FormData()
      for(let i of Object.entries(data)){
        formData.append(i[0],i[1])
      }
      if(data.thumb) formData.append('thumb', data.thumb[0])
      if(data.images) {
        for (let image of data.images) formData.append('images', image)
      }
      // dispatch(showModal({isShowModal: true, modalChildren: <Loading />}))
      const response = await apiAddVariant(formData, variant._id)
      // dispatch(showModal({isShowModal: false, modalChildren: null}))
      if(response.success){
        console.log('successfully')
        toast.success(response.mes)
        // reset()
        // setPreview({
        //   thumb: '',
        //   images: []
        // })
      }
      else{
        console.log("failed")
        // toast.error(response.mes)
      }
    }
  }
  const handlePreviewThumb = async(file) => {
    const base64Thumb = await getBase64(file)
    setPreview(prev => ({...prev, thumb: base64Thumb}))
  }

  const handlePreviewImages = async(files) => {
    const imagesPreview = []
    for(let i of files){
      if(i.type !== 'image/png' && i.type !== 'image/jpeg'){
       // toast.warning('The file sent is not a JPG or PNG')
        return
      }
      const base64 = await getBase64(i)
      imagesPreview.push(base64)
    }
    if(imagesPreview.length > 0){
      setPreview(prev => ({...prev, images: imagesPreview}))
    }
  }

  useEffect(() => {
    if(watch('thumb') instanceof FileList && watch('thumb').length > 0) handlePreviewThumb(watch('thumb')[0])
  }, [watch('thumb')])

  useEffect(() => {
    if(watch('images') instanceof FileList && watch('images').length > 0) handlePreviewImages(watch('images'))
  }, [watch('images')])

  return (
    <div className='w-full'>
      <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
          <span>Customize Variant</span>
          <span className='text-main text-lg hover:underline cursor-pointer' onClick={()=>{setVariant(null)}}>Back</span>
      </h1>
      <div className='p-4 w-full'>
        <form onSubmit={handleSubmit(handleAddVariant)} className='p-4 w-full flex flex-col gap-4'>
          <div className='flex items-center w-full gap-4'>
            <InputForm
              label = 'Original Name'
              register={register}
              errors={errors}
              id = 'title'
              fullWidth
              style='flex-auto'
              validate = {{
                required: 'Need fill this field'
              }}
              placeholder='Title of variant'
            />
          </div>
          <div className='flex items-center w-full gap-4'>
            <InputForm
              label = 'Price'
              register={register}
              errors={errors}
              id = 'price'
              validate = {{
                required: 'Need fill this field'
              }}
              fullWidth
              placeholder='Price of variant'
              type='number'
              style='flex-auto'
            />
            <InputForm
            label = 'Color'
            register={register}
            errors={errors}
            id = 'color'
            validate = {{
              required: 'Need fill this field'
            }}
            fullWidth
            placeholder='Color of variant'
            style='flex-auto'
            />
          </div>
          <div className='flex flex-col gap-2 mt-8'>
            <label className='font-semibold' htmlFor='thumb'>Upload Thumb</label>
            <input 
              {...register('thumb', {required: 'Need upload thumb'})}
              type='file' 
              id='thumb'
            />
            {errors['thumb'] && <small className='text-xs text-red-500'>{errors['thumb']?.message}</small>}
          </div>
          
          {preview.thumb 
            && 
          <div className='my-4'>
            <img src={preview.thumb} alt='thumbnail' className='w-[200px] object-contain'></img>
          </div>
          }

          <div className='flex flex-col gap-2 mt-8'>
            <label className='font-semibold' htmlFor='product'>Upload image of product</label>
            <input 
              {...register('images', {required: 'Need upload image of product'})}
              type='file' 
              id='product' 
              multiple
            />
            {errors['images'] && <small className='text-xs text-red-500'>{errors['product']?.message}</small>}
          </div>

          {preview.images?.length > 0 
            && 
          <div className='my-4 flex w-full gap-2 flex-wrap'>
            {
              preview.images?.map((el,index) => (
                <div key={index} className='w-fit relative'>
                  <img src={el} alt='image of product' className='w-[200px] object-contain'></img>
                </div>
              ))
            }
          </div>
          }
          <div className='mt-8'>
            <Button type='submit'>
              Add variant
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default memo(Variant)