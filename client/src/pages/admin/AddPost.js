import React, { useCallback, useState, useEffect} from 'react'
import {InputForm, Select, Button, MarkdownEditor, Loading, SelectCategory, MultiSelect, InputFormm} from 'components'
import { useForm } from 'react-hook-form'
import {useSelector, useDispatch} from 'react-redux'
import { validate, getBase64 } from 'ultils/helper'
import { toast } from 'react-toastify'
import icons from 'ultils/icon'
import { apiCreateBlog, apiGetAllPostTags, apiCreateNewPostTag } from 'apis/blog'
import { showModal } from 'store/app/appSlice'
import { getCurrent } from 'store/user/asyncAction'
import { HashLoader } from 'react-spinners'
import { FaPlus, FaSpinner } from "react-icons/fa";
import Swal from 'sweetalert2'
import bgImage from '../../assets/clouds.svg'
import { FiX } from 'react-icons/fi'

const AddPost = () => {
  const {categories_service} = useSelector(state => state.category)
  const [addNewTagMenu, setAddNewTagMenu] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(null);

  const [blogTag, setBlogTag] = useState([])

  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const fetchTags = async() => {
    const response = await apiGetAllPostTags();
    if(response?.success){
      setTags(response?.tags)
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
    content: ''
  })
  const [preview, setPreview] = useState({
    thumb: null,
  })


  const [invalidField, setInvalidField] = useState([])

  const changeValue = useCallback((e)=>{
    setPayload(e)
  },[payload])

  const [currentTag, setCurrentTag] = useState("");
  const [showSuggestedTags, setShowSuggestedTags] = useState(false);




  const option_category = categories_service?.map((cate) => ({
    label: cate?.title,
    value: cate?._id,
    color: cate?.color
  }));


  const handlePreviewThumb = async(file) => {
    const base64Thumb = await getBase64(file)
    setPreview(prev => ({...prev, thumb: base64Thumb}))
  }

  useEffect(() => {
    handlePreviewThumb(watch('thumb')[0])
  }, [watch('thumb')])

  // useEffect(() => {
  //   handlePreviewImages(watch('images'))
  // }, [watch('images')])


  const handleAddBlog = async(data) => {
    const finalPayload = {...data,...payload};
    finalPayload.provider_id = current?.provider_id?._id;
    if(blogTag.length > 0){
      finalPayload.tags = blogTag
    }
    if(selectedCategory){
      finalPayload.category = selectedCategory
    }
    const formData = new FormData()
    for(let i of Object.entries(finalPayload)){
      formData.append(i[0],i[1])
    }
    formData.delete('thumb')
    if(finalPayload.thumb) formData.append('thumb', finalPayload.thumb[0])
    
    formData.delete('tags')
    if(finalPayload.tags) {
      for (let tag of finalPayload.tags) formData.append('tags', tag)
    }
    
    for (let [key, value] of formData.entries()) {
    }
    setIsLoading(true)
    const response = await apiCreateBlog(formData);
    setIsLoading(false)
    if(response?.success){
      console.log('create blog successfully')
      toast.success('Create New Post Blog Successfully');
       // Lọc các tag mới chưa có trong `tags`
      const newTags = blogTag.filter(
        (tagLabel) => !tags.some((tag) => tag.label === tagLabel)
      );
      
      // Gọi API cho mỗi tag mới
      for (const newTag of newTags) {
        await apiCreateNewPostTag({label: newTag});
      }

      reset();
      setBlogTag([]);
      setPayload({
        content: ''
      })
      setPreview({
        thumb: null
      })
      setSelectedCategory(null)
    }
    else{
      toast.error(response.mes)
    }
  }

  const handleSelectCateChange = useCallback(selectedOptions => {
    setSelectedCategory(selectedOptions);
  }, []);

  const handleSelectTagChange = useCallback(selectedOptions => {
    setSelectedTags(selectedOptions);
  }, []);

  

  const removeTag = (tagToRemove) => {
    setBlogTag((prev) => {
      return prev.filter((tag) => tag !== tagToRemove)
    });
    setTags(prev => [...prev, { _id: tagToRemove }]);
  };

  const handleTagInputFocus = () => {
    setShowSuggestedTags(true);
  };

  const handleTagAdd = (e) => {
    e.preventDefault();
    if (currentTag && !blogTag.includes(currentTag)) {
      setBlogTag(prev => [...prev, currentTag.trim()]);
      setCurrentTag("");
      setShowSuggestedTags(false);
    }
  };


  const handlePredefinedTagSelect = (tag) => {

    if (!blogTag.includes(tag)) {
      setBlogTag(prev => [...prev, tag]);
    }
    if (tags.some(t => t._id === tag)) {
      setTags(prev => prev.filter(t => t._id !== tag));
    }

    setCurrentTag("");
    setShowSuggestedTags(false);
  };

  return (
    <div className='w-full h-full relative'>
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className='relative z-10 w-full'>
        <div className='w-full h-fit flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl h-fit font-semibold'>Add Blog</span>
        </div>
        <div className='w-[95%] h-fit shadow-2xl rounded-md bg-white ml-4 mb-[50px] px-4 py-2 flex flex-col gap-4'>
          <form onSubmit={handleSubmit(handleAddBlog)}>
            <div className='w-full my-6 flex gap-4'>
              <InputFormm
                label = 'Blog Title'
                register={register}
                errors={errors}
                id = 'title'
                validate = {{
                  required: 'Need fill this field'
                }}
                style='flex-1 flex flex-col'
                placeholder='Enter title of blog ...'
                styleLabel={'text-[#00143c] font-medium mb-1'}
                styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none rounded-md border-[#dee1e6]'}
              />
            </div>
            <div className='w-full my-6 flex gap-4'>
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
              <span className='text-[#00143c] font-medium'>Blog Content</span>
              <MarkdownEditor 
                name = 'content'
                changeValue={changeValue}
                invalidField={invalidField}
                setInvalidField={setInvalidField}
                className='outline-none'
              />
            </div>
            {/* Tags Field */}
            <div>
              <label
                htmlFor="tags"
                className="blocka font-medium text-[#00143c]"
              >
                Tags
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onFocus={handleTagInputFocus}
                  onKeyDown={(e) => e.key === "Enter" && handleTagAdd(e)}
                  className="flex-1 rounded-l-md text-[#00143c] outline-none border border-[#dee1e6] px-3 py-2 "
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleTagAdd}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-[#005aee] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add
                </button>
              </div>



              {/* Suggested Tags */}
              {showSuggestedTags && (
                <div className="mt-2 p-2 bg-white border border-gray-200 rounded-md shadow-sm">
                  <p className="text-sm text-[#00143c] mb-2">Use Existing Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {tags?.map((tag) => (
                      <button
                        key={tag?._id}
                        type="button"
                        onClick={() => handlePredefinedTagSelect(tag?._id)}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {tag?._id}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {blogTag?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-[#0a66c2]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 inline-flex text-[#0a66c2] focus:outline-none"
                    >
                      <FiX className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className='w-full my-6 flex flex-col'>
              <label className='text-[#00143c] font-medium mb-1' htmlFor='thumb'>Upload Blog Thumb</label>
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
            <div className='w-full mt-6 mb-4 flex justify-center'>
              <Button type='submit' style={'px-4 py-2 rounded-md text-white bg-[#005aee] font-semibold w-fit h-fit flex gap-1 items-center'}>
                {isLoading ? (
                    <span className="flex items-center">
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Creating a new post...
                    </span>
                ) : (
                    <span className='flex items-center'>
                     <FaPlus />&nbsp;Create a new post
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

export default AddPost