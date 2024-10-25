import React, { useCallback, useState, useEffect} from 'react'
import {Select, Button, MarkdownEditor, Loading, MultiSelect, SelectCategory, InputFormm} from 'components'
import { set, useForm } from 'react-hook-form'
import {useSelector, useDispatch} from 'react-redux'
import { validate, getBase64 } from 'ultils/helper'
import { toast } from 'react-toastify'
import icons from 'ultils/icon'
import { apiAddStaff, apiGetAllStaffs } from 'apis'
import { FaUserGear } from "react-icons/fa6";
import { getCurrent } from 'store/user/asyncAction'
import withBaseComponent from 'hocs/withBaseComponent'
import { hour } from 'ultils/constant'
import { minute } from 'ultils/constant'
import { apiAddService } from 'apis/service'
import { HashLoader } from 'react-spinners';
import bgImage from '../../assets/clouds.svg'
import { FaPlus } from 'react-icons/fa'

const AddService = () => {
  const {categories_service} = useSelector(state => state.category)
  const dispatch = useDispatch()
  const {register, formState:{errors}, reset, handleSubmit, watch} = useForm()
  const [isLoading, setIsLoading] = useState(false);

  const {current} = useSelector(state => state.user)
  useEffect(() => {
    dispatch(getCurrent());
  }, []);

  const [preview, setPreview] = useState({
    thumb: null,
    images: []
  })

  const [payload, setPayload] = useState({
    description: ''
  })
  const [invalidField, setInvalidField] = useState([])
  
  const [staffs, setStaffs] = useState(null)
  const fetchStaff = async(params) => {
    const response = await apiGetAllStaffs({limit:999})
    if(response?.success){
      setStaffs(response.staffs)
    }
  }
  useEffect(() => {
    fetchStaff()
  }, [])

  const options = staffs?.map((staff) => ({
    label: `${staff.firstName} ${staff.lastName}`,
    value: staff._id
  }));

  const option_category = categories_service?.map((cate) => ({
    label: cate?.title,
    value: cate?._id,
    color: cate?.color
  }));

  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const handleSelectStaffChange = useCallback(selectedOptions => {
    setSelectedStaff(selectedOptions);
  }, []);

  const handleSelectCateChange = useCallback(selectedOptions => {
    setSelectedCategory(selectedOptions);
  }, []);

  const handleAddService = async(data) => {
    const invalid = validate(payload, setInvalidField)
    
    if(invalid === 0){
      const finalPayload = {...data,...payload}
      
      console.log(finalPayload)
      finalPayload.provider_id = current.provider_id?._id
      if(selectedStaff?.length > 0){
        finalPayload.assigned_staff = selectedStaff
      }
      if(selectedCategory){
        finalPayload.category = selectedCategory
      }
      const formData = new FormData()
      for(let i of Object.entries(finalPayload)){
        formData.append(i[0],i[1])
      }
      if(finalPayload.thumb) formData.append('thumb', finalPayload.thumb[0])
      if(finalPayload.images) {
        for (let image of finalPayload.images) formData.append('images', image)
      }
      formData.delete('assigned_staff');
      if(finalPayload.assigned_staff) {
        for (let staff of finalPayload.assigned_staff) formData.append('assigned_staff', staff)
      }
      for (var pair of formData.entries()) {
      }

      setIsLoading(true);
      const response = await apiAddService(formData)
      setIsLoading(false);
      if(response.success){
        toast.success(response.mes)
        reset()
        setPayload({
          description: ''
        })
        setSelectedStaff([])
        setSelectedCategory(null)
        setPreview({
          thumb: null,
          images: []
        })
      }
      else{
        toast.error(response.mes)
      }
    }
  }

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


  return (
    <div className='w-full h-full relative'>
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className='relative z-10 w-full'>
        <div className='w-full h-fit flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl h-fit font-semibold'>Add New Service</span>
        </div>
        <div className='w-[95%] h-fit shadow-2xl rounded-md bg-white ml-4 mb-[50px] px-4 py-2 flex flex-col gap-4'>
          <form onSubmit={handleSubmit(handleAddService)}>
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
                {...register('thumb', {required: 'Need upload thumb'})}
                type='file' 
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
                {...register('images', {required: 'Need upload image of service'})}
                type='file' 
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
                    <img key={index} src={el.path} alt='image of service' className='w-[33%] max-h-[200px] object-contain border border-[#dee1e6] rounded-md shadow-inner'></img>
                  ))
                }
              </div>
              }
            </div>
            <div className='w-full mt-6 mb-4 flex justify-center'>
              <Button type='submit' style={'px-4 py-2 rounded-md text-white bg-[#005aee] font-semibold w-fit h-fit flex gap-1 items-center'}><FaPlus /> Create a new service</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddService