import React, { memo } from 'react';
import icons from '../../ultils/icon';

const Footer = () => {
  const { MdEmail } = icons;
  return (
    <div className='w-full'>
      <div className='h-[103px] w-full bg-[#0a66c2] flex justify-center items-center'>
        <div className='w-main flex items-center justify-between'>
          <div className='flex flex-col flex-1'>
            <span className='text-[20px] text-gray-100'>SIGN UP TO NEWSLETTER</span>
            <small className='text-[13px] text-gray-300'>Subscribe now and receive weekly newsletter</small>
          </div>
          <div className='flex-1 flex items-center rounded-l-full rounded-r-full border'>
            <input
              className='w-full p-4 pr-0 rounded-l-full bg-[#0a66c2] outline-none text-white font-medium placeholder:font-medium placeholder:text-gray-200 placeholder:italic placeholder:opacity-50'
              type='text'
              placeholder='Email address'
            />
            <div className='h-[56px] w-[56px] bg-[#0a66c2] rounded-r-full flex items-center justify-center text-white'>
              <MdEmail size={18} />
            </div>
          </div>
        </div>
      </div>
      <div className='h-[407px] w-full bg-gray-800 flex justify-center items-center text-white text-[13px]'>
        <div className='w-main flex'>
          <div className='flex-2 flex flex-col gap-2'>
            <h3 className='mt-[20px] text-[15px] font-medium border-l-2 border-[#0a66c2] pl-[15px]'>ABOUT US</h3>
            <span>
              <span>Address: </span>
              <span className='opacity-70'>Cơ sở Dĩ An – Khu đô thị Đại học Quốc Gia TP. HCM, Quận Thủ Đức, TP. HCM</span>
            </span>

            <span>
              <span>Phone: </span>
              <span className='opacity-70'>0373015428</span>
            </span>

            <span>
              <span>Mail: </span>
              <span className='opacity-70'>vien.nguyen999@hcmut.edu.vn</span>
            </span>
          </div>
          <div className='flex-1 flex flex-col gap-2'>
            <h3 className='mt-[20px] text-[15px] font-medium border-l-2 border-[#0a66c2] pl-[15px]'>INFORMATION</h3>
            <span>Typography</span>
            <span>Gallery</span>
            <span>Store Location</span>
            <span>Today's Deals</span>
            <span>Contact</span>
          </div>
          <div className='flex-1 flex flex-col gap-2'>
            <h3 className='mt-[20px] text-[15px] font-medium border-l-2 border-[#0a66c2] pl-[15px]'>INFORMATION</h3>
            <span>Help</span>
            <span>Free Shipping</span>
            <span>FAQs</span>
            <span>Return & Exchange</span>
            <span>Testimonials</span>
          </div>
          <div className='flex-1 flex flex-col gap-2'>
            <h3 className='mt-[20px] text-[15px] font-medium border-l-2 border-[#0a66c2] pl-[15px]'>#SERVICEMANAGER</h3>
            <span>#EfficientService</span>
            <span>#TrustedProviders</span>
            <span>#YourServiceHub</span>
            <span>#CustomerFirst</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Footer);
