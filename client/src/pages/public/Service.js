import React, {useEffect, useState, useCallback} from 'react'
import { useParams, useSearchParams, createSearchParams, useNavigate } from 'react-router-dom'
import { apiSearchServiceAdvanced, apiSearchServicePublic, apiGetServicePublic, apiGetCategorieService } from '../../apis'
// import { Breadcrumb, Service, SearchItemService, InputSelect, Pagination, InputField} from '../../components'
// import Masonry from 'react-masonry-css'
// import { useParams, useSearchParams, createSearchParams, useNavigate} from 'react-router-dom'
import { Breadcrumb, Service, SearchItemService, NewInputSelect, InputSelect, Pagination, InputField, InputFormm} from '../../components'
// import { apiGetServicePublic,  } from '../../apis'
// import { sorts } from '../../ultils/constant'
import Select from 'react-select';
import clsx from 'clsx'
import { useDispatch, useSelector } from 'react-redux'
// import withBaseComponent from 'hocs/withBaseComponent'
import { getCurrent } from 'store/user/asyncAction'
import { tinh_thanhpho } from 'tinh_thanhpho'
import { apiModifyUser } from '../../apis/user'
import Swal from "sweetalert2";
import Button from 'components/Buttons/Button';
import { FaSortAmountDown, FaMoneyCheckAlt, FaCubes, FaBahai, FaSearch  } from "react-icons/fa";
import ToggleButton from './ToggleButton';

