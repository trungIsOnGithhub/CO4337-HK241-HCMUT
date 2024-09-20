import React, { useCallback, useState, useEffect} from 'react'
import {InputForm, Select, Button, MarkdownEditor, Loading, SelectCategory, MultiSelect} from 'components'
import { useForm } from 'react-hook-form'
import {useSelector, useDispatch} from 'react-redux'
import { validate, getBase64 } from 'ultils/helper'
import { toast } from 'react-toastify'
import icons from 'ultils/icon'
import { apiCreateBlog, apiGetAllPostTags, apiCreateNewPostTag } from 'apis/blog'
import { showModal } from 'store/app/appSlice'
import { getCurrent } from 'store/user/asyncAction'
import { HashLoader } from 'react-spinners'
import { FaPlus } from "react-icons/fa";
import Swal from 'sweetalert2'

const AddPost = () => {
  const {blogCategories_service} = useSelector(state => state.blogCategory)
  const [addNewTagMenu, setAddNewTagMenu] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(null);

  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const fetchTags = async() => {
    const response = await apiGetAllPostTags();
    if(response?.success){
      const tagOptions = response?.tags.map((tag) => ({
        label: tag.label,
        value: tag.label
      })) || [];
      setTags(tagOptions)
    }
  }
  useEffect(() => {
    fetchTags();
  }, [])

  const {current} = useSelector(state => state.user)
  useEffect(() => {
    dispatch(getCurrent());
  }, []);

  const dispatch = useDispatch()
  const {register, formState:{errors}, reset, handleSubmit, watch} = useForm()

  const [payload, setPayload] = useState({
    description: ''
  })
  const [preview, setPreview] = useState({
    thumb: null,
    images: []
  })

  const [invalidField, setInvalidField] = useState([])
  const changeValue = useCallback((e)=>{
    setPayload(e)
  },[payload])

  // const option_category = blogCategories_service?.map((cate) => ({
  //   label: cate?.title,
  //   value: cate?.title,
  //   // color: cate?.color
  // })) || [];

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

  // useEffect(() => {
  //   handlePreviewImages(watch('images'))
  // }, [watch('images')])


  const handleCreateBlogPost = async(data) => {
      const finalPayload = {...data,...payload};
      finalPayload.provider_id = current?.provider_id;
      if(selectedTags?.length > 0){
        finalPayload.tags = selectedTags
      }
      if(title){
        finalPayload.title = title
      }
      // finalPayload.description = 'kdlsakdl;askdlsakdl;'
      const formData = new FormData()
      for(let i of Object.entries(finalPayload)){
        formData.append(i[0],i[1])
      }
      if(finalPayload.thumb) formData.append('thumb', finalPayload.thumb[0])
      if(finalPayload.images) {
        for (let image of finalPayload.images) formData.append('images', image)
      }

      setIsLoading(true)

      const response = await apiCreateBlog(finalPayload)

      setIsLoading(false)
      if(response && response.success){
        toast.success('Create New Post Blog Successfully');
        reset();
        setSelectedTags([]);
      }
      else{
        toast.error(response.mes)
      }
    // }
    // else {
    //   toast.error("Please Recheck Your Input Information.");
    // }
  }

  // const handleSelectCateChange = useCallback(selectedOptions => {
  //   setSelectedCategory(selectedOptions);
  // }, []);
  const handleSelectTagChange = useCallback(selectedOptions => {
    setSelectedTags(selectedOptions);
  }, []);

  const validateNewTagLabel = useCallback(newTagLabel => {
  return (newTagLabel?.length) && newTagLabel?.indexOf(' ') < 0 && newTagLabel?.indexOf('#') < 0;
  }, []);
  const addNewTagOnClick = useCallback(async (newTagLabel) => {
    let validate = validateNewTagLabel(newTagLabel);
    if (!validate) {
      Swal.fire('Invalid Label!!', 'Please check your input Tag Name!!', 'error')
      return;
    }

    let response = await apiCreateNewPostTag({ label:newTagLabel, created_by: current?.provider_id });

    if (response && response.success) {
      Swal.fire('Sucessful!!', 'Create new Post Tag Sucessfully!!', 'success');
      setAddNewTagMenu(false);
    }
    else {
      Swal.fire('Error Ocurred!!', 'Cannot create new Post Tag!!', 'error')
    }

    fetchTags();
  }, [])

  return (
    <div className='w-full'>
      <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
        <span>Create a New Blog Post</span>
      </h1>
      <div className='p-4 '>
        <form onSubmit={() => {handleCreateBlogPost();}}>
          <InputForm
            label = 'Post Title'
            register={register}
            errors={errors}
            id = 'title'
            validate = {{
              required: 'Need fill this field'
            }}
            fullWidth
            onInput={(eve) => {setTitle(eve.target.value)}}
          />
          {/* <div className='w-full my-6 flex gap-4'>
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
          </div> */}
          {/* <div className='w-full my-6 flex gap-4'>
            <SelectCategory
              label = 'Category'
              options = {option_category}
              register={register}
              id = 'category'
              validate = {{
                required: 'This field is required'
              }}
              errors={errors}
              fullWidth
              onChangee={handleSelectCateChange}
              values={selectedCategory}
              style='flex-1'
            />
          </div> */}
          <MarkdownEditor 
            name = 'content'
            changeValue={changeValue}
            label = 'Blog Content'
            invalidField={invalidField}
            setInvalidField={setInvalidField}
          />
          <div className='w-full my-6 flex gap-4 z-60'>
            <MultiSelect
              title='Tags'
              label='Tags'
              id='assigned_tags' 
              options={tags}
              onChangee={handleSelectTagChange}
              values={selectedTags}
            />
            { !addNewTagMenu && 
            <Button
              style="p-2 rounded-md text-white bg-main"
              handleOnclick={() => {setAddNewTagMenu(prev => !prev);}}
            ><FaPlus /></Button>
            }
          </div>
          {
              addNewTagMenu &&
              <div className='w-full my-6 flex flex-col z-60'>
                <span className='flex gap-2 m-auto'>
                  <Button
                    style={"rounded-md text-white bg-main font-semibold p-2 w-fit"}
                    handleOnclick={() => { setAddNewTagMenu(false); }}
                  >Close
                  </Button>
                  <Button
                    style={"rounded-md text-white bg-main font-semibold p-2 w-fit"}
                    handleOnclick={() => { addNewTagOnClick(newTagLabel) }}
                  >Add Tag
                  </Button>
                </span>
                <InputForm
                  label = 'Create New Tag'
                  register={register}
                  errors={errors}
                  id = 'title'
                  validate = {{
                    required: 'Need fill this field'
                  }}
                  onInput={(eve) => {setNewTagLabel(eve.target.value)}}
                />
              </div>
            }
          <div className='flex flex-col gap-2 mt-8'>
            <label className='font-semibold' htmlFor='thumb'>Upload Thumb</label>
            <input 
              {...register('thumb', {required: 'Post thumb image is required!'})}
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
{/* 
          <div className='flex flex-col gap-2 mt-8'>
            <label className='font-semibold' htmlFor='product'>Upload image of product</label>
            <input 
              {...register('images', {required: 'Need upload image of product'})}
              type='file' 
              id='product' 
              multiple
            />
            {errors['images'] && <small className='text-xs text-red-500'>{errors['product']?.message}</small>}
          </div> */}

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
            <Button handleOnclick={() => {handleCreateBlogPost();}}>
              Create a new Post
            </Button>
          </div>
        </form>
        {isLoading && (
        <div className='flex justify-center z-50 w-full h-full fixed top-0 left-0 items-center bg-overlay'>
            <HashLoader className='z-50' color='#3B82F6' loading={isLoading} size={80} />
        </div>
        )}
      </div>
    </div>
  )
}

export default AddPost