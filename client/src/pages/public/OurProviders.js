import { apiGetServiceProviders } from 'apis';
import clsx from 'clsx';
import { Breadcrumb } from 'components';
import React, { useEffect, useState } from 'react'
import Masonry from 'react-masonry-css';
import { useParams } from 'react-router-dom';

const OurProviders = () => {
  const [allProviders, setAllProviders] = useState([])
  const {category} = useParams()

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  
  useEffect(() => {
    const fetchAllServiceProvider = async () => {
      const response = await apiGetServiceProviders()
      setAllProviders(response?.AllServiceProviders)
    }
    fetchAllServiceProvider()
  }, []);


  console.log(category)
  return (
    <div className='w-full'>
      <div className='h-[81px] flex items-center justify-center bg-gray-100'>
        <div className='w-main'>
          <h3 className='font-semibold uppercase'>{category.replace('_',' ')}</h3>
          <Breadcrumb category={category.replace('_',' ')} />
        </div>
      </div>
      <div className='w-main border p-4 flex justify-between m-auto mt-8'>
        search
      </div>
      <div className={clsx('mt-8 w-main m-auto')}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid flex mx-[-10px]"
          columnClassName="my-masonry-grid_column">
          {allProviders?.map(el => (
            <img src={el.images[0]} alt='' />
          ))}
        </Masonry>
      </div>
    </div>
  )
}

export default OurProviders