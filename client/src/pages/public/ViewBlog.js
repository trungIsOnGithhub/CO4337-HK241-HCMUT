import React, {useState,useEffect} from 'react'
import { Button, MultiSelect } from '../../components'
import { useSearchParams, useNavigate, createSearchParams } from 'react-router-dom'
import { apiGetOneBlog, apiGetTopBlogs } from '../../apis/blog'
import { toast } from 'react-toastify'
import DOMPurify from 'dompurify';
import path from 'ultils/path';
import { FaRegTrashAlt, FaRegThumbsDown, FaRegThumbsUp, FaClock, FaPencilAlt, FaBackward, FaHome, FaFacebook } from 'react-icons/fa'
import {useSelector } from 'react-redux'
import { FaGithub } from 'react-icons/fa6'
import ServiceBlogIntroCard from '../../components/Services/ServiceBlogIntroCard'

const ViewBlog = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [post, setPost] = useState(null);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const {current} = useSelector(state => state.user)
      
      // "<h1> Cai Nay La H1</h1>",
      // ["</br>"],
      // "<p>Fresh Herb and skillful practioner will bring you best experience</p>",
      // "<strong> Cai Nay La Strong</strong>"
    const [currBlogList, setCurrBlogList] = useState([]);
    const fetchCurrentBlogList = async (search, selectedTags) => {
      // setIsLoading(true);
      let response = await apiGetTopBlogs({ limit: 5 });
      if(response?.success && response?.blogs){
        console.log('++++++', response.blogs, '+++++');
        setCurrBlogList(response.blogs);
        // setIsLoading(false);
      }
      else {
  
      }
    }
    useEffect(() => {
      fetchCurrentBlogList();
    }, []);
  
    const fetchPostData = async () => {
      const response = await apiGetOneBlog(params?.get('id'));
      console.log(response,'----');
      if (response?.success) {
        setPost(response?.blog);
        if (response?.blog?.likes?.includes(current?._id)) {
          setLiked(true);
        }
        if (response?.blog?.dislikes?.includes(current?._id)) {
          setDisliked(true);
        }
      } else {
  
      }
      // setPost()
    };
  
    useEffect(() => {
      const searchParams = Object.fromEntries([...params]);
      fetchPostData(searchParams);
    }, [params]);

    const backToHomepage = () => {
        navigate({
            pathname: `/${path.BLOGS}`
        })
    }

    const triggerReaction = (reaction) => {
      if (reaction === 'like') {
        if (liked) {

        } else {
          
        }
      }
      else if (reaction === 'dislike') {
        if (disliked) {

        } else {
          
        }
      }
    }

    const handleChooseBlogPost = (id) => { 
      navigate({
        pathname:  `/${path.VIEW_POST}`,
        search: createSearchParams({id}).toString()
      })
     }

    return (
        <div className='w-main mb-8'>
            <div className='w-full flex gap-4 mt-2 mb-8 ml-4'>
            <img src="https://www.benchcraftcompany.com/images/CG5_size.jpg"
                className='flex-1 h-[220px] w-[160px] object-cover'
            />
            <img src="https://www.benchcraftcompany.com/images/CG1_size.jpg"
                className='flex-1 h-[220px] w-[160px] object-cover'
            />
            </div>
            <Button style='px-6 rounded-md text-white bg-blue-400 font-semibold py-1 flex gap-2 my-5' handleOnclick={()=>backToHomepage()}><FaBackward /><FaHome /></Button>  
            <div className='w-full flex flex-row'>
              <div className='w-2/3'>
                  <h2 className='text-[18px] py-[15px] font-semibold border-b-2 border-main'>Reading {`> ${post?.title}`}</h2>
                  <br></br>
                  <h3 className="font-bold text-3xl text-left">{post?.title || 'Title'}</h3>
                  <br></br>
                  <span className='flex gap-4 border-b-2 border-main p-2'>
                    <p className="font-semibold text-lg text-left flex gap-2"><span><FaClock /></span> {(new Date(post?.createdAt)).toLocaleDateString("en-US") || 'Date'}</p>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <p className="font-semibold text-lg text-left flex gap-2"><span><FaPencilAlt/></span>: {post?.author || 'Unknown Author'}</p>
                    {/* <span>I Like This:</span> */}
                    {/* <span className='w-1/3'></span> */}
                  </span>
                  {/* <hr></hr> */}
                  <span className='flex gap-4 mt-4'>
                    <p className="text-lg">React Post:</p>
                    <p className="font-semibold text-xl text-left flex"><span onClick={() => { setLiked(prev => !prev); triggerReaction("like"); }}><FaRegThumbsUp  color={liked ? 'orange' : 'lightgrey'}/></span>: {post?.likes.length || 0}</p>
                    {/* &nbsp;&nbsp;&nbsp;&nbsp; */}
                    <p className="font-semibold text-xl text-left flex"><span onClick={() => { setDisliked(prev => !prev); triggerReaction("dislike"); }}><FaRegThumbsDown color={disliked ? 'orange' : 'lightgrey'}/></span>: {post?.dislikes.length || 0}</p>
                    {/* <span>I Like This:</span> */}
                    <span className='flex gap-4'>
                    <p className="text-lg">Share Post:</p>
                    <p className="font-semibold text-xl text-left flex"><span onClick={() => { setLiked(prev => !prev); triggerReaction("like"); }}><FaFacebook  color='blue'/></span></p>
                    {/* &nbsp;&nbsp;&nbsp;&nbsp; */}
                    <p className="font-semibold text-xl text-left flex"><span onClick={() => { setDisliked(prev => !prev); triggerReaction("dislike"); }}><FaGithub color='violet'/></span></p>
                    {/* <span>I Like This:</span> */}
                    {/* <span className='w-1/3'></span> */}
                  </span>
                  </span>
                  <MultiSelect
                    title='  '
                    label='  '
                    id='assigned_tags'
                    options={[]}
                    onChangee={() => {}}
                    values={'Content'}
                  />
                  {/* <span className='w-1/2'>

                    <span>I Don't Like This</span>
                    
                  </span> */}
                  <br></br>
                  {post?.content?.length === 1 
                  &&
                  <p className='text-lg line-clamp-[10] mb-8 text-left bg-slate-300 p-5' dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(post?.content[0])}}></p>}
                      <br></br>
                  <span className="flex justify-center">
                    {/* <span>Share This Post Via:</span>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="flex gap-4">
                      <FaRegTrashAlt color="blue"/>
                      <FaRegTrashAlt color="blue"/>
                      <FaRegTrashAlt color="blue"/>
                      <FaRegTrashAlt color="blue"/>
                    </span> */}
                  </span>

                  <h2 className='text-[20px] border-b-2 border-main w-full font-semibold'>Post From</h2>
                  {post?.provider_id ?
                  (<ServiceBlogIntroCard 
                    provider={post?.provider_id}
                  />) : <p className='text-main text-center'>Provider Details Not Found!</p>
                  }

                  <h2 className='text-[20px] border-b-2 border-main w-full font-semibold mt-5'>Comments</h2>
              </div>
              <div className='w-1/3 flex flex-col gap-4 justify-items-center justify-start items-center border-l-2 border-main pl-5'>
                <h2 className='text-[18px] border-b-2 border-main w-full text-center font-semibold'>Other Trending Posts</h2>
                {currBlogList && currBlogList.map(
                  blog => {
                    return (
                      <div className='post-item flex flex-col justify-start p-2 hover:bg-slate-300 rounded-md gap-4'
                      onClick={() => {handleChooseBlogPost(blog?._id);}}>
                        <img src={blog?.thumb} className='gap-0.5 min-w-64 mr-5'/>
                        <div>
                          <h3 className="font-bold text-red-500 text-lg text-center">{blog?.title || 'Title'}</h3>
                          <h5 className="font-semibold text-md text-center">{(new Date(blog?.createdAt)).toLocaleDateString("en-US") || 'Date'}</h5>
                          {/* <span> */}
                            {/* <div className="flex flex-row justify-start gap-2"><FaRegThumbsUp /> {blog?.likes?.length || 0} - <FaRegThumbsDown /> {blog?.dislikes?.length || 0}</div> */}
                            {/* <h5 className="font-semibold text-md"><</h5> */}
                          {/* </span> */}
                          <br></br>
                          {/* {blog?.content?.length > 0 
                          &&
                          <div className='text-sm line-clamp-[10] mb-8' dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(blog?.content[0])}}></div>} */}

                          {/* <div className='w'> */}
                            {/* {blog?.tags?.map(label =>
                                (<span className='bg-green-500 p-3 mr-3 rounded-full w-1/2'>
                                  {label}
                                </span>)
                            )} */}
                          {/* </div> */}
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </div>
      </div>
      )
}

export default ViewBlog