import React, {useState, useCallback, useEffect } from 'react'
import { MultiSelect } from 'components';
import { apiGetAllBlogs, apiGetAllPostTags, apiSearchBlogByParams, apiGetTopTags } from 'apis/blog';
import Button from 'components/Buttons/Button';
import { HashLoader } from 'react-spinners';
import path from 'ultils/path';
// import DOMPurify from 'dompurify';
import { useNavigate, createSearchParams, useLocation } from "react-router-dom";
import { FaCheck, FaRegThumbsUp, FaRegThumbsDown, FaLocationArrow } from 'react-icons/fa';
import Swal from 'sweetalert2';

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
  const [selectedSort, setSelectedSort] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const handleSortByChange = () => {};
  const [topTags, setTopTags] = useState([]);
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
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [currBlogList, setCurrBlogList] = useState([]);
  const fetchCurrentBlogList = async (search, selectedTags) => {
    setIsLoading(true);
    let response = await apiGetAllBlogs({ title: searchTerm,  limit: process.env.REACT_APP_LIMIT });
    if(response?.success && response?.blogs){
      setCurrBlogList(response.blogs);
      setIsLoading(false);
    }
    else {

    }
  }
  useEffect(() => {
    fetchCurrentBlogList();
  }, []);

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

  return (
    <div className='w-main mb-8'>
    <div className='w-full flex gap-4 mt-2 mb-8'>
      <img src="https://www.benchcraftcompany.com/images/CG5_size.jpg"
          className='flex-1 h-[220px] w-[160px] object-cover'
      />
      <img src="https://www.benchcraftcompany.com/images/CG1_size.jpg"
          className='flex-1 h-[220px] w-[160px] object-cover'
      />
    </div>
    <div className='w-full flex flex-row'>
      <div className='w-2/3 flex flex-col'>
        <h2 className='text-xl font-semibold py-[15px] border-b-2 border-main'>Trending Blogs</h2>
        <div className='w-2/3 p-6 bg-slate-300 m-3 rounded-md flex gap-4'>
          <MultiSelect
              title='Sort By'
              label='Sort By'
              id='assigned_tags'
              options={['Date Created', 'Likes', 'Dislikes']}
              onChangee={handleSelectTagChange}
              values={selectedSort}
          />
          <MultiSelect
              title='From Province'
              label='From Province'
              id='assigned_tags'
              options={tags}
              onChangee={handleSelectTagChange}
              values={selectedTags}
          />
        </div>

        {currBlogList && currBlogList.map(
          blog => {
            return (
              <div className='post-item flex flex-row justify-start p-5 hover:bg-slate-300 rounded-md gap-5 m-2'
              onClick={() => {handleChooseBlogPost(blog?._id);}}>
                <img src={blog?.thumb} className='gap-0.5 w-1/2 mr-5'/>
                <div>
                  <h3 className="font-bold text-red-500 text-lg mb-2">{blog?.title || 'Title'}</h3>
                  <h5 className="font-semibold text-md flex mb-4"><FaLocationArrow />&nbsp;&nbsp;{blog?.provider_id?.province || 'Location'}</h5>
                  {/* <span> */}
                    <div className="flex flex-row justify-start gap-2 mb-4"><FaRegThumbsUp /> {blog?.likes?.length || 0}&nbsp;&nbsp;&nbsp;<FaRegThumbsDown /> {blog?.dislikes?.length || 0}</div>
                    {/* <h5 className="font-semibold text-md"><</h5> */}
                  {/* </span> */}
                  <br></br>
                  {/* {blog?.content?.length > 0 
                  &&
                  <div className='text-sm line-clamp-[10] mb-8' dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(blog?.content[0])}}></div>} */}

                  <div className='flex flex-wrap'>
                    {blog?.tags.map(label =>
                        (<div className='bg-green-400 p-2 m-1 rounded-full w-fit'>
                          {label}
                        </div>)
                    )}
                  </div>
                </div>
              </div>
            )
          }
        )}

        {/* <div className='post-item flex flex-row justify-center p-5'>
          <img src='#'  className='gap-0.5'/>
          <h3 className='ml-5'>title 2</h3>
        </div>
        <div className='post-item flex flex-row justify-center p-5'>
          <img src='#'/>
          <h3 className='ml-5'>title 3</h3>
        </div> */}
      </div>

      <div className='w-1/3 flex flex-col gap-4 justify-items-center justify-start items-center border-l-2 border-main pl-5'>
        <div className="relative flex items-left h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden border-2 w-full">
          <div class="grid place-items-center h-full w-12 text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
          </div>

          <input
          class="peer h-full outline-none text-sm text-gray-700 pr-2"
          style={{width:'90%'}}
          type="text"
          id="search"
          placeholder="Find Title, Service Provider......"
          onInput={(e) => {setSearchTerm(e.target.value)}}
          value={searchTerm}/>
        </div>
        {searchTerm?.length > 0 && <Button style='px-2 rounded-md text-white bg-blue-500 font-semibold h-fit py-2 w-fit' handleOnclick={multiSearchByTerm}>Search Keyword</Button>}

        <div className='w-full my-6 flex gap-4 relative' style={{zIndex:88}}>
          <MultiSelect
            title='Tags Of Post'
            label='Tags Of Post'
            id='assigned_tags'
            options={tags}
            onChangee={handleSelectTagChange}
            values={selectedTags}
          />
          <div className='flex flex-wrap'>
            {selectedTags?.length > 0 && <Button style='px-2 rounded-md text-white bg-blue-500 font-semibold h-fit py-2 w-fit absolute -bottom-10' handleOnclick={multiSearchBySelectedTags}>Use Select Tags</Button>}
          </div>
        </div>

        <div className="p-2 text-center text-white bg-red-500 text-semibold w-1/2 rounded-md">Top Search:</div>
        <div className="w-2/3 flex flex-wrap gap-4">
        {
          topTags?.length && topTags.map(tag =>
            (<div className="p-2 text-center text-white bg-slate-600 text-semibold w-fit rounded-md">{tag?.label}</div>)
          )
        }
        </div>
        {/* <div className="p-2 text-center text-white bg-slate-600 text-semibold w-2/3 rounded-md">Nha Hang Gan Toi</div>
        <div className="p-2 text-center text-white bg-slate-600 text-semibold w-2/3 rounded-md">Spa Khuyen Mai</div>
        <div className="p-2 text-center text-white bg-slate-600 text-semibold w-2/3 rounded-md">Gym Gia Tot</div> */}

      </div>
      {isLoading && (
        <div className='flex justify-center z-50 w-full h-full fixed top-0 left-0 items-center bg-overlay'>
            <HashLoader className='z-50' color='#3B82F6' loading={isLoading} size={80} />
        </div>
      )}
    </div>
    </div>
  )
}

export default Blogs