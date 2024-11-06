import React, { useEffect, useState } from 'react'
import bgImage from '../../assets/clouds.svg'
import { FaPlus, FaSpinner } from 'react-icons/fa'
import { Button, InputFormm } from 'components'
import { useForm } from 'react-hook-form'
import { IoColorPaletteOutline, IoReturnDownBack } from 'react-icons/io5'
import { toast } from 'react-toastify'
import { getBase64, validate } from 'ultils/helper'
import { apiAddVariant, apiGetOneProduct } from 'apis'
import { useParams } from 'react-router-dom'
import { GrPrevious } from 'react-icons/gr'

const AddVariantProduct = () => {
    const {register, formState:{errors}, reset, handleSubmit, watch} = useForm()
    const [preview, setPreview] = useState({
        thumb: null,
        images: []
    })
    const [colorCode, setColorCode] = useState("#000000")
    const [productData, setProductData] = useState(null)
    const {product_id} = useParams()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchProduct = async() => {
            const response = await apiGetOneProduct(product_id)
            if(response.success) {
                setProductData(response.product)
            }
        }
        fetchProduct()
    }, [product_id])
    
    console.log(productData)

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
        imagesPreview.push({
        name: i.name,
        path: base64
        })
    }
    if(imagesPreview.length > 0){
        setPreview(prev => ({...prev, images: imagesPreview}))
    }
    }
    
    useEffect(() => {
    handlePreviewThumb(watch('thumb')[0])
    }, [watch('thumb')])

    useEffect(() => {
    handlePreviewImages(watch('images'))
    }, [watch('images')])

    const handleCreateVariant = async(data) => {
        const finalPayload = {...data, colorCode}

        const formData = new FormData()
        for(let i of Object.entries(finalPayload)){
            formData.append(i[0],i[1])
        }
        formData.delete('thumb')
        if(finalPayload.thumb) formData.append('thumb', finalPayload.thumb[0])

        formData.delete('images')
        if(finalPayload.images) {
            for (let image of finalPayload.images) formData.append('images', image)
        }

        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        setIsLoading(true)
        const response = await apiAddVariant(formData, product_id)
        setIsLoading(false)
        if(response.success){
            toast.success(response.mes)
            reset()
            setColorCode("#000000")
            setPreview({
              thumb: null,
              images: []
            })
          }
          else{
            toast.error(response.mes)
          }
    }
    
    const handleChangeColor = (e) => {
        setColorCode(e.target.value);
    }

    const handleBackManageProduct = () => {
        window.history.back()
    }
  return (
    <div className='w-full h-full relative'>
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className='relative z-10 w-full'>
        <div className='w-full h-fit flex justify-start gap-1 p-4 items-end'>
            <div onClick={handleBackManageProduct} className='text-[#00143c] cursor-pointer'><IoReturnDownBack size={28}/></div>
            <span className='text-[#00143c] text-3xl h-fit font-semibold'>Add New Variant</span>
            <span className='text-[#00143c] text-xl ml-4 font-medium'>{`(Product: ${productData?.title})`}</span>
        </div>
        <div className='w-[95%] h-fit shadow-2xl rounded-md bg-white ml-4 mb-[50px] px-4 py-2 flex flex-col gap-4'>
          <form onSubmit={handleSubmit(handleCreateVariant)}>
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
                label = 'Price'
                register={register}
                errors={errors}
                id = 'price'
                validate = {{
                  required: 'Need fill this field'
                }}
                placeholder='Price of new product'
                type='number'
                style='flex-1 flex flex-col'
                styleLabel={'text-[#00143c] font-medium mb-1'}
                styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none rounded-md border-[#dee1e6]'}
              />
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
            <div className='w-full my-6 flex flex-col'>
              <label className='text-[#00143c] font-medium mb-1' htmlFor='thumb'>Upload Thumb</label>
              <input 
                {...register('thumb', {required: 'Need upload thumb'})}
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
                {...register('images', {required: 'Need upload image of product'})}
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
                    <img key={index} src={el.path} alt='image of variant' className='w-[33%] max-h-[200px] object-contain border border-[#dee1e6] rounded-md shadow-inner'></img>
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
                    Creating a new variant...
                    </span>
                ) : (
                    <span className='flex items-center'>
                     <FaPlus /> Create a new variant
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

export default AddVariantProduct