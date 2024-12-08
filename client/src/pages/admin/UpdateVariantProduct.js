import React, { useEffect, useState } from 'react'
import bgImage from '../../assets/clouds.svg'
import { useParams } from 'react-router-dom'
import { apiGetOneProduct, apiUpdateVariant } from 'apis'
import { IoColorPaletteOutline } from 'react-icons/io5'
import { FaArrowLeft, FaPlus, FaSpinner } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { Button, InputFormm } from 'components'
import { toast } from 'react-toastify'
import { getBase64 } from 'ultils/helper'

const UpdateVariantProduct = () => {
    const {product_id, variant_id} = useParams()
    const [productData, setProductData] = useState(null)
    const [variantData, setVariantData] = useState(null)
    const {register, formState:{errors}, reset, handleSubmit, watch} = useForm()
    const [colorCode, setColorCode] = useState(null)
    const [preview, setPreview] = useState({
      thumb: null,
      images: []
    })
    const [originalPreview, setOriginalPreview] = useState({
      thumb: null,
      images: []
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }, []);

    useEffect(() => {
        const fetchProduct = async() => {
            const response = await apiGetOneProduct(product_id)
            if(response.success) {
                setProductData(response.product)
            }
        }
        fetchProduct()
    }, [product_id])

    useEffect(() => {
        if(productData) {
            const variant = productData.variants.find(v => v._id === variant_id)
            setVariantData(variant)
        }
        
    }, [productData]);

    useEffect(() => {
      reset({
        title: variantData?.title || '',
        quantity: variantData?.quantity || '',
        color: variantData?.color || '',
      })
      setPreview({
        thumb: variantData?.thumb || '',
        images: variantData?.image || []
      })
      setOriginalPreview({
        thumb: variantData?.thumb || '',
        images: variantData?.image || []
      })
      setColorCode(variantData?.colorCode || '#000000')
    }, [variantData])

    
    const handleUpdateVariant = async(data) => {
      const finalPayload = {...data, colorCode}
      if(data.thumb?.length === 0){
        // removed log
        finalPayload.thumb = originalPreview.thumb
      }
      else{
        // removed log
        finalPayload.thumb = data.thumb[0]
      }

      if(data.images?.length === 0){
        finalPayload.images = originalPreview.images
      }
      else{
        finalPayload.images = data.images
      }
      const formData = new FormData()
      for(let i of Object.entries(finalPayload)){
        formData.append(i[0],i[1])
      }

      formData.delete('images');
      for (let image of finalPayload.images) formData.append('images', image)

      for (let [key, value] of formData.entries()) {
        // removed log
      }
      setIsLoading(true)
      const response = await apiUpdateVariant(formData, productData?._id, variantData?._id)
      setIsLoading(false)
      if(response.success){
        toast.success('Update variant successfully')
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      }
      else{
        toast.error('Update variant failed')
      }

    }

    const handleBackUpdateProduct = () => {
      window.history.back()
    }
    const handleChangeColor = (e) => {
      setColorCode(e.target.value);
    }

    const handlePreviewThumb = async(file) => {
      // removed log
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
      else {
        setPreview(prev => ({...prev, thumb: originalPreview.thumb}))
      }
    }, [watch('thumb')])
  
    useEffect(() => {
      if(watch('images') instanceof FileList && watch('images').length > 0) handlePreviewImages(watch('images'))
      else{
        setPreview(prev => ({...prev, images: originalPreview.images}))
      }
    }, [watch('images')])

  return (
    <div className='w-full h-full relative'>
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className='relative z-10 w-full'>
        <div className='w-full h-fit flex justify-start gap-1 p-4 items-end'>
            <div onClick={handleBackUpdateProduct} className='text-[#00143c] cursor-pointer'><FaArrowLeft size={28}/></div>
            <span className='text-[#00143c] text-3xl h-fit font-semibold'>Update Variant</span>
            <span className='text-[#00143c] text-xl ml-4 font-medium'>{`(Product: ${productData?.title})`}</span>
        </div>
        <div className='w-[95%] h-fit shadow-2xl rounded-md bg-white ml-4 mb-[50px] px-4 py-2 flex flex-col gap-4'>
          <form onSubmit={handleSubmit(handleUpdateVariant)}>
            <div className='w-full my-6 flex gap-4'>
              <InputFormm
                label = 'Variant Name'
                register={register}
                errors={errors}
                id = 'title'
                validate = {{
                  required: 'Need fill this field'
                }}
                placeholder='Name of variant ...'
                style='flex-1 flex flex-col'
                styleLabel={'text-[#00143c] font-medium mb-1'}
                styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none rounded-md border-[#dee1e6]'}
              />
            </div>
            <div className='w-full my-6 flex gap-4'>
                <InputFormm
                    label = 'Color'
                    register={register}
                    errors={errors}
                    id = 'color'
                    validate = {{
                    required: 'Need fill this field'
                    }}
                    placeholder='Color of new product'
                    style='flex-1 flex flex-col'
                    styleLabel={'text-[#00143c] font-medium mb-1'}
                    styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none rounded-md border-[#dee1e6]'}
                />
                <div className='flex-1 flex items-end'>
                    <div className="mt-1 flex w-full items-center space-x-4">
                        <input
                            type="color"
                            id="colorCode"
                            name="colorCode"
                            value={colorCode}
                            onChange={handleChangeColor}
                            className="h-10 flex-1 rounded cursor-pointer"
                            aria-label="Product Color"
                        />
                        <div
                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center"
                            style={{ backgroundColor: colorCode }}
                        >
                            <IoColorPaletteOutline className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className='w-full my-6 flex gap-4'>
              <InputFormm
                label = 'Quantity'
                register={register}
                errors={errors}
                id = 'quantity'
                validate = {{
                  required: 'Need fill this field'
                }}
                placeholder='Quantity of new product'
                type='number'
                style='flex-1 flex flex-col'
                styleLabel={'text-[#00143c] font-medium mb-1'}
                styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none rounded-md border-[#dee1e6]'}
              />
            </div>
            
            <div className='w-full my-6 flex flex-col'>
              <label className='text-[#00143c] font-medium mb-1' htmlFor='thumb'>Upload Thumb</label>
              <input 
                {...register('thumb')}
                type='file' 
                accept="image/*"
                id='thumb'
                className='text-[#00143c]'
              />
              {errors['thumb'] && <small className='text-xs text-red-500'>{errors['thumb']?.message}</small>}
    
              {preview.thumb 
                && 
              <div className='mt-2 flex justify-start'>
                <img src={preview.thumb} alt='thumbnail' className='w-[264px] max-h-[200px] object-contain border border-[#dee1e6] rounded-md shadow-inner'></img>
              </div>
              }
            </div>
            <div className='w-full my-6 flex flex-col'>
              <label className='text-[#00143c] font-medium mb-1' htmlFor='thumb'>Upload Images Of Variant</label>
              <input 
                {...register('images')}
                type='file' 
                id='images' 
                accept="image/*"
                multiple
                className='text-[#00143c]'
              />
              {errors['images'] && <small className='text-xs text-red-500'>{errors['images']?.message}</small>}
            
              {preview.images?.length > 0 
                && 
              <div className='mt-2 flex w-[800px] gap-1 overflow-x-auto px-2 py-1 scrollbar-thin'>
                {
                  preview.images?.map((el,index) => (
                    <img key={index} src={el} alt='image of variant' className='w-[33%] max-h-[200px] object-contain border border-[#dee1e6] rounded-md shadow-inner'></img>
                  ))
                }
              </div>
              }
            </div>

            <div className='w-full mt-6 mb-4 flex justify-center'>
              <Button type='submit' style={'px-4 py-2 rounded-md text-white bg-[#005aee] font-semibold w-fit h-fit flex gap-1 items-center'}>
                {isLoading ? (
                    <span className="flex items-center">
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Updating variant...
                    </span>
                ) : (
                    <span className='flex items-center'>
                     Update variant
                    </span>
                )}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default UpdateVariantProduct