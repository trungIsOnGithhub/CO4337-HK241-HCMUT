import React, {useState, useCallback, useEffect } from 'react'
import { InputFormm, MultiSelect, Select } from 'components';
import { apiGetAllBlogs, apiGetAllPostTags, apiSearchBlogByParams, apiGetTopTags } from 'apis/blog';
import Button from 'components/Buttons/Button';
import { HashLoader } from 'react-spinners';
import path from 'ultils/path';
// import DOMPurify from 'dompurify';
import { useNavigate, createSearchParams, useLocation } from "react-router-dom";
import { FaCheck, FaRegThumbsUp, FaRegThumbsDown, FaLocationArrow } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { tinh_thanhpho } from 'tinh_thanhpho';
import { useForm } from 'react-hook-form';
import { FiClock, FiEye, FiTag, FiUser } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const Blogs = () => {
  const location = useLocation();
  useEffect(() => {
    console.log('=========', location?.state);
    if (location?.state?.searchKey) {
      setSearchTerm(location.state.searchKey);
    }
  }, []);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [tags, setTags] = useState([]);
  const [selectedSort, setSelectedSort] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [provinceFilter, setProvinceFilter] = useState([]);
  const handleSortByChange = () => {};
  const [topTags, setTopTags] = useState([]);

  const provinces = Object.entries(tinh_thanhpho).map(pair => {
    return {
      label: pair[1].name,
      value: pair[1].name
    }
  });

  const fetchTags = async() => {
    const response = await apiGetAllPostTags();
    if(response?.success){
      if(response?.success){
        setTags(response?.tags)
      }
    }
  }
  useEffect(() => {
    fetchTags();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [currBlogList, setCurrBlogList] = useState([]);
  const fetchCurrentBlogList = async (search, selectedTags) => {
    setIsLoading(true);
    let response = await apiGetAllBlogs({ title: searchTerm,  limit: process.env.REACT_APP_LIMIT, sortBy: selectedSort, provinces: provinceFilter });
    if(response?.success && response?.blogs){
      setCurrBlogList(response.blogs);
      setIsLoading(false);
    }
    else {

    }
  }
  useEffect(() => {
    fetchCurrentBlogList();
  }, [selectedSort,provinceFilter]);

  const fetchTopTags = async () => {
    // setIsLoading(true);
    let response = await apiGetTopTags({ limit: 5 });
    if(response?.success && response?.tags){
      setTopTags(response.tags);
      // setIsLoading(false);
    }
    else {

    }
  }
  useEffect(() => {
    fetchTopTags();
  }, []);

  const handleSelectSortByChange = useCallback(selectedOptions => {
    setSelectedSort(selectedOptions);
  }, []);
  const handleSelectProvinceFilterChange = useCallback(selectedOptions => {
    setProvinceFilter(selectedOptions);
  }, []);
  const handleSelectTagChange = useCallback(selectedOptions => {
    setSelectedTags(selectedOptions);
  }, []);

  const handleChooseBlogPost = (id) => { 
    navigate({
      pathname:  `/${path.VIEW_POST}`,
      search: createSearchParams({id}).toString()
    })
   }
  const multiSearchByTerm = useCallback(async () => {
    let response = await apiSearchBlogByParams({ searchTerm })

    if (response && response.success) {
      setCurrBlogList(response.blogs);
      setIsLoading(false);
    }
    else {
      Swal.fire('Error Ocurred!!', 'Cannot Find Post Blogs!!', 'error');
      setIsLoading(false);
    }
  }, [searchTerm]);
  const multiSearchBySelectedTags = useCallback(async () => {
    let response = await apiSearchBlogByParams({ selectedTags })

    if (response && response.success) {
      setCurrBlogList(response.blogs);
      setIsLoading(false);
    }
    else {
      Swal.fire('Error Ocurred!!', 'Cannot create new Post Tag!!', 'error');
      setIsLoading(false);
    }
  }, [selectedTags]);

  
  const {register,formState:{errors}, handleSubmit, watch} = useForm()
  const [selectedTag, setSelectedTag] = useState(null);

  console.log(currBlogList)
  return (
    <div className='w-main mb-8 flex flex-col gap-4 overflow-y-auto'>
      <div className="grid grid-cols-4 gap-8">
          <div className="col-span-3 max-h-[500px] overflow-y-auto">
            <InputFormm
              id='q'
              register={register}
              errors={errors}
              fullWidth
              placeholder= 'Search blog by title name, tag ...'
              style={'w-full bg-[#f4f6fa] min-h-10 rounded-md pl-2 flex items-center mb-4'}
              styleInput={'w-[100%] bg-[#f4f6fa] outline-none text-[#99a1b1]'}
            >
            </InputFormm>
            <div className="space-y-6">
              {currBlogList.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">No blog posts found matching your search criteria.</p>
                </div>
              ) : (
                currBlogList.map((blog) => (
                  <div
                    onClick={() => handleChooseBlogPost(blog?._id)}
                    key={blog.id}
                    className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-[1.02]"
                  >
                    <div className="md:flex">
                      <div className="md:flex-shrink-0">
                        <img
                          className="h-48 w-full md:w-48 object-cover"
                          src={blog.thumb}
                          alt={blog.title}
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center text-gray-500">
                            <FiUser className="h-4 w-4 mr-1" />
                            <span className="text-sm">{`${blog?.author?.lastName} ${blog?.author?.firstName}`}</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <FiClock className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {formatDistanceToNow(new Date(blog?.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <FiEye className="h-4 w-4 mr-1" />
                            <span className="text-sm">{blog?.numberView}</span>
                          </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {blog.title}
                        </h2>
                        <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                        <div className="flex flex-wrap gap-2">
                          {blog.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                            >
                              <FiTag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tags - Right Side */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag?.label ? null : tag?.label)
                    }
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      selectedTag === tag?.label
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    <FiTag className="h-3 w-3 mr-1" />
                    {tag?.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Blogs