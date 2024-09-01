import React from 'react'

const Blogs = () => {
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
        <div className='post-item flex flex-row justify-center p-5'>
          <img src='#' className='gap-0.5'/>
          <h3 className='ml-5'>title 1</h3>
        </div>
        <div className='post-item flex flex-row justify-center p-5'>
          <img src='#'  className='gap-0.5'/>
          <h3 className='ml-5'>title 2</h3>
        </div>
        <div className='post-item flex flex-row justify-center p-5'>
          <img src='#'/>
          <h3 className='ml-5'>title 3</h3>
        </div>
      </div>

      <div className='w-1/3 flex flex-col gap-5 justify-items-center justify-center items-center'>
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
          placeholder="Find a tag, title......" />
        </div>

        <div className="p-2 text-center text-white bg-red-600 text-semibold w-1/2 rounded-md">Top Search:</div>
        <div className="p-2 text-center text-white bg-slate-600 text-semibold w-2/3 rounded-md">Nha Hang Gan Toi</div>
        <div className="p-2 text-center text-white bg-slate-600 text-semibold w-2/3 rounded-md">Spa Khuyen Mai</div>
        <div className="p-2 text-center text-white bg-slate-600 text-semibold w-2/3 rounded-md">Gym Gia Tot</div>

      </div>
    </div>
    </div>
  )
}

export default Blogs