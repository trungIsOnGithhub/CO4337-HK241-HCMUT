// import React from 'react'
// import { Outlet } from 'react-router-dom';

// const DetailProvider = () => {
//   return (
//     <div className='w-full'>
//         <div className={clsx('w-full fixed top-0 left-0 h-[86px] flex justify-center z-[100]', providerData?.theme === 'dark' && 'bg-[#212529] text-white')}>
//           <div className='w-[90%] h-full flex gap-10 items-center text-[15px]'>
//             <span onClick={()=>{navigate(`/detail_provider/service/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'service' && 'border-b-2 border-[#15a9e8]')}>Service</span>
//             <span onClick={()=>{navigate(`/detail_provider/book/${providerData?._id}`); setBooking(null); setBookingDateTime(null); setDetailService(null); setSelectedStaff({time: null,date: null,staff: null}) }} className={clsx('font-semibold cursor-pointer capitalize', variable === 'book' && 'border-b-2 border-[#15a9e8]')}>Book Now</span>
//             <span onClick={()=>{navigate(`/detail_provider/product/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'product' && 'border-b-2 border-[#15a9e8]')}>Product</span>
//             <span onClick={()=>{navigate(`/detail_provider/blog/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'blog' && 'border-b-2 border-[#15a9e8]')}>Blog</span>
//             <span onClick={()=>{navigate(`/detail_provider/find-us/${providerData?._id}`)}} className={clsx('font-semibold cursor-pointer capitalize', variable === 'find-us' && 'border-b-2 border-[#15a9e8]')}>Find us</span>
//           </div>
//         </div>
//         <Outlet />
//         {/*  */}
//       </div>
//   )
// }

// export default DetailProvider