const REACT_APP_PAGINATION_LIMIT_DEFAULT = process.env.REACT_APP_PAGINATION_LIMIT_DEFAULT;
const Services = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [services, setServices] = useState(null)
  // const [active, setActive] = useState(null)
  const [params] = useSearchParams()
  const [sort, setSort] = useState('')
  const [nearMeOption, setNearMeOption] = useState(false)
  const {category} = useParams()
  const {isShowModal} = useSelector(state => state.app);
  const [filterCateg, setFilterCateg] = useState([]);
  const {current} = useSelector((state) => state.user);
  const [svCategories, setSvCategories] = useState([]);

  const [searchedClick, setSearchedClick] = useState(0);
  const [searchFilter, setSearchFilter] = useState({
    term: '',
    province: '',
    maxDistance: '',
    unit: 'km'
  });
  const [clientLat, setClientLat] = useState(999999);
  const [clientLon, setClientLon] = useState(999999);
  const [totalServiceCount, setTotalServiceCount] = useState(0);

  // const prevSearchTermRef = useRef(searchFilter.term);
  const isClientLocationValid = (clientLat, clientLon, distanceText, unit) => {
    return clientLat >= -90 && clientLon >= -90 && clientLat <= 180 && clientLon <= 180
            && /^-?\d+$/.test(distanceText) && (unit === 'km' || unit === 'm');
  }

  const fetchServicesAdvanced = async (queries, advancedQuery) => {
    let response = [];
    const currerntParamPage = params.get('page');

    const offset = currerntParamPage > 0 ? currerntParamPage - 1 : 0;

    // if (useAdvanced) {
      const categoriesChosen = filterCateg.map(cat => cat.value);
      // if(categoriesChosen){
      //   advancedQuery.categories = categoriesChosen;
      // }
  // const fetchServicesAdvanced = async (queries) =>{
  //   if (sort) {
  //     queries.sort = sort;
  //   }
  //   if(category && category !== 'services'){
  //     queries.categories = filterCateg;
  //   }
    // if (searchFilter.term) {
    //   queries.name = searchFilter.term
    // }
    if (nearMeOption && searchFilter.province) {
      queries.province = tinh_thanhpho[searchFilter.province].name
    }

    if (nearMeOption && current?.lastGeoLocation?.coordinates?.length === 2) {
      queries.current_client_location = {
        longtitude: current.lastGeoLocation.coordinates[0],
        lattitude: current.lastGeoLocation.coordinates[1]
      }

      // console.log('Elastic Pre Query', advancedQuery, 'Elastic Pre Query');
      response = await apiSearchServiceAdvanced(advancedQuery);

      // console.log("-----------------RES ADVANCED:", response.services);

      if(response.success) setServices(response?.services?.hits || []);

      setTotalServiceCount(response?.services?.total?.value)
    } 
    else {
      if(category && category !== 'services'){
        queries.category = category;
      }
      // console.log('Elastic Pre Query', advancedQuery, 'Elastic Pre Query');
      response = await apiSearchServiceAdvanced(advancedQuery);

      // console.log("-----------------RESPONSE SERVICES ADVANCED:", response.services?.hits);

      if(response.success) setServices(response?.services?.hits || []);

      setTotalServiceCount(response?.services?.total?.value)
    }

    // response = await apiGetServicePublic(queries)
    // console.log("898989898989898989", response)
    // if(response.success) setServices(response)
    dispatch(getCurrent())
  // }
}

  useEffect(() => {
    (async () => {
      let resp = await apiGetCategorieService();

      if (resp.success && resp.serviceCategories?.length) {
        // console.log('UEFF', resp.serviceCategories.map(cat => {
        //   return {
        //     value: cat.title,
        //     label: cat.title
        //   }
        // }));
        setSvCategories(resp.serviceCategories.map(cat => {
          return {
            value: cat.title,
            label: cat.title
          }
        }));
      }
    })();
  }, [searchFilter]);


  useEffect(() => {
    window.scrollTo(0,0)
    // console.log('=====>>>>>>', current);
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
// <<<<<<< HEAD
  
    console.log(`PRE FETCH === ${JSON.stringify(searchFilter)}`);
    // console.log("YYAY", params.get('page'), "udias");

    let advancedQuery = {
      searchTerm: searchFilter.term,
      limit: REACT_APP_PAGINATION_LIMIT_DEFAULT , offset: 0,
      sortBy: sort?.value || '',
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
    // setParams(queries);

    fetchServicesAdvanced(q, advancedQuery);
  }, [searchedClick]);


//   // for page changing
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
      limit: REACT_APP_PAGINATION_LIMIT_DEFAULT , offset: parseInt(params.get('page')) ? params.get('page')-1 : 0,
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

    fetchServicesAdvanced(q, advancedQuery);
  // }, [params]);
// =======
    // fetchServicesAdvanced(q)
  }, [params]);
  
  // const changeActive = useCallback((name)=>{
  //   if(name===active) setActive(null)
  //   else {
  //     setActive(name)
  //   }
  // },[active])

  // const changeValue = useCallback((value)=>{
  //   setSort(value)
  // },[sort])

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

  // useEffect(() => {
  // }, [searchFilter])

  const handleGetDirections = () => {
    if (nearMeOption) {
      setNearMeOption(false);
      setSearchFilter({
        ...searchFilter,
        province: '',
        maxDistance: ''
      })
      return;
    }
    if (clientLat !== 999999 && clientLon !== 999999) {
      setNearMeOption(true);
      return;
    }
    // Swal.fire({
    //   title: 'Chia sẻ vị trí',
    //   text: "Bạn có muốn chia sẻ vị trí hiện tại của mình để xem đường đi?",
    //   icon: 'question',
    //   showCancelButton: true,
    //   confirmButtonText: 'Chia sẻ',
    //   cancelButtonText: 'Không'
    // }).then((result) => {
    //   if (result.isConfirmed) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            await apiModifyUser({ lastGeoLocation: {
              type: "Point",
              coordinates: [longitude, latitude]
            } }, current._id);
            // Call the function to show the route using latitude and longitude
            //  showRoute(latitude, longitude);
            setClientLat(latitude);
            setClientLon(longitude);

            setNearMeOption(true);
          }, () => {
            Swal.fire('Cannot get your position!');
            setNearMeOption(false);
          });
        }
        else {
          Swal.fire('Geolocation is not avaialable!');
          setNearMeOption(false);
        }
    // });
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
          <div className='flex items-center gap-4 mb-10 mt-2'>
            {/* <FaMoneyCheckAlt />
            <SearchItemService name='price' activeClick={active} changeActiveFilter={changeActive} type='input'/>
            <FaCubes />
            <SearchItemService name='category' activeClick={active} changeActiveFilter={changeActive}/>
            <FaSortAmountDown />
            <NewInputSelect value={sort} options={sorts} changeValue={changeValue} /> */}

            <div className="grow flex justify-start gap-2">
                <span className="grow flex flex-col justify-start">
                  <label className="text-gray-800 font-medium">Search&nbsp;By:&nbsp;</label>
                  <InputFormm
                    id='q'
                    register={()=>{}}
                    errors={()=>{}}
                    fullWidth
                    placeholder= 'Search blog by title name, tag ...'
                    style={'bg-white min-h-10 rounded-md pl-2 flex items-center border border-gray-300'}
                    styleInput={'outline-none text-gray-500 italic w-full'}
                    onChange={(event) => {
                      setSearchFilter(prev => { return { ...prev, term: event.target.value }; })
                    }}
                    value={searchFilter.term}
                  >
                  </InputFormm>

                  { nearMeOption &&
                    <span className='flex justify-start items-center my-3 gap-3'>
                      {/* <span className='font-semibold text-sm p-3'>Province:</span> */}
                      {/* <InputSelect
                        value={searchFilter?.province}
                        options={Object.entries(tinh_thanhpho).map(ele => { return {id:ele[0], text:ele[1]?.name, value:ele[0]}})}
                        changeValue={(value) => {setSearchFilter(prev => {return {...prev, province: value};}) }}
                        className={'rounded-md p-2 bg-white min-h-10 border border-gray-300'}
                      /> */}
                      <label className="text-gray-800 font-medium mr-1">Province:</label>
                      <Select
                        defaultValue={""}
                        name="province"
                        options={Object.entries(tinh_thanhpho).map(ele => { return {id:ele[0], label:ele[1]?.name, value:ele[0]}})}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(value) => {setSearchFilter(prev => {return {...prev, province: value};}) }}
                      />

                      <label className="text-gray-800 font-medium mr-1">Max Distance:</label>
                      <InputField nameKey='maxDistance'
                        value={searchFilter.maxDistance}
                        setValue={setSearchFilter}
                        placeholder={"Maximum Distance(optional)"}
                        style={'bg-white min-h-10 rounded-md pl-2 flex items-center border border-gray-300'}
                      />  
                    </span>
                  }
                </span>

                <span className='flex flex-col justify-center items-center gap-1'>
                  <span className=''>
                    <span className='font-semibold text-sm'>Location Search:</span>
                    {/* <input className='p-3' onInput={() => {handleGetDirections()}} type="checkbox"/> */}
                  </span>
                  <ToggleButton handleToggleAndReturn={() => {handleGetDirections()}} isToggled={nearMeOption}/>

                </span>
            </div>

            <div className='flex flex-col'>
              {/* <FaSortAmountDown />
              <NewInputSelect value={selectedSort} options={sortOptions} changeValue={(value) => {setSelectedSort(value);}} /> */}
              <label className="text-gray-800 font-medium">Order&nbsp;By:&nbsp;</label>
              <Select
                value={sort}
                defaultValue={""}
                name="orderBy"
                options={[
                  { value: "", label: "No Order" },
                  { value: "-price", label: "Price Descending" },
                  { value: "price", label: "Price Ascending" },
                  { value: "-discount", label: "Hot Discount" }
                ]}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(e) => setSort(e)}
              />
            </div>

            <div className='flex flex-col'>
              {/* <FaSortAmountDown />
              <NewInputSelect value={selectedSort} options={sortOptions} changeValue={(value) => {setSelectedSort(value);}} /> */}
              <label className="text-gray-800 font-medium">Categories:</label>
              <Select
                value={filterCateg}
                defaultValue={[]}
                isMulti
                name="filterCateg"
                options={svCategories}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(newVal, actionMeta) => {
                  if (actionMeta?.action === 'select-option') {
                    setFilterCateg([
                      ...newVal
                    ]);
                  }
                  else if (actionMeta?.action === 'remove-value') {
                    const newFilterCateg = filterCateg.filter(cat => cat.value !== actionMeta?.removedValue?.value);
                    setFilterCateg([...newFilterCateg]);
                  }
                  else if (actionMeta?.action === 'clear') {
                    setFilterCateg([]);
                  }
                  // console.log("||||||||", newVal, actionMeta);
                }}
                // onChange={(e) => {
                //   console.log('------->', filterCateg);
                //   if (!filterCateg.includes(e)) {
                //     setFilterCateg([
                //       ...filterCateg,
                //       e
                //     ]);
                //   }
                // }}
              />

              {/* <select value={''}
                onChange={(e) => {
                  console.log('------->', filterCateg);
                  if (!filterCateg.includes(e.target.value)) {
                    setFilterCateg([
                      ...filterCateg,
                      e.target.value
                    ]);
                  }
                }}
                className="border rounded-lg p-2 w-full mt-1 text-gray-800">
                  {
                    [{title: `${filterCateg?.length || 0} chosen`}, ...categories_service].map(cat => {
                      return (
                        <option value={cat?.title}>
                          {cat?.title}
                        </option>
                      );
                    })
                  }
              </select> */}
            </div>

              <Button
                handleOnclick={() => { console.log(searchFilter); setSearchedClick(prev => prev+1); }}
              >
              <span className="flex justify-center gap-1 items-center">
                <FaSearch /><span>Search</span>
              </span>
            </Button>

            <Button
              handleOnclick={() => {
                console.log('Presssed');
                setSearchFilter(prev => {
                  return {
                    term: '',
                    province: '',
                    maxDistance: '',
                    orderBy: ''
                  };
                });
                setSort('');
                setFilterCateg([]);
                // setSvCategories([]);
              }}
              style="px-4 py-2 rounded-md text-white bg-slate-400 font-semibold my-2"
            >
              <span className="flex justify-center gap-1 items-center">
                <FaBahai /><span>Reset</span>
              </span>
            </Button>

            {/* </div> */}
          </div>
        </div>
        {/* <div className='flex flex-col gap-3'>
          <div className='w-full'>

          </div>
        </div> */}
      </div>
      <div className='w-main border p-4 flex justify-start m-auto mt-8'>
          {/* <span className='font-semibold text-sm p-5'>Search By:</span> */}
          {/* <div className='w-full'> */}
{/* <<<<<<< HEAD
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
          </div>
======= */}
          {/* <InputField nameKey='term' value={searchFilter.term} setValue={setSearchFilter} placeholder={"Search By Name, Province..."} /> */}

        </div>
      <div className={clsx('mt-8 w-main m-auto flex gap-4 flex-wrap', isShowModal ? 'hidden' : '')}>
        {services?.map((service, index) => (
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


export default Services;