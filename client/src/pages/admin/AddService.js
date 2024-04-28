import React, { useCallback, useState, useEffect} from 'react'
import {InputForm, Select, Button, MarkdownEditor, Loading, MultiSelect} from 'components'
import { useForm } from 'react-hook-form'
import {useSelector, useDispatch} from 'react-redux'
import { validate, getBase64 } from 'ultils/helper'
import { toast } from 'react-toastify'
import icons from 'ultils/icon'
import { apiAddStaff, apiGetAllStaffs } from 'apis'
import { showModal } from 'store/app/appSlice'
import { FaUserGear } from "react-icons/fa6";
import withBaseComponent from 'hocs/withBaseComponent'
import { hour } from 'ultils/constant'
import { minute } from 'ultils/constant'
import { apiAddService } from 'apis/service'


const AddService = () => {
  const {categories_service} = useSelector(state => state.category)
  const dispatch = useDispatch()
  const {register, formState:{errors}, reset, handleSubmit, watch} = useForm()
  const [preview, setPreview] = useState({
    avatar: null
  })
  const [payload, setPayload] = useState({
    description: ''
  })
  const [invalidField, setInvalidField] = useState([])
  
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

  const options = staffs?.map((staff) => ({
    label: `${staff.firstName} ${staff.lastName}`,
    value: staff._id
  }));

  const [selectedStaff, setSelectedStaff] = useState([]);
  const handleSelectChange = useCallback(selectedOptions => {
    setSelectedStaff(selectedOptions);
  }, []);

  const handleAddService = async(data) => {
    const invalid = validate(payload, setInvalidField)
    if(invalid === 0){
      if(data?.category){
        data.category = categories_service?.find(el => el._id === data.category)?.title
      }
      console.log(selectedStaff)
      const finalPayload = {...data,...payload,}
      if(selectedStaff?.length > 0){
        finalPayload.assigned_staff = selectedStaff
      }
      console.log(finalPayload)
      const formData = new FormData()
      for(let i of Object.entries(finalPayload)){
        formData.append(i[0],i[1])
      }
      if(finalPayload.thumb) formData.append('thumb', finalPayload.thumb[0])
      if(finalPayload.images) {
        for (let image of finalPayload.images) formData.append('images', image)
      }
      for (var pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
      }
      const response = await apiAddService(formData)
      // dispatch(showModal({isShowModal: true, modalChildren: <Loading />}))
      // // dispatch(showModal({isShowModal: false, modalChildren: null}))
      // if(response.success){
      //   toast.success(response.mes)
      //   reset()
      //   setPayload({
      //     description: ''
      //   })
      // }
      // else{
      //   toast.error(response.mes)
      // }
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
    <div className='w-full'>
      <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
        <span>Add Service</span>
      </h1>
      <div className='p-4 '>
        <form onSubmit={handleSubmit(handleAddService)}>
          <div className='w-full my-6 flex gap-4'>
            <InputForm 
              label = 'Service Name'
              register={register}
              errors={errors}
              id = 'name'
              validate = {{
                required: 'Need fill this field'
              }}
              style='flex-1'
              placeholder='Name of service ...'
            />
            <Select 
              label = 'Category'
              options = {categories_service?.map(el =>(
                {code: el._id,
                value: el.title}
              ))}
              register={register}
              id = 'category'
              validate = {{
                required: 'Need fill this field'
              }}
              style='flex-1'
              errors={errors}
              fullWidth
            />
          </div>
          <MarkdownEditor 
            name = 'description'
            changeValue={changeValue}
            label = 'Description'
            invalidField={invalidField}
            setInvalidField={setInvalidField}
          />
          <div className='w-full my-6 flex gap-4'>
            <div className='w-full flex flex-1 items-center gap-2'> 
              <Select 
                label = 'Hour'
                options = {hour?.map(el =>(
                  {code: el,
                  value: `${el} hour(s)`}
                ))}
                register={register}
                id = 'hour'
                validate = {{
                  required: 'Need fill this field'
                }}
                style='flex-auto italic'
                errors={errors}
                fullWidth
                text='Hour'
              />
              <Select 
                label = 'Minute'
                options = {minute?.map(el =>(
                  {
                    code: el,
                    value: `${el} minute(s)`
                  }
                ))}
                register={register}
                id = 'minute'
                validate = {{
                  required: 'Need fill this field'
                }}
                style='flex-auto italic'
                errors={errors}
                fullWidth
                text='Minute'
              />
            </div>
            <div className='w-full flex flex-1 items-center'> 
            <InputForm 
              label = 'Price'
              register={register}
              errors={errors}
              id = 'price'
              validate = {{
                required: 'Need fill this field'
              }}
              style='flex-auto'
              placeholder='Price of new service'
              type='number'
            />
            </div>
          </div>
          <MultiSelect 
            id='assigned_staff' 
            options={options}
            onChangee={handleSelectChange}
            />
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
            <label className='font-semibold' htmlFor='product'>Upload Images Of Service</label>
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
                  <img src={el.path} alt='image of product' className='w-[200px] object-contain'></img>
                </div>
              ))
            }
          </div>
          }

          <div className='mt-8'>
            <Button type='submit'>
              Create a new service
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddService