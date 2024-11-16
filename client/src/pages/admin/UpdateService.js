import { Button, InputForm, InputFormm, Loading, MarkdownEditor, MultiSelect, Select, SelectCategory } from 'components'
import React, { memo, useCallback, useEffect, useState} from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { validate, getBase64 } from 'ultils/helper'
import {apiUpdateProduct} from 'apis/product'
import { showModal } from 'store/app/appSlice'
import { hour, minute } from 'ultils/constant'
import { apiGetAllStaffs } from 'apis'
import { apiGetOneService, apiUpdateServiceByAdmin } from 'apis/service'
import { useParams } from 'react-router-dom'
import bgImage from '../../assets/clouds.svg'
// import { IoReturnDownBack } from 'react-icons/io5'
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

const UpdateService = () => {
  const {service_id} = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const {categories_service} = useSelector(state => state.category)
  const [editService, setEditService] = useState(null)
  const option_category = categories_service?.map((cate) => ({
    label: cate?.title,
    value: cate?._id,
    color: cate?.color
  }));

  const [staffs, setStaffs] = useState(null)
  const fetchStaff = async(params) => {
    const response = await apiGetAllStaffs()
    if(response.success){
      setStaffs(response.staffs)
    }
  }
  useEffect(() => {
    fetchStaff()
  }, [])

  useEffect(() => {
    const fetchEditServiceData = async() => {
      const response = await apiGetOneService(service_id)
      if(response?.success){
        setEditService(response?.service)
      }
    }
    fetchEditServiceData()
  }, [service_id])
  
  const options = staffs?.map((staff) => ({
    label: `${staff.firstName} ${staff.lastName}`,
    value: staff._id
  }));

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
      name: editService?.name || '',
      price: editService?.price || '',
      category: editService?.category || '',
      hour: Math.floor((+(editService?.duration) / 60)),
      minute: +(editService?.duration) % 60,
      assigned_staff: editService?.assigned_staff?.map(staff => staff._id)
    })
    setPayload({description: typeof editService?.description === 'object' ? editService?.description?.join(', ') : editService?.description})
    setPreview({
      thumb: editService?.thumb || '',
      images: editService?.image || []
    })
    setSelectedCategory(editService?.category)
    setSelectedStaff(editService?.assigned_staff?.map(staff => staff._id))
  }, [editService])
  
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

  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const handleSelectStaffChange = useCallback(selectedOptions => {
    setSelectedStaff(selectedOptions);
  }, []);

  const handleSelectCateChange = useCallback(selectedOptions => {
    setSelectedCategory(selectedOptions);
  }, []);

  const handleUpdateService = async(data) => {
    // const invalid = validate(payload, setInvalidField)
    // if(invalid === 0){
      let finalPayload = {...data,...payload}
      if(selectedStaff?.length > 0){
        finalPayload.assigned_staff = selectedStaff
      }
      if(selectedCategory){
        finalPayload.category = selectedCategory
      }
      if(data.thumb?.length === 0){
        finalPayload.thumb = preview.thumb
      }
      else{
        finalPayload.thumb = data.thumb[0]
      }
      if(data.images?.length === 0){
        finalPayload.images = preview.images
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

      formData.delete('assigned_staff');
      if(finalPayload.assigned_staff) {
        for (let staff of finalPayload.assigned_staff) formData.append('assigned_staff', staff)
      }

      for (var pair of formData.entries())
      {
      }
    
      // // // dispatch(showModal({isShowModal: true, modalChildren: <Loading />}))
      setIsLoading(true)
      const response = await apiUpdateServiceByAdmin(formData, editService._id)
      setIsLoading(false)
      // // // dispatch(showModal({isShowModal: false, modalChildren: null}))
      if(response.success){
        toast.success(response.mes)
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      }
      else{
        toast.error(response.mes)
      }
    //}
  }
  
  const handleBackManageService = () => {
    window.history.back()
  }

  // console.log(editService)
  return (
    <div className='w-full h-full relative'>
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className='relative z-10 w-full'>
        <div className='w-full h-fit flex items-end p-4'>
          <div onClick={handleBackManageService} className='text-[#00143c] cursor-pointer mr-4 ml-1'><FaArrowLeft size={28}/></div>
          <span className='text-[#00143c] text-3xl h-fit font-semibold'>Update Service</span>
        </div>
        <div className='w-[95%] h-fit shadow-2xl rounded-md bg-white ml-4 mb-[50px] px-4 py-2 flex flex-col gap-4'>
          <form onSubmit={handleSubmit(handleUpdateService)}>
            <div className='w-full my-6 flex gap-4'>
              <InputFormm
                label = 'Service Name'
                register={register}
                errors={errors}
                id = 'name'
                validate = {{
                  required: 'Need fill this field'
                }}
                style='flex-1 flex flex-col'
                placeholder='Name of service ...'
                styleLabel={'text-[#00143c] font-medium mb-1'}
                styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none rounded-md border-[#dee1e6]'}
              />
              <SelectCategory 
                label = 'Category'
                styleLabel={'text-[#00143c] font-medium mb-1'}
                style = 'flex-1 flex flex-col z-[999]'
                options = {option_category}
                register={register}
                id = 'category'
                validate = {{
                  required: 'Need fill this field'
                }}
                errors={errors}
                fullWidth
                onChangee={handleSelectCateChange}
                values={selectedCategory}
              />
            </div>
            <div className='w-full flex flex-col gap-1 my-6'>
              <span className='text-[#00143c] font-medium'>Description</span>
              <MarkdownEditor 
                name = 'description'
                changeValue={changeValue}
                invalidField={invalidField}
                setInvalidField={setInvalidField}
                className='outline-none'
                value={payload.description}
              />
            </div>
            <div className='w-full my-6 flex gap-4'>
              <div className='w-full flex flex-1 items-center gap-2'> 
                <Select 
                  label = 'Hour'
                  styleLabel={'text-[#00143c] font-medium mb-1'}
                  styleSelect={'rounded-md form-select text-[#00143c] border-[#dee1e6] border px-4 py-2 w-full cursor-pointer outline-none'}
                  style='flex-1 flex flex-col'
                  options = {hour}
                  register={register}
                  id = 'hour'
                  validate = {{
                    required: 'Need fill this field'
                  }}
                  errors={errors}
                  text='Hour'
                />
                <Select 
                  label = 'Minute'
                  styleLabel={'text-[#00143c] font-medium mb-1'}
                  styleSelect={'rounded-md form-select text-[#00143c] border-[#dee1e6] border px-4 py-2 w-full cursor-pointer outline-none'}
                  style='flex-1 flex flex-col'
                  options = {minute}
                  register={register}
                  id = 'minute'
                  validate = {{
                    required: 'Need fill this field'
                  }}
                  errors={errors}
                  text='Minute'
                />
              </div>
              <div className='w-full flex flex-1 items-center'> 
                <InputFormm
                  label = 'Price (VNĐ)'
                  register={register}
                  errors={errors}
                  id = 'price'
                  validate = {{
                    required: 'Need fill this field'
                  }}
                  style='flex-1 flex flex-col'
                  styleLabel={'text-[#00143c] font-medium mb-1'}
                  styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none rounded-md border-[#dee1e6]'}
                  placeholder='Price of new service'
                  type='number'
                />
              </div>
            </div>
            <div className='w-full my-6'>
              <MultiSelect 
                id='assigned_staff' 
                options={options}
                onChangee={handleSelectStaffChange}
                values={selectedStaff}
                labelStyle={'text-[#00143c] font-medium mb-1'}
                style={'flex flex-col w-full'}
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
              <label className='text-[#00143c] font-medium mb-1' htmlFor='thumb'>Upload Images Of Service</label>
              <input 
                {...register('images')}
                type='file' 
                accept="image/*"
                id='images' 
                multiple
                className='text-[#00143c]'
              />
              {errors['images'] && <small className='text-xs text-red-500'>{errors['images']?.message}</small>}
            
              {preview.images?.length > 0 
                && 
              <div className='mt-2 flex w-[800px] gap-1 overflow-x-auto px-2 py-1 scrollbar-thin'>
                {
                  preview.images?.map((el,index) => (
                    <img key={index} src={el} alt='image of service' className='w-[33%] max-h-[200px] object-contain border border-[#dee1e6] rounded-md shadow-inner'></img>
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
                    Updating service...
                    </span>
                ) : (
                    <span className='flex items-center'>
                     Update service
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

export default memo(UpdateService)