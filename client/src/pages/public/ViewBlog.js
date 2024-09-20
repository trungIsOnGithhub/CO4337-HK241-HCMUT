import React, {useState,useEffect} from 'react'
import { Button, MultiSelect } from '../../components'
import { useSearchParams, useNavigate, createSearchParams } from 'react-router-dom'
import { apiGetOneBlog, apiGetTopBlogs, apiLikeBlog, apiDislikeBlog, apiAddBlogComment } from '../../apis/blog'
import DOMPurify from 'dompurify';
import path from 'ultils/path';
import { FaRegTrashAlt, FaRegThumbsDown, FaRegThumbsUp, FaClock, FaPencilAlt, FaBackward, FaHome, FaFacebook } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { FaGithub } from 'react-icons/fa6'
import ServiceBlogIntroCard from '../../components/Services/ServiceBlogIntroCard'
import CommentBlog from '../../components/Vote/CommentBlog.js'
import Swal from 'sweetalert2'
import avatar from 'assets/avatarDefault.png'

const ViewBlog = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [post, setPost] = useState(null);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const {current} = useSelector(state => state.user)
    const {isLogin} = useSelector(state => state.user)
    const [comment, setComment] = useState('');
      
      // "<h1> Cai Nay La H1</h1>",
      // ["</br>"],
      // "<p>Fresh Herb and skillful practioner will bring you best experience</p>",
      // "<strong> Cai Nay La Strong</strong>"
    const [currBlogList, setCurrBlogList] = useState([]);
    const fetchCurrentBlogList = async (search, selectedTags) => {
      // setIsLoading(true);
      let response = await apiGetTopBlogs({ limit: 5 });
      if(response?.success && response?.blogs){
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

    const triggerReaction = async (reaction) => {
      if (reaction === 'like') {
        let response = await apiLikeBlog({_id: current?._id, bid: params?.get('id') });

        if (!response?.success) {
          Swal.fire('Error Ocurred!!', 'Like This Post Not Success!!', 'error')
          setLiked(false);
        }
        else {
          setPost(response.rs);
        }
      }
      else if (reaction === 'dislike') {
        let response = await apiDislikeBlog({_id: current?._id, bid: params?.get('id') });

        if (!response?.success) {
          Swal.fire('Error Ocurred!!', 'Dislike This Post Not Success!!', 'error');
          setDisliked(false);
        }
        else {
          setPost(response.rs);
        }
      }
    }

    const handleChooseBlogPost = (id) => { 
      navigate({
        pathname:  `/${path.VIEW_POST}`,
        search: createSearchParams({id}).toString()
      })
     }


    const submitComment = async(comment)=>{
        if(!comment) {
            Swal.fire('Error Ocurred!!', 'Comment Cannot Be Empty!!', 'error')
            return;
        }
        let response = await apiAddBlogComment({comment, bid: params?.get('id'), uid: current?._id, updatedAt:Date.now()});

        if (!response?.success) {
          Swal.fire('Error Ocurred!!', 'Error Making Comments!!', 'error')
        }
        else {
          setComment('');
          fetchPostData();
          Swal.fire('Success', 'Comment Successfully!!', 'success')
        }
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
              <div className='w-3/4'>
                  <h2 className='text-[18px] py-[15px] font-semibold border-b-2 border-main'>Reading {`> ${post?.title}`}</h2>
                  <br></br>
                  <h3 className="font-bold text-3xl text-left">{post?.title || 'Title'}</h3>
                  <br></br>
                  <span className='flex gap-4 border-b-2 border-main p-2'>
                    <p className="font-semibold text-lg text-left flex gap-2"><span><FaClock /></span> {(new Date(post?.createdAt)).toLocaleDateString("en-US") || 'Date'}</p>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <p className="font-semibold text-lg text-left flex gap-2"><span><FaPencilAlt/></span>: {(post?.author?.firstName + post?.author?.lastName) || 'Unknown Author'}</p>
                    {/* <span>I Like This:</span> */}
                    {/* <span className='w-1/3'></span> */}
                  </span>
                  {/* <hr></hr> */}
                  <span className='flex gap-4 mt-4'>
                    <p className="text-lg">React Post:</p>
                    <p className="font-semibold text-xl text-left flex"><span onClick={() => {
                      setLiked(prev => !prev);
                      setDisliked(false);
                      triggerReaction("like"); }}>
                    <FaRegThumbsUp  color={liked ? 'orange' : 'lightgrey'}/></span>: {post?.likes.length || 0}</p>
                    {/* &nbsp;&nbsp;&nbsp;&nbsp; */}
                    <p className="font-semibold text-xl text-left flex"><span onClick={() => {
                      setDisliked(prev => !prev);
                      setLiked(false);
                      triggerReaction("dislike"); }}><FaRegThumbsDown color={disliked ? 'orange' : 'lightgrey'}/></span>: {post?.dislikes.length || 0}</p>
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
                  <div id='post_content' className='text-lg text-left bg-slate-300 p-8 m-4 rounded-md shadow-md' dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(post?.content[0])}}></div>}
                      <br></br>
                <span className="flex justify-center">
                </span>

                  <h2 className='text-[20px] border-b-2 border-main w-full font-semibold'>Post From</h2>
                  {post?.provider_id ?
                  (<ServiceBlogIntroCard 
                    provider={post?.provider_id}
                  />) : <p className='text-main text-center'>Provider Details Not Found!</p>
                  }

                  <h2 className='text-[20px] border-b-2 border-main w-full font-semibold mt-5'>Comments</h2>
                  <div className='w-full'>
                  <div className='p-4 flex items-center justify-center text-sm flex-col gap-2'>
                  <div onClick={e=> e.stopPropagation()} className='bg-white w-[700px] p-6 flex flex-row gap-4 items-center justify-center rounded-md border border-gray-500 shadow-md animate-scale-up-center'>
                    <div className='w-fit m-0 p-4'>
                      <img src={avatar} alt="avatar" className='w-[50px] h-[50px] object-cover rounded-full'></img>
                    </div>
                    <div className='w-4/5 m-0 flex flex-col'>
                      <textarea 
                        onChange={e=>setComment(e.target.value)}
                        value = {comment}
                        className='form-textarea w-full placeholder:italic placeholder:text-sm placeholder:text-gray-500'
                        placeholder='Type something ...'
                      ></textarea>
                      <Button fullWidth handleOnclick={()=>{submitComment(comment)}}>Submit</Button>
                    </div>
                  </div>
                  </div>
                  <h2 className='my-5 font-semibold text-xl border-main'>All Comments</h2>

                  <div className='flex flex-col gap-2'>
                      {post?.comments?.map(el=>(
                          <CommentBlog
                              // key = {el._id}
                              // star = {el.star}
                              updatedAt = {el?.updatedAt}
                              comment = {el?.comment}
                              name={`${el?.postedBy?.lastName} ${el?.postedBy?.firstName}`}
                          />
                      ))}
                  </div>
                  </div>
              </div>
              <div className='w-1/4 flex flex-col gap-4 justify-items-center justify-start items-center border-l-2 border-main pl-5'>
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