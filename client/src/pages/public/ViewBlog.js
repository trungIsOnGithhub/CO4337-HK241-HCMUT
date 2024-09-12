import React, {useState,useEffect} from 'react'
import { Button } from '../../components'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { apiGetOneBlog  } from '../../apis/blog'
import { toast } from 'react-toastify'
import DOMPurify from 'dompurify';
import path from 'ultils/path';
import { FaRegTrashAlt, FaRegThumbsDown, FaRegThumbsUp } from 'react-icons/fa'
import {useSelector } from 'react-redux'

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
            <Button style='px-6 rounded-md text-white bg-blue-500 font-semibold h-fit py-2' handleOnclick={()=>backToHomepage()}>Back To Homepage</Button>  
            <div className='w-full'>
                <h2 className='text-[18px] font-semibold py-[15px] border-b-2 border-main'>READING</h2>
                <br></br>
                <h3 className="font-bold text-3xl text-center">{post?.title || 'Title'}</h3>
                <br></br>
                <span>
                  <p className="font-semibold text-xl text-center">Like: {post?.likes.length || 0}</p>
                  <span>I Like This:</span>
                  <span onClick={() => { setLiked(prev => !prev); triggerReaction("like"); }}><FaRegThumbsUp  color={liked ? 'orange' : 'lightgrey'}/></span>
                  {/* <span className='w-1/3'></span> */}
                </span>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <p className="font-semibold text-xl text-center">Dislike: {post?.dislikes.length || 0}</p>
                <br></br>
                <span className='w-1/2'>

                  <span>I Don't Like This</span>
                  <span onClick={() => { setDisliked(prev => !prev); triggerReaction("dislike"); }}>
                  <FaRegThumbsDown color={disliked ? 'orange' : 'lightgrey'}/></span>
                </span>
                <br></br>
                {post?.content?.length === 1 
                &&
                <p className='text-lg line-clamp-[10] mb-8 text-center' dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(post?.content[0])}}></p>}
                    <br></br>
                <span className="flex justify-center">
                  <span>Share This Post Via:</span>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="flex gap-4">
                    <FaRegTrashAlt color="blue"/>
                    <FaRegTrashAlt color="blue"/>
                    <FaRegTrashAlt color="blue"/>
                    <FaRegTrashAlt color="blue"/>
                  </span>
                </span>
            </div>
        </div>
      )
}

export default ViewBlog