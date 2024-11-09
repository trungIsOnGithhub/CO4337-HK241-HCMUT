import React, {useEffect, useState, useCallback} from 'react'
import { useParams, useSearchParams, createSearchParams, useNavigate } from 'react-router-dom'
import { apiSearchServiceAdvanced, apiSearchServicePublic, apiGetServicePublic } from '../../apis'
// import { Breadcrumb, Service, SearchItemService, InputSelect, Pagination, InputField} from '../../components'
// import Masonry from 'react-masonry-css'
import { useParams, useSearchParams, createSearchParams, useNavigate} from 'react-router-dom'
import { Breadcrumb, Service, SearchItemService, NewInputSelect, InputSelect, Pagination, InputField} from '../../components'
import { sorts } from '../../ultils/constant'
import clsx from 'clsx'
import { useDispatch, useSelector } from 'react-redux'
import withBaseComponent from 'hocs/withBaseComponent'
import { getCurrent } from 'store/user/asyncAction'
import { tinh_thanhpho } from 'tinh_thanhpho'
import { apiModifyUser } from '../../apis/user'
import Swal from "sweetalert2";
import { FaSortAmountDown, FaMoneyCheckAlt, FaCubes  } from "react-icons/fa";

const Services = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [services, setServices] = useState(null)
  const [active, setActive] = useState(null)
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('');
  const [totalServiceCount, setTotalServiceCount] = useState(0);
  const [nearMeOption, setNearMeOption] = useState(false);
  const {category} = useParams();
  const {isShowModal} = useSelector(state => state.app)
  const {current} = useSelector((state) => state.user);

  const [useAdvanced, setUseAdvanced] = useState(true);
  const [searchFilter, setSearchFilter] = useState({
    term: '',
    province: '',
    maxDistance: '',
    unit: 'km'
  })
  const [clientLat, setClientLat] = useState(9999);
  const [clientLon, setClientLon] = useState(9999);
  // const prevSearchTermRef = useRef(searchFilter.term);
  const isClientLocationValid = (clientLat, clientLon, distanceText, unit) => {
    return clientLat >= -90 && clientLon >= -90 && clientLat <= 180 && clientLon <= 180
            && /^-?\d+$/.test(distanceText) && (unit === 'km' || unit === 'm');
  }

  const fetchServiceCategories = async (queries, advancedQuery) => {
    let response = [];

    if (useAdvanced) {
      const categoriesChosen = params.get("category");
      if(categoriesChosen && categoriesChosen !== 'services'){
        advancedQuery.categories = categoriesChosen;
      }

      console.log('Elastic Pre Query', advancedQuery, 'Elastic Pre Query');
      response = await apiSearchServiceAdvanced(advancedQuery);

      console.log("-----------------RESPONSE SERVICES ADVANCED:", response.services);

      if(response.success) setServices(response?.services?.hits || []);

      setTotalServiceCount(response?.services?.total?.value)
    } 
    else {
      if(category && category !== 'services'){
        queries.category = category;
      }
      response = await apiSearchServicePublic(queries);

      if(response.success) setServices(response?.services || []);
    }

    response = await apiGetServicePublic(queries)
    console.log(response)
    if(response.success) setServices(response)
    dispatch(getCurrent())
  }

  useEffect(() => {
    window.scrollTo(0,0)
    const queries = Object.fromEntries([...params]);

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
  
    console.log(`PRE FETCH === ${JSON.stringify(searchFilter)}`);
    // console.log("YYAY", params.get('page'), "udias");

    let advancedQuery = {
      searchTerm: searchFilter.term,
      limit: REACT_APP_PAGINATION_LIMIT_DEFAULT , offset: 0,
      sortBy: sort,
      // clientLat: 45, clientLon: 45,
      // distanceText: "2000km",
    };

    if (isClientLocationValid(clientLat, clientLon, searchFilter.maxDistance, searchFilter.unit)) {
      advancedQuery = {
        ...advancedQuery,
        clientLat, clientLon,
        distanceText: searchFilter.maxDistance + searchFilter.unit
      }
    }

    queries.page = 1;
    setParams(queries);

    fetchServiceCategories(q, advancedQuery);
  }, [sort, searchFilter]);

  // for page changing
  useEffect(() => {
    window.scrollTo(0,0)
    const queries = Object.fromEntries([...params]);

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

    console.log(`PRE FETCH === ${JSON.stringify(q)}`);
    // console.log("YYAY", params.get('page'), "udias");

    let advancedQuery = {
      searchTerm: searchFilter.term,
      limit: REACT_APP_PAGINATION_LIMIT_DEFAULT , offset: params.get('page')-1,
      sortBy: queries?.sort
    };

    if (isClientLocationValid(clientLat, clientLon, searchFilter.maxDistance, searchFilter.unit)) {
      advancedQuery = {
        ...advancedQuery,
        clientLat, clientLon,
        distanceText: searchFilter.maxDistance + searchFilter.unit
      }
    }

    // queries.page = params.get('page')-1;
    // setParams(queries);

    fetchServiceCategories(q, advancedQuery);
  }, [params]);
  
  const changeActive = useCallback((name)=>{
    if(name===active) setActive(null)
    else {
      setActive(name)
    }
  },[active])

  const changeValue = useCallback((value)=>{
    setSort(value)
  },[sort])

  // useEffect(() => {
  //   if(sort){
  //     navigate({
  //       pathname: `/service/${category}`,
  //       search: createSearchParams({
  //         sort
  //       }).toString()
  //     })
  //   }   
  // }, [sort]);

  useEffect(() => {
  }, [searchFilter])

  const handleGetDirections = () => {
    Swal.fire({
      title: 'Chia sẻ vị trí',
      text: "Bạn có muốn chia sẻ vị trí hiện tại của mình để xem đường đi?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Chia sẻ',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            await apiModifyUser({ lastGeoLocation: {
              type: "Point",
              coordinates: [longitude, latitude]
            } }, current._id);
            // Call the function to show the route using latitude and longitude
            // showRoute(latitude, longitude);
            setClientLat(latitude);
            setClientLon(longitude);

            setNearMeOption(prev => !prev);
          }, () => {
            Swal.fire('Không thể lấy vị trí của bạn.');
          });
        } else {
          Swal.fire('Geolocation không khả dụng.');
        }
      }
      else {

      }
    });
  };

  return (
    <div className='w-full'>
      <div className='h-[81px] flex items-center justify-center bg-gray-100'>
        <div className='w-main'>
          <h3 className='font-semibold uppercase'>{category}</h3>
          <Breadcrumb category={category} />
        </div>
      </div>
      <div className='w-main p-2 flex justify-start m-auto mt-8'>
        <div className='flex-auto flex flex-col gap-3'>
          {/* <span className='font-semibold text-sm'>Filter by:</span> */}
          <div className='flex items-center gap-4'>
            <FaMoneyCheckAlt />
            <SearchItemService name='price' activeClick={active} changeActiveFilter={changeActive} type='input'/>
            <FaCubes />
            <SearchItemService name='category' activeClick={active} changeActiveFilter={changeActive}/>
            <FaSortAmountDown />
            <NewInputSelect value={sort} options={sorts} changeValue={changeValue} />

            <div className='flex justify-start m-auto'>
                {/* <span className='font-semibold text-sm p-5'>Search By:</span> */}
                {/* <div className='w-full'> */}
                <InputField nameKey='term' value={searchFilter.term} setValue={setSearchFilter} placeholder={"Search By Name, Province..."} />
                <span className='font-semibold text-sm p-5'>Near Me Search:</span>
                <input className='ml-3 p-5' onInput={() => {handleGetDirections()}} type="checkbox"/>
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
          </div>
        </div>
        {/* <div className='flex flex-col gap-3'>
          <div className='w-full'>

          </div>
        </div> */}
      </div>
      <div className='w-main border p-4 flex justify-start m-auto mt-8'>
          <span className='font-semibold text-sm p-5'>Search By:</span>
          {/* <div className='w-full'> */}
          <InputField nameKey='term' value={searchFilter.term} setValue={setSearchFilter} placeholder={"Search By Name, Province..."} />
          <span className='font-semibold text-sm p-5'>Near Me Search:</span>
          <input className='ml-3 p-5' onInput={(event) => {
            if (event.target.checked) {
              // console.log("....", typeof event.target.value);
              handleGetDirections();
            }
            else {
              setNearMeOption(false);
              setClientLat(9999.99);
              setClientLon(9999.99);
              setSearchFilter(prev => {
                return {
                  ...prev,
                  maxDistance: '',
                  unit: 'km'
                };
              })
            }
          }} type="checkbox"/>
          { nearMeOption &&
            <>
              <span className='font-semibold text-sm p-3'>Province:</span>
              <InputSelect
                value={searchFilter?.province}
                options={Object.entries(tinh_thanhpho).map(ele => { return {id:ele[0], text:ele[1]?.name, value:ele[0]}})}
                changeValue={(value) => {setSearchFilter(function(prev) {return {...prev, province: value};}) }}
              />
            </>
          }
          { nearMeOption &&
            (
              <>
                <InputField nameKey='maxDistance' value={searchFilter.maxDistance}
                      setValue={setSearchFilter} placeholder={"Maximum Distance(optional)"} />
                <select id="unit" value={searchFilter.unit || "km"} onChange={(event) => { setSearchFilter(prev => { return {...prev, unit: event.target.value || "km"}; }) }}>
                  <option value="km">km</option>
                  <option value="m">m</option>
                </select>
              </>
            )
          }
          {/* </div> */}
        </div>
      <div className={clsx('mt-8 w-main m-auto flex gap-4 flex-wrap', isShowModal ? 'hidden' : '')}>
        {services?.services?.map((service, index) => (
          <div key={index} className='w-[32%]'>
            <Service serviceData={service}/>
          </div>
        ))}
      </div>
      <div className='w-main m-auto my-4 flex justify-end'>
      {
        services?.length && <Pagination totalCount={totalServiceCount}/>
      }
      </div>
      <div className='w-full h-[200px]'>
      </div>
    </div>

  )
}

export default Services