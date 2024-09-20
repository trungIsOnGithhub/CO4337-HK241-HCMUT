import React, {useEffect, useState, useCallback} from 'react'
import { useParams, useSearchParams, createSearchParams, useNavigate} from 'react-router-dom'
import { Breadcrumb, Service, SearchItemService, InputSelect, Pagination} from '../../components'
import { apiGetServicePublic } from '../../apis'
import Masonry from 'react-masonry-css'
import { sorts } from '../../ultils/constant'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import withBaseComponent from 'hocs/withBaseComponent'
import { getCurrent } from 'store/user/asyncAction'

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const Services = ({dispatch}) => {
  const navigate = useNavigate()
  const [services, setServices] = useState(null)
  const [active, setActive] = useState(null)
  const [params] = useSearchParams()
  const [sort, setSort] = useState('')
  const {category} = useParams()
  const {isShowModal} = useSelector(state => state.app)


  const fetchServiceCategories = async (queries) =>{
    if(category && category !== 'services'){
      queries.category = category
    }
    const response = await apiGetServicePublic(queries)
    if(response.success) setServices(response)
    dispatch(getCurrent())
  }

  useEffect(() => {
    window.scrollTo(0,0)
    const queries = Object.fromEntries([...params])
    let priceQuery =  {}
    if(queries.to && queries.from){
      priceQuery = {$and: [
        {price: {gte: queries.from}},
        {price: {lte: queries.to}},
      ]}
      delete queries.price
    }
    else{
      if(queries.from) queries.price = {gte:queries.from}
      if(queries.to) queries.price = {gte:queries.to}
    }
    delete queries.from
    delete queries.to
    const q = {...priceQuery, ...queries}
    fetchServiceCategories(q)
  }, [params])
  
  const changeActive = useCallback((name)=>{
    if(name===active) setActive(null)
    else {
      setActive(name)
    }
  },[active])

  const changeValue = useCallback((value)=>{
    setSort(value)
  },[sort])

  useEffect(() => {
    if(sort){
      navigate({
      pathname: `/service/${category}`,
      search: createSearchParams({
        sort
      }).toString()
      }) 
    }   
  }, [sort])
  
  return (
    <div className='w-full'>
      <div className='h-[81px] flex items-center justify-center bg-gray-100'>
        <div className='w-main'>
          <h3 className='font-semibold uppercase'>{category}</h3>
          <Breadcrumb category={category} />
        </div>
      </div>
      <div className='w-main border p-4 flex justify-between m-auto mt-8'>
        <div className='w-4/5 flex-auto flex flex-col gap-3'>
          <span className='font-semibold text-sm'>Filter by:</span>
          <div className='flex items-center gap-4'>
          <SearchItemService name='price' activeClick={active} changeActiveFilter={changeActive} type='input'/>
          <SearchItemService name='category' activeClick={active} changeActiveFilter={changeActive}/>
          </div>
        </div>
        <div className='w-1/5 flex flex-col gap-3'>
          <span className='font-semibold text-sm'>Sort by:</span>
          <div className='w-full'> 
            <InputSelect value={sort} options={sorts} changeValue={changeValue} />
          </div>
        </div>
      </div>
      <div className={clsx('mt-8 w-main m-auto', isShowModal ? 'hidden' : '')}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid flex mx-[-10px]"
          columnClassName="my-masonry-grid_column">
          {services?.services?.map(el => (
            <Service 
              key={el._id} 
              serviceData={el}
              normal={true}
            />
          ))}
        </Masonry>
      </div>
      <div className='w-main m-auto my-4 flex justify-end'>
       {services&&
       <Pagination 
       totalCount={services?.counts}/>}
      </div>
      <div className='w-full h-[200px]'>
      </div>
    </div>

  )
}

export default withBaseComponent(Services)