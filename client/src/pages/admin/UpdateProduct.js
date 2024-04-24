import { Button, InputForm, Loading, MarkdownEditor, Select } from 'components'
import React, { memo, useCallback, useEffect, useState} from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { validate, getBase64 } from 'ultils/helper'
import {apiUpdateProduct} from 'apis/product'
import { showModal } from 'store/app/appSlice'

const UpdateProduct = ({editProduct, render, setEditProduct}) => {
  console.log('update product')
  const {categories} = useSelector(state => state.app)
  const dispatch = useDispatch()

  const {register, formState:{errors}, reset, handleSubmit, watch} = useForm()

  const [payload, setPayload] = useState({
    description: ''
  })


  const [preview, setPreview] = useState({
    thumb: null,
    images: []
  })

  useEffect(() => {
    reset({
      title: editProduct?.title || '',
      price: editProduct?.price || '',
      quantity: editProduct?.quantity || '',
      color: editProduct?.color || '',
      category: editProduct?.category || '',
      brand: editProduct?.brand?.toUpperCase() || '',
    })
    setPayload({description: typeof editProduct?.description === 'object' ? editProduct?.description?.join(', ') : editProduct?.description})
    setPreview({
      thumb: editProduct?.thumb || '',
      images: editProduct?.image || []
    })
  }, [editProduct])
  
  const [invalidField, setInvalidField] = useState([])
  
  const changeValue = useCallback((e)=>{
    setPayload(e)
  },[payload])

  const handlePreviewThumb = async(file) => {
    const base64Thumb = await getBase64(file)
    setPreview(prev => ({...prev, thumb: base64Thumb}))
  }

  const handlePreviewImages = async(files) => {
    const imagesPreview = []
    for(let i of files){
      if(i.type !== 'image/png' && i.type !== 'image/jpeg'){
        toast.warning('The file sent is not a JPG or PNG')
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

  const handleUpdateProduct = async(data) => {
    // const invalid = validate(payload, setInvalidField)
    // if(invalid === 0){
      if(data?.category){
        data.category = categories?.find(el => el.title === data.category)?.title
      }
      let finalPayload = {...data,...payload}
      if(data.thumb?.length === 0){
        console.log('check_1')
        finalPayload.thumb = preview.thumb
      }
      else{
        console.log('check_2')
        finalPayload.thumb = data.thumb[0]
      }
      console.log(finalPayload)
      if(data.images?.length === 0){
        console.log('check_3')
        finalPayload.images = preview.images
      }
      else{
        console.log('check_4')
        finalPayload.images = data.images
      }
      const formData = new FormData()

      for(let i of Object.entries(finalPayload)){
        formData.append(i[0],i[1])
      }
      formData.delete('images');
      for (let image of finalPayload.images) formData.append('images', image)

      for (var pair of formData.entries())
      {
      console.log(pair[0]+ ', '+ pair[1]); 
      }
    
      // dispatch(showModal({isShowModal: true, modalChildren: <Loading />}))
      const response = await apiUpdateProduct(formData, editProduct._id)
      // dispatch(showModal({isShowModal: false, modalChildren: null}))
      console.log(response)
      if(response.success){
        toast.success(response.mes)
        render()
        setEditProduct(null)
      }
      else{
        toast.error(response.mes)
      }
    //}
  }

  return (
    <div className='w-full'>
        <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
          <span>Update Product</span>
          <span className='text-main text-lg hover:underline cursor-pointer' onClick={()=>setEditProduct(null)}>Cancel</span>
        </h1>
        <div className='p-4 '>
        <form onSubmit={handleSubmit(handleUpdateProduct)}>
          <InputForm
            label = 'Name product'
            register={register}
            errors={errors}
            id = 'title'
            validate = {{
              required: 'Need fill this field'
            }}
            fullWidth
            placeholder='Name of new product'
          />
          <div className='w-full my-6 flex gap-4'>
            <InputForm 
              label = 'Price'
              register={register}
              errors={errors}
              id = 'price'
              validate = {{
                required: 'Need fill this field'
              }}
              style='flex-auto'
              placeholder='Price of new product'
              type='number'
            />
            <InputForm 
              label = 'Quantity'
              register={register}
              errors={errors}
              id = 'quantity'
              validate = {{
                required: 'Need fill this field'
              }}
              style='flex-auto'
              placeholder='Quantity of new product'
              type='number'
            />
            <InputForm 
              label = 'Color'
              register={register}
              errors={errors}
              id = 'color'
              validate = {{
                required: 'Need fill this field'
              }}
              style='flex-auto'
              placeholder='Color of new product'
            />
          </div>
          <div className='w-full my-6 flex gap-4'>
            <Select
              label = 'Category'
              options = {categories?.map(el =>(
                {code: el.title,
                value: el.title}
              ))}
              register={register}
              id = 'category'
              validate = {{
                required: 'Need fill this field'
              }}
              style='flex-auto'
              errors={errors}
              fullWidth
            />

            <Select 
              label = 'Brand (Optional)'
              options = {categories?.find(el => el.title === watch('category'))?.brand?.map(item => ({code:item.toUpperCase() , value:item}))}
              register={register}
              id = 'brand'
              style='flex-auto'
              errors={errors}
              fullWidth
            />
          </div>
          <div>
          <MarkdownEditor
            name = 'description'
            changeValue={changeValue}
            label = 'Description'
            invalidField={invalidField}
            setInvalidField={setInvalidField}
            value={payload.description}
          />
          </div>
          <div className='flex flex-col gap-2 mt-8'>
            <label className='font-semibold' htmlFor='thumb'>Upload Thumb</label>
            <input 
              {...register('thumb')}
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
              {...register('images')}
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
              Update product
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default memo(UpdateProduct)