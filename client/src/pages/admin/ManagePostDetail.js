import React, { useEffect, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { apiGetOneBlog } from 'apis/blog';
import moment from 'moment';
import DOMPurify from 'dompurify';
import { Pagination } from 'components';
import { FiCalendar, FiUser, FiBriefcase, FiClock, FiDollarSign } from 'react-icons/fi';
import { IoIosTimer } from "react-icons/io";
import { FaTags } from "react-icons/fa";
import { AiOutlineUser, AiOutlineTeam } from 'react-icons/ai';  // New icons for Customer and Staff
import path from 'ultils/path';
import withBaseComponent from 'hocs/withBaseComponent';
import Button from 'components/Buttons/Button';

const ManagePostDetail = ({ dispatch, navigate }) => {
  const [params] = useSearchParams();
  const [post, setPost] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
    
    // "<h1> Cai Nay La H1</h1>",
    // ["</br>"],
    // "<p>Fresh Herb and skillful practioner will bring you best experience</p>",
    // "<strong> Cai Nay La Strong</strong>"
  

  const fetchPostData = async () => {
    const response = await apiGetOneBlog(params?.get('id'));
    if (response?.success) {
      setPost(response?.blog);
    } else {

    }
    // setPost()
  };

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    fetchPostData(searchParams);
  }, [params]);

  const handleOnClickEdit = (id) => {
    navigate({
      pathname: `/${path.ADMIN}/${path.EDIT_POST_DETAIL}`,
      search: createSearchParams({ id }).toString()
    });
  };

  return (
    <div className='w-full flex flex-col gap-6 relative'>
      <div className='p-4 border-b w-full flex justify-between items-center fixed top-0 bg-black z-30 shadow-lg'>
        <h1 className='text-3xl font-bold tracking-tight text-white'>Post Detail</h1>
      </div>
      <div className='mt-24 mx-auto w-full max-w-5xl p-4'>
        <div
          className='cursor-pointer w-full p-6 border rounded-lg shadow-md flex justify-between gap-4 h-fit text-gray-700 bg-white'
        >
          <div className='flex flex-col gap-4'>
            {/* <div className='flex items-center gap-2'>
              <span><strong className='text-main text-xl'>Id: {post?._id}</strong></span>
            </div> */}
            <div className='flex items-center gap-2'>
              <span><strong className='text-main text-xl'>Title: {post?.title}</strong></span>
            </div>
            <div className='flex items-center gap-2'>
              <AiOutlineUser className='text-xl text-blue-400' />
              <span><strong>Like:</strong> {`${post?.likes?.length}`}&nbsp;&nbsp;&nbsp;</span>
              <span><strong>Dislike:</strong> {`${post?.dislikes?.length}`}</span>
            </div>
            {/* <div className='flex items-center gap-2'>
              <FiBriefcase className='text-xl text-teal-400' />
              <span><strong className='text-gray-700'>Description:</strong> {post?.content}</span>
            </div> */}
            {/* <div className='flex items-center gap-2'>
              <FaTags className='text-xl text-purple-400' />
              <span><strong className='text-gray-700'>Service Name:</strong> {post?.info[0]?.service?.name}</span>
            </div> */}
            {/* <div className='flex items-center gap-2'>
              <IoIosTimer className='text-xl text-orange-400' />
              <span><strong className='text-gray-700'>Duration:</strong> {`${post?.info[0]?.service?.duration} min`}</span>
            </div> */}
            {/* <div className='flex items-center gap-2 relative'
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}>
              <AiOutlineTeam className='text-xl text-yellow-40' />
              <span><strong className='text-gray-700'>Staff:</strong> {`${post?.info[0]?.staff?.lastName} ${post?.info[0]?.staff?.firstName}`}</span>
              {showTooltip && (
                <div className='absolute bg-white border-2 border-gray-400 shadow-sm p-4 top-10 left-10 rounded-md flex gap-4 z-50'>
                  <div className='flex items-center'>
                    <img src={post?.info[0]?.staff?.avatar} alt='Avatar' className='w-12 h-12 rounded-full' />
                  </div>
                  <div className='flex flex-col text-gray-700'>
                    <div><strong>Name:</strong> {`${post?.info[0]?.staff?.lastName} ${post?.info[0]?.staff?.firstName}`}</div>
                    <div><strong>Email:</strong> {post?.info[0]?.staff?.email}</div>
                    <div><strong>Mobile:</strong> {post?.info[0]?.staff?.mobile}</div>
                  </div>
                </div>
              )}
            </div> */}
            <div className='flex items-center gap-2'>
              <FiCalendar className='text-xl text-pink-400' />
              <span><strong className='text-gray-700'>Last Modified:</strong> {moment(post?.createdAt, 'HH:mm').format('hh:mm A')} {moment(post?.createdAt).format('MMMM Do YYYY')}</span>
            </div>
            <div>
              <Button style='px-6 rounded-md text-white bg-blue-500 font-semibold h-fit py-2 w-fit' handleOnclick={() => {handleOnClickEdit(post?._id)}}>Edit this Post</Button>
            </div>
            {/* <div className='flex items-center gap-2'>
              <FiDollarSign className='text-xl text-green-400' />
              <span><strong className='text-gray-700'>Total price:</strong> {`${formatPrice(formatPricee(post?.info[0]?.service?.price))} VND`}</span>
            </div> */}
          </div>
          {/* <div className='mt-4'>
            <img className='w-96 h-56 object-cover border-2 border-gray-300 rounded-md shadow-lg animate-shadow-drop-2-center hover:animate-shadow-pop-tr' src={post?.info[0]?.service?.thumb} />
          </div> */}
        </div>
      </div>
      <h3 className='text-xl font-bold tracking-tight text-white p-4'>Blog Post Content</h3>
      {/* <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Content</label>
      <textarea id="message" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your thoughts here..."></textarea> */}
          <ul className='text-sm text-gray-500 list-square pl-4'>
            {post?.content?.length > 1 
              &&
            post?.content?.map(el=>(
              <li className=' leading-6' key={el}>{el}</li>
            )) }
            {post?.content?.length === 1 
              &&
            <div className='text-sm line-clamp-[10] mb-8' dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(post?.content[0])}}></div>}
          </ul>
    </div>
  );
};

export default withBaseComponent(ManagePostDetail);