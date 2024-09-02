import React, {useState, useCallback, useEffect } from 'react'
import { MultiSelect } from 'components';
import { apiGetAllBlogs, apiGetAllPostTags } from 'apis/blog';
import Button from 'components/Buttons/Button';
import { HashLoader } from 'react-spinners';
import path from 'ultils/path';
import DOMPurify from 'dompurify';
import { useNavigate, createSearchParams, useSearchParams } from "react-router-dom";

const Blogs = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSelectTagChange = useCallback(selectedOptions => {
    console.log(selectedOptions);
    setSelectedTags(selectedOptions);
  }, []);

  const handleChooseBlogPost = (id) => { 
    navigate({
      pathname:  `/${path.VIEW_POST}`,
      search: createSearchParams({id}).toString()
    })
   }

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
        <h2 className='text-[18px] font-semibold py-[15px] border-b-2 border-main'>TRENDING BLOGS</h2>
        {currBlogList && currBlogList.map(
          blog => {
            return (
              <div className='post-item flex flex-row justify-start p-5 hover:bg-slate-400 rounded-md gap-5'
              onClick={() => {handleChooseBlogPost(blog?._id);}}>
                <img src={blog?.thumb} className='gap-0.5 min-w-64 mr-5'/>
                <div>
                  <h3 className="font-bold text-xl">{blog?.title || 'Title'}</h3>
                  <br></br>
                  {/* {blog?.content?.length > 0 
                  &&
                  <div className='text-sm line-clamp-[10] mb-8' dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(blog?.content[0])}}></div>} */}

                  {/* <div className='w'> */}
                    <MultiSelect
                      title='Tags'
                      label='Tags'
                      id='assigned_tags'
                      onChangee={() => {}}
                      values={['dlka', 'dsadsa']}
                      disabled={true}
                    />
                  {/* </div> */}
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

      <div className='w-1/3 flex flex-col gap-5 justify-items-center justify-start items-center border-l-2 border-main pl-5'>
        <div className="relative flex items-left h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden border-2 w-full">
          <div class="grid place-items-center h-full w-12 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
          </div>

          <input
          class="peer h-full outline-none text-sm text-gray-700 pr-2"
          style={{width:'90%'}}
          type="text"
          id="search"
          placeholder="Find a tag, title......"
          onInput={(e) => {setSearchTerm(e.target.value)}}/>
        </div>

        <div className='w-full my-6 flex gap-4' style={{zIndex:88}}>
          <MultiSelect
            title='Tags Of Post'
            label='Tags Of Post'
            id='assigned_tags'
            options={tags}
            onChangee={handleSelectTagChange}
            values={selectedTags}
          />
           <Button style='px-6 rounded-md text-white bg-blue-500 font-semibold h-fit py-2 w-fit mt-5' handleOnclick={()=>fetchCurrentBlogList(searchTerm, selectedTags)}>Choose</Button>
        </div>

        <div className="p-2 text-center text-white bg-red-600 text-semibold w-1/2 rounded-md">Top Search:</div>
        <div className="p-2 text-center text-white bg-slate-600 text-semibold w-2/3 rounded-md">Nha Hang Gan Toi</div>
        <div className="p-2 text-center text-white bg-slate-600 text-semibold w-2/3 rounded-md">Spa Khuyen Mai</div>
        <div className="p-2 text-center text-white bg-slate-600 text-semibold w-2/3 rounded-md">Gym Gia Tot</div>

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