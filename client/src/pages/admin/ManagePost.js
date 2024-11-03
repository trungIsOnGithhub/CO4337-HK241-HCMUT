import React, { useEffect, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { apiGetAllBlogs } from 'apis/blog';
import moment from 'moment';
import { Button, Pagination } from 'components';
import { FiCalendar, FiDollarSign } from 'react-icons/fi';
import { FaPlus, FaTags } from "react-icons/fa";
import { AiOutlineUser, AiOutlineTeam } from 'react-icons/ai';
import path from 'ultils/path';
import withBaseComponent from 'hocs/withBaseComponent';
import { formatPrice, formatPricee } from 'ultils/helper';
import {useSelector, useDispatch} from 'react-redux';
import { toast } from 'react-toastify';
import bgImage from '../../assets/clouds.svg'

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
      const sortedPosts = await apiGetAllBlogs({ ...params, provider_id: current?.provider_id?._id,  limit: process.env.REACT_APP_LIMIT });
      setPosts(sortedPosts?.blogs);
      // setCounts(sortedPosts?.blogs.length);
    // }
  };
  console.log(post)

  const handleOnClickDetail = (id) => {
    navigate({
      pathname: `/${path.ADMIN}/${path.MANAGE_POST_DETAIL}`,
      search: createSearchParams({ id }).toString()
    });
  };

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    fetchPost(searchParams);
  }, [params]);

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
              <span className='w-[30%]'>Blog</span>
              <span className='w-[10%]'>Category</span>
              <span className='w-[20%]'>Engagement</span>
              <span className='w-[20%]'>Views</span>
              <span className='w-[20%]'>Actions</span>
            </div>
            <div>
              {post?.map((el, index) => (
               <></>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(ManagePost);