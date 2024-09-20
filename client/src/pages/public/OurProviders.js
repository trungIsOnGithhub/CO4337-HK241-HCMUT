import { apiGetServiceProviders } from 'apis';
import clsx from 'clsx';
import { Breadcrumb, Pagination, Provider } from 'components';
import React, { useEffect, useState } from 'react'
import Masonry from 'react-masonry-css';
import { useParams, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const OurProviders = () => {
  const [allProviders, setAllProviders] = useState(null)
  const {category} = useParams()
  const [params] = useSearchParams()

  const fetchProviders = async (queries) =>{
    const response = await apiGetServiceProviders(queries)
    if(response.success){
      setAllProviders(response)
    }
  }

  useEffect(() => {
    window.scrollTo(0,0)
    const queries = Object.fromEntries([...params])
    fetchProviders(queries)

  }, [params])

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  
  useEffect(() => {
    const fetchAllServiceProvider = async () => {
      const response = await apiGetServiceProviders()
      if(response?.success){
        setAllProviders(response)
        setTotalProvider(response?.counts)
      }
    }
    fetchAllServiceProvider()
  }, []);

  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [totalProvider, setTotalProvider] = useState(0)

  useEffect(() => {
    // Yêu cầu người dùng chia sẻ vị trí
    Swal.fire({
      title: 'Chia sẻ vị trí',
      text: "Bạn có muốn chia sẻ vị trí hiện tại của mình?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Chia sẻ',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setLatitude(latitude);
            setLongitude(longitude);
          }, () => {
            Swal.fire('Không thể lấy vị trí của bạn.');
          });
        } else {
          Swal.fire('Geolocation không khả dụng.');
        }
      }
    });
  }, []);



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
          {allProviders?.AllServiceProviders?.map(el => (
            <Provider
              key={el._id} 
              providerData={el}
              provider_id= {el._id}
              normal={true}
              userLatitude = {latitude}
              userLongitude = {longitude}
             />
          ))}
        </Masonry>
      </div>
      <div className='w-main m-auto my-4 flex justify-end'>
       {allProviders &&
       <Pagination
        totalCount={totalProvider}/>}
      </div>
    </div>
  )
}

export default OurProviders