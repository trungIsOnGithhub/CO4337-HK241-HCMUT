import React, {useEffect, useState, useCallback} from 'react'
import { useParams, useSearchParams, createSearchParams, useNavigate} from 'react-router-dom'
import { Breadcrumb, Service, SearchItemService, InputSelect, Pagination, InputField} from '../../components'
import { apiGetServicePublic } from '../../apis'
import Masonry from 'react-masonry-css'
import { sorts } from '../../ultils/constant'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import withBaseComponent from 'hocs/withBaseComponent'
import { getCurrent } from 'store/user/asyncAction'
import { tinh_thanhpho } from 'tinh_thanhpho'

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
  const [nearMeOption, setNearMeOption] = useState(false)
  const {category} = useParams()
  const {isShowModal} = useSelector(state => state.app)
  const {current} = useSelector((state) => state.user);

  const [searchFilter, setSearchFilter] = useState({
    term: '',
    province: '',
    maxDistance: ''
  })

  const fetchServiceCategories = async (queries) =>{
    if(category && category !== 'services'){
      queries.category = category
    }
    if (searchFilter.term) {
      queries.name = searchFilter.term
    }
    if (nearMeOption && searchFilter.province) {
      queries.province = tinh_thanhpho[searchFilter.province].name
    }
    if (nearMeOption && current?.lastGeoLocation?.coordinates?.length === 2) {
      queries.current_client_location = {
        longtitude: current.lastGeoLocation.coordinates[0],
        lattitude: current.lastGeoLocation.coordinates[1]
      }
      if (searchFilter?.maxDistance && !isNaN(parseFloat(searchFilter.maxDistance))) {
        queries.current_client_location.maxDistance = searchFilter.maxDistance;
      }
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
  }, [params, searchFilter, nearMeOption])
  
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

  useEffect(() => {
    console.log('Search Filter: ', searchFilter, '++++');
  }, [searchFilter])

  return (
    <div className='w-full'>
      <div className='h-[81px] flex items-center justify-center bg-gray-100'>
        <div className='w-main'>
          <h3 className='font-semibold uppercase'>{category}</h3>
          <Breadcrumb category={category} />
        </div>
      </div>
      <div className='w-main border p-4 flex justify-start m-auto mt-8'>
        <div className='flex-auto flex flex-col gap-3'>
          <span className='font-semibold text-sm'>Filter by:</span>
          <div className='flex items-center gap-4'>
          <SearchItemService name='price' activeClick={active} changeActiveFilter={changeActive} type='input'/>
          <SearchItemService name='category' activeClick={active} changeActiveFilter={changeActive}/>
          </div>
        </div>
        <div className='flex flex-col gap-3'>
          <span className='font-semibold text-sm'>Sort by:</span>
          <div className='w-full'> 
            <InputSelect value={sort} options={sorts} changeValue={changeValue} />
          </div>
        </div>
      </div>
      <div className='w-main border p-4 flex justify-start m-auto mt-8'>
          <span className='font-semibold text-sm p-5'>Search By:</span>
          {/* <div className='w-full'> */}
          <InputField nameKey='term' value={searchFilter.term} setValue={setSearchFilter} placeholder={"Search By Name, Province..."} />
          <span className='font-semibold text-sm p-5'>Near Me:</span>
          <input className='ml-3 p-5' onInput={() => {setNearMeOption(prev => !prev);}} type="checkbox"/>
          { nearMeOption && 
            <>
              <span className='font-semibold text-sm p-3'>Province:</span>
              <InputSelect
                value={searchFilter?.province}
                options={Object.entries(tinh_thanhpho).map(ele => { return {id:ele[0], text:ele[1]?.name, value:ele[0]}})}
                changeValue={(value) => {console.log(value); setSearchFilter(function(prev) {return {...prev, province: value};}) }}
              />
            </>
          }
          { nearMeOption && <InputField nameKey='maxDistance' value={searchFilter.maxDistance} setValue={setSearchFilter} placeholder={"Maximum Distance(optional)"} /> }
          {/* </div> */}
        </div>
      <div className={clsx('mt-8 w-main m-auto', isShowModal ? 'hidden' : '')}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid flex mx-[-10px]"
          columnClassName="my-masonry-grid_column">
          {services?.services?.map(el => (
            <Service 
              key={el.sv._id} 
              serviceData={el.sv}
              pid= {el.sv._id}
              normal={true}
              clientDistance={el?.clientDistance}
            />
          )) || "Your Search Result Here..."}
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