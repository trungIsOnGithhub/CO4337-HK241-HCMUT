import React, { useEffect, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { apiGetAllBlogByAdmin, apiGetAllBlogs } from 'apis/blog';
import moment from 'moment';
import { Button, Pagination } from 'components';
import { FiCalendar, FiDollarSign, FiEdit, FiEye, FiEyeOff, FiThumbsDown, FiThumbsUp, FiTrash2 } from 'react-icons/fi';
import { FaPlus, FaTags } from "react-icons/fa";
import { AiOutlineUser, AiOutlineTeam } from 'react-icons/ai';
import path from 'ultils/path';
import withBaseComponent from 'hocs/withBaseComponent';
import { formatPrice, formatPricee } from 'ultils/helper';
import {useSelector, useDispatch} from 'react-redux';
import { toast } from 'react-toastify';
import bgImage from '../../assets/clouds.svg'
import clsx from 'clsx';

const ManagePost = ({ dispatch, navigate }) => {
  const [params] = useSearchParams();
  const [post, setPosts] = useState(null);
  const [counts, setCounts] = useState(0);
  const {current} = useSelector(state => state.user)

  const fetchPost = async (params) => {
      if (!current?.provider_id) {
        toast.success('Please Log In To Continue!');
        return;
      }
      const sortedPosts = await apiGetAllBlogByAdmin({ ...params, provider_id: current?.provider_id?._id,  limit: process.env.REACT_APP_LIMIT });
      setPosts(sortedPosts?.blogs);
      // setCounts(sortedPosts?.blogs.length);
    // }
  };

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    fetchPost(searchParams);
  }, [params]);

  const handleNavigateEditBlog = (blogId) => {
    navigate(`/admin/update_blog/${blogId}`)
  }

  const handleViewDetailBlog = (blogId) => {
    navigate({
      pathname: `/${path.ADMIN}/${path.MANAGE_POST_DETAIL}`,
      search: createSearchParams({ blogId }).toString()
    });
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, []);
  
  return (
    <div className='w-full h-full relative'>
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className='relative z-10 w-full'>
        <div className='w-full h-fit flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl h-fit font-semibold'>Manage Blog</span>
        </div>
        <div className='w-[95%] h-[702px] shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-6 py-4 flex flex-col gap-4'>
          <div className='w-full h-fit flex justify-between items-center'>
            <h1 className='text-[#00143c] font-medium text-[16px]'>Blogs</h1>
            <Button style={'px-4 py-2 rounded-md text-white bg-[#005aee] font-semibold w-fit h-fit flex gap-1 items-center'}><FaPlus /> Create Blog</Button>
          </div>
          <div className='text-[#99a1b1]'>
            <div className='w-full flex gap-1 border-b border-[##dee1e6] py-1'>
              <span className='w-[30%] flex justify-center'>Blog</span>
              <span className='w-[10%] flex justify-center'>Category</span>
              <span className='w-[20%] flex justify-center'>Engagement</span>
              <span className='w-[10%] flex justify-center'>Views</span>
              <span className='w-[10%] flex justify-center'>Status</span>
              <span className='w-[20%] flex justify-center'>Actions</span>
            </div>
            <div>
              {post?.map((el, index) => (
               <div key={index} className='w-full flex border-b border-[#f4f6fa] gap-1'>
                <div className='w-[30%] px-2 py-2 text-[#00143c] flex items-center gap-1'>
                  <img className='w-12 h-12 object-cover rounded-md' src={el?.thumb}/>
                  <span className='ml-2 line-clamp-1'>{el?.title}</span>
                </div>
                <div className='w-[10%] px-2 py-2 text-[#00143c] flex items-center justify-center'>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-[#0a66c2]">
                    {el?.category}
                  </span>
                </div>
                <div className='w-[20%] flex justify-center items-center gap-2 px-2 py-2 text-[#00143c]'>
                  <div className='flex items-center text-green-600'><FiThumbsUp className="h-4 w-4 mr-1" /></div>
                  <div className='flex items-center text-red-600'><FiThumbsDown className="h-4 w-4 mr-1" /></div>
                </div>
                <div className='w-[10%] px-2 py-2 text-[#00143c] flex justify-center items-center'>{el?.numberView}</div>
                <div className='w-[10%] px-2 py-2 text-[#00143c] flex justify-center items-center'>{el?.isHidden ? 'Hidden' : 'Visible'}</div>
                <div className='w-[20%] px-2 py-2 text-[#00143c] flex justify-center items-center gap-2'>
                  <span onClick={()=>{handleNavigateEditBlog(el?._id)}} className='text-blue-600 hover:text-blue-900 cursor-pointer'><FiEdit className="h-5 w-5" /></span>
                  <span onClick={()=>handleViewDetailBlog(el?._id)} className= "text-green-600 hover:text-green-900 cursor-pointer"><FiEye className="h-5 w-5" /></span>
                  <span className='text-red-600 hover:text-red-900 cursor-pointer'><FiTrash2 className='h-5 w-5'/></span>
                </div>
               </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(ManagePost);