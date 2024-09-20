import React, { useEffect, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { apiGetAllBlogs } from 'apis/blog';
import moment from 'moment';
import { Pagination } from 'components';
import { FiCalendar, FiDollarSign } from 'react-icons/fi';
import { FaTags } from "react-icons/fa";
import { AiOutlineUser, AiOutlineTeam } from 'react-icons/ai';
import path from 'ultils/path';
import withBaseComponent from 'hocs/withBaseComponent';
import { formatPrice, formatPricee } from 'ultils/helper';
import {useSelector, useDispatch} from 'react-redux';
import { toast } from 'react-toastify';

const ManagePost = ({ dispatch, navigate }) => {
  const [params] = useSearchParams();
  const [post, setPosts] = useState(null);
  const [counts, setCounts] = useState(0);
  const {current} = useSelector(state => state.user)
  // const [selectedMonth, setSelectedMonth] = useState(12);

  const fetchPost = async (params) => {
    // const response = await apiGetPostByAdmin({ ...params, limit: process.env.REACT_APP_LIMIT });
    // if (response?.success) {
      // const sortedPosts = response?.order?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (!current?.provider_id) {
        toast.success('Please Log In To Continue!');
        return;
      }
      const sortedPosts = await apiGetAllBlogs({ ...params, provider_id: current?.provider_id,  limit: process.env.REACT_APP_LIMIT });
      setPosts(sortedPosts?.blogs);
      setCounts(sortedPosts?.blogs.length);
    // }
  };

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

//   const filterPostsByMonth = (posts, month) => {
//     if (month === 12) return posts;
//     return posts?.filter(postItem => {
//       const postMonth = moment(postItem?.info[0]?.date, 'DD/MM/YYYY').format('M');
//       return parseInt(postMonth) === month + 1;
//     });
//   };
//   const countPostsByMonth = (posts) => {
//     if (!posts) return 0;
//     return posts?.length;
//   };

//   useEffect(() => {
//     setCounts(countPostsByMonth(filterPostsByMonth(post, selectedMonth)));
//   }, [post, selectedMonth]);

  return (
    <div className='w-full flex flex-col gap-4 relative'>
      <div className='p-4 border-b w-full flex justify-between items-center fixed top-0 bg-black z-30'>
        <h1 className='text-3xl font-bold tracking-tight text-white'>Manage Post</h1>
      </div>
      <div className='mt-24 mx-auto w-full max-w-5xl'>
        <div className="flex items-center gap-4 mb-8 justify-between pr-4">
          <div className='flex gap-2 items-center'>
            {/* <label htmlFor="monthSelect" className="text-white">Select Month:</label> */}
            {/* <select
              id="monthSelect"
              className='text-black border border-gray-300 rounded-md p-2 cursor-pointer'
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              value={selectedMonth === null ? 12 : selectedMonth}
            >
              <option value={12}>All</option>
              {moment.months().map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select> */}
          </div>
          <p className="text-blue-600 italic font-semibold">Total Posts In Current Page: {counts}</p>
        </div>
        <div className='flex gap-8 items-center flex-wrap justify-center'>
          {/* {post && filterPostsByMonth(post, selectedMonth).map((postItem, index) => ( */}
          {post && post.map((postItem, index) => (
            <div
              key={index}
              className='cursor-pointer w-[45%] p-6 border rounded-lg shadow-md flex flex-col items-center gap-4 bg-gray-200 hover:animate-scale-in-center'
              onClick={() => { handleOnClickDetail(postItem?._id) }}
            >
                <div>
                  <img className='w-[480px] h-[260px] object-cover border border-gray-500 rounded-md shadow-2xl' src={postItem?.in?.service?.thumb} />
                </div>
                <div className='flex flex-col gap-2 text-gray-700'>
                  <div className='flex items-center gap-1'>
                    <span><strong className='text-main'>{`Title: ${postItem?.title}`}</strong></span>
                  </div>
                  <span>
                    <span><strong>Category:</strong> {`${postItem?.tags.join(', ')}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  </span>
                  <span>
                    {/* <div> */}
                        <span><strong>Like:</strong> {`${postItem?.likes?.length}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <span><strong>Dislike:</strong> {`${postItem?.dislikes?.length}`}</span>
                    {/* </div> */}
                  </span>
                  <span><strong>Viewed By:</strong> {`${postItem?.numberView}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  <span><strong>Last Modified:</strong> {`${postItem?.createdAt}`}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    {/* <span><strong>Date & Time:</strong> {moment(postItem?.info[0]?.time, 'HH:mm').format('hh:mm A')} {moment(postItem?.info[0]?.date, 'D/M/YYYY').format('MMMM Do YYYY')}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> */}
                  {/* <div>
                    <span><strong>Total Price:</strong> {`${formatPrice(formatPricee(postItem?.info[0]?.service?.price))} VND`}</span>
                  </div> */}
                </div>
            </div>
          ))}
        </div>
        <div className='w-full flex justify-end mt-8'>
          <Pagination totalCount={2} />
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(ManagePost);