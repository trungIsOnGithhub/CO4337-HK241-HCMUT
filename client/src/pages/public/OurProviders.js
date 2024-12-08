// import { apiGetServiceProviders } from 'apis';
import { HashLoader } from 'react-spinners';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react'
import moment from 'moment';
// import Masonry from 'react-masonry-css';
import Swal from 'sweetalert2';
import { useParams, useSearchParams, createSearchParams, useNavigate } from 'react-router-dom'
import { apiSearchProviderAdvanced, apiSearchServicePublic, apiGetServicePublic } from '../../apis'
// import { Breadcrumb, Service, SearchItemService, InputSelect, Pagination, InputField} from '../../components'
// import Masonry from 'react-masonry-css'
// import { useParams, useSearchParams, createSearchParams, useNavigate} from 'react-router-dom'
import { Breadcrumb, Pagination, InputField, InputFormm, Provider } from '../../components'
// import { apiGetServicePublic,  } from '../../apis'
// import { sorts } from '../../ultils/constant'
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux'
// import withBaseComponent from 'hocs/withBaseComponent'
import { getCurrent } from 'store/user/asyncAction'
import { tinh_thanhpho } from 'tinh_thanhpho';
// import { apiModifyUser } from '../../apis/user';
import Button from 'components/Buttons/Button';
import { FaRoad, FaBuilding, FaMapMarkerAlt, FaBahai, FaSearch, FaCalendarDay  } from "react-icons/fa";
import ToggleButton from './ToggleButton';
import defaultProvider from "../../assets/defaultProvider.jpg";

const REACT_APP_PAGINATION_LIMIT_DEFAULT = process.env.REACT_APP_LIMIT;

const OurProviders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams()
  const [services, setServices] = useState(null)
  // const [active, setActive] = useState(null)
  const [sort, setSort] = useState('');
  const [nearMeOption, setNearMeOption] = useState(false)
  const {category} = useParams();
  const {isShowModal} = useSelector(state => state.app);
  const [filterCateg, setFilterCateg] = useState([]);
  const {current} = useSelector((state) => state.user);

  const [resetClicked, setResetClicked] = useState(false);
  const [searchedClick, setSearchedClick] = useState(0);
  const [searchFilter, setSearchFilter] = useState({
    term: '',
    province: '',
    maxDistance: '',
    unit: 'km'
  });
  const [allProviders, setAllProviders] = useState([])
  const [clientLat, setClientLat] = useState(999999);
  const [clientLon, setClientLon] = useState(999999);
  // const [totalCount, setTotalCount] = useState(0);

  const fetchProviders = async (queries) =>{
    const response = await apiSearchProviderAdvanced(queries);
    // removed log

    if(response.success && response.providers?.hits){
      setAllProviders(response.providers?.hits.map(p => {
        return {
          ...p['_source'],
          sort: p['sort']
        };
      }))
    } 
  }

  // useEffect(() => {
  //   window.scrollTo(0,0)
  //   const queries = Object.fromEntries([...params])
  //   fetchProviders(queries)
  // }, [params])

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [totalProvider, setTotalProvider] = useState(0)

  const [totalServiceCount, setTotalServiceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);


  // const prevSearchTermRef = useRef(searchFilter.term);
  const isClientLatLongValid = (clientLat, clientLon) => {
    return clientLat >= -90 && clientLon >= -90 && clientLat <= 180 && clientLon <= 180;
  }
  const isClientDistanceValid = (distanceText, unit) => {
    return /^-?\d+$/.test(distanceText) && (unit === 'km' || unit === 'm');
  }

  const fetchServiceProviderAdvanced = async (queries, advancedQuery) => {
    setIsLoading(true);
    let response = [];
    // const currerntParamPage = params.get('page');
    // const offset = currerntParamPage > 0 ? currerntParamPage - 1 : 0;

    // if (useAdvanced) {
      const categoriesChosen = filterCateg.map(cat => cat.value);
      // if(categoriesChosen){
      advancedQuery.categories = categoriesChosen;
      // }
  // const fetchServiceProviderAdvanced = async (queries) =>{
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
      advancedQuery.province = tinh_thanhpho[searchFilter.province].name;
    }

    if (nearMeOption && current?.lastGeoLocation?.coordinates?.length === 2) {
      response = await apiSearchProviderAdvanced(advancedQuery);

      if(response.success && response.providers?.hits) {
        setAllProviders(response.providers?.hits.map(p => {
          return {
            ...p['_source'],
            sort: p['sort']
          };
        }))
      }
      setTotalProvider(response.providers?.total?.value || 0);
    } 
    else {
      response = await apiSearchProviderAdvanced(advancedQuery);

      if(response.success && response.providers?.hits) {
        setAllProviders(response.providers?.hits.map(p => {
          return {
            ...p['_source'],
            sort: p['sort']
          };
        }));
      }
      setTotalProvider(response.providers?.total?.value || 0);
    }

    // response = await apiGetServicePublic(queries)
    // if(response.success) setServices(response)
    dispatch(getCurrent())
  // }
    setIsLoading(false);
}

// useEffect(() => {
//   (async () => {
//     let resp = await apiGetCategorieService();

//     if (resp.success && resp.serviceCategories?.length) {
//       setSvCategories(resp.serviceCategories.map(cat => {
//         return {
//           value: cat.title,
//           label: cat.title
//         }
//       }));
//     }
//   })();
// }, [searchFilter]);


useEffect(() => {
  window.scrollTo(0,0);
  const queries = Object.fromEntries([...params])

  const q = {
    ...queries}

  let advancedQuery = {
    searchTerm: searchFilter.term,
    limit: parseInt(REACT_APP_PAGINATION_LIMIT_DEFAULT),
    offset: 0,
    sortBy: sort?.value || '',
    // clientLat: 45, clientLon: 45,
    // distanceText: "2000km",
  };

  if (nearMeOption && isClientLatLongValid(clientLat, clientLon)) {
    advancedQuery = {
      ...advancedQuery,
      clientLat,
      clientLon
    }
    advancedQuery.sortBy += ' location';

    if (isClientDistanceValid(searchFilter.maxDistance, searchFilter.unit)) {
      advancedQuery = {
        ...advancedQuery,
        distanceText: searchFilter.maxDistance + searchFilter.unit
      }
    }
  }


  queries.page = 1;
  setParams(queries);

  fetchServiceProviderAdvanced(q, advancedQuery);
}, [searchedClick, resetClicked, nearMeOption]);


//   // for page changing
useEffect(() => {
  window.scrollTo(0,0)
  const queries = Object.fromEntries([...params]);

  const q = {...queries}

  let advancedQuery = {
    searchTerm: searchFilter.term,
    limit: parseInt(REACT_APP_PAGINATION_LIMIT_DEFAULT),
    offset: parseInt(params.get('page')) ? params.get('page')-1 : 0,
    sortBy: sort?.value || ''
  };


  if (nearMeOption && isClientLatLongValid(clientLat, clientLon)) {
    advancedQuery = {
      ...advancedQuery,
      clientLat,
      clientLon
    }
    advancedQuery.sortBy += ' location';

    if (isClientDistanceValid(searchFilter.maxDistance, searchFilter.unit)) {
      advancedQuery = {
        ...advancedQuery,
        distanceText: searchFilter.maxDistance + searchFilter.unit
      }
    }
  }

  fetchServiceProviderAdvanced(q, advancedQuery);
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
          setIsLoading(true);
          navigator.geolocation.getCurrentPosition(async (position) => {

            const { latitude, longitude } = position.coords;

            // await apiModifyUser({ lastGeoLocation: {
            //   type: "Point",
            //   coordinates: [longitude, latitude]
            // } }, current._id);
            // Call the function to show the route using latitude and longitude
            //  showRoute(latitude, longitude);
            setClientLat(latitude);
            setClientLon(longitude);

            setNearMeOption(true);

            setIsLoading(false);
        }, () => {
          setIsLoading(false);
          setNearMeOption(false);
          Swal.fire('Cannot get location!', 'Check your internet connection or browser setting!' ,'error');
        });
      }
      else {
        setIsLoading(false);
        setNearMeOption(false);
        Swal.fire('Geolocation is not avaialable!');
      }
  // });
};


  return (
    <div className='w-full'>
      <div className='h-[81px] flex items-center justify-center bg-gray-100'>
        <div className='w-main'>
          <h3 className='font-semibold uppercase'>{category.replace('_',' ')}</h3>
          <Breadcrumb category={category.replace('_',' ')} />
        </div>
      </div>
      <div className={clsx('mt-8 w-main m-auto')}>


      <div className='w-main p-2 flex justify-start m-auto mt-8'>
        <div className='flex-auto flex flex-col gap-2'>
          <div className='flex gap-4 mb-4 mt-2 items-end'>
            <div className="flex flex-col flex-1">
              <label className="text-gray-800 font-medium">Search&nbsp;By:&nbsp;</label>
              <InputFormm
                id='q'
                register={()=>{}}
                errors={()=>{}}
                fullWidth
                placeholder= 'Search providers...'
                style={'bg-white min-h-10 rounded-md pl-2 flex items-center border border-gray-300'}
                styleInput={'outline-none text-gray-500 italic w-full'}
                onChange={(event) => {
                  setSearchFilter(prev => { return { ...prev, term: event.target.value }; })
                }}
                value={searchFilter.term}
              >
              </InputFormm>
            </div>
            <span className='flex flex-col justify-center items-center gap-1'>
              <span className=''>
                <span className='font-semibold text-sm'>Location Search:</span>
                {/* <input className='p-3' onInput={() => {handleGetDirections()}} type="checkbox"/> */}
              </span>
              <ToggleButton handleToggleAndReturn={() => {handleGetDirections()}} isToggled={nearMeOption}/>
            </span>
            
            <div className='flex flex-col flex-1'>
              <label className="text-gray-800 font-medium">Order&nbsp;By:&nbsp;</label>
              <Select
                value={sort}
                defaultValue={""}
                name="orderBy"
                options={[
                  { value: "", label: "No Order" },
                  { value: "-createdAt", label: "Newest" }
                ]}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(e) => setSort(e)}
              />
            </div>
            <Button
              style="flex-1 h-fit px-4 py-2 rounded-md text-white bg-[#0a66c2] font-semibold"
              handleOnclick={() => { setSearchedClick(prev => !prev); }}
            >
            <span className="flex justify-center gap-1 items-center">
              <FaSearch /><span>Search</span>
            </span>
            </Button>

            <Button
              handleOnclick={() => {
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
                setResetClicked(prev => !prev);
              }}
              style="flex-1 h-fit px-4 py-2 rounded-md text-white bg-slate-400 font-semibold"
            >
              <span className="flex justify-center gap-1 items-center">
                <FaBahai /><span>Reset</span>
              </span>
            </Button>
          </div>
          { nearMeOption &&
            <div className='flex flex-col'>
              <span className='flex justify-start items-center my-2 gap-3'>
                <label className="text-gray-800 font-medium mr-1">Max Distance:</label>
                <InputField nameKey='maxDistance'
                  value={searchFilter.maxDistance}
                  setValue={setSearchFilter}
                  placeholder={"Maximum Distance(optional)"}
                  style={'bg-white min-h-10 rounded-md pl-2 flex items-center border border-gray-300'}
                  type="number"
                />  
              </span>
            </div>
          }
        </div>
      </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16'>
          {(!allProviders?.length) &&
            <div className="flex justify-center">
           <p className="text-gray-600 text-center font-semibold">No providers found matching your search criteria.</p>
           </div>}
         
            {allProviders?.map(provider => (
              // <Provider
              //   key={el._id} 
              //   providerData={el}
              //   provider_id= {el._id}
              //   normal={true}
              //   userLatitude = {latitude}
              //   userLongitude = {longitude}
              //  />

            <div
              key={provider._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 cursor-pointer"
              role="article"
              aria-label={`Service provider ${provider?.bussinessName}`}
            >
              <div className="relative h-36">
                <img
                  src={provider?.images[0] || defaultProvider}
                  alt={provider?.bussinessName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740";
                  }}
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">{provider?.bussinessName}</h2>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaBuilding className="mr-2" />
                    <span className='line-clamp-1'>{provider?.province}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2" />
                    <span className='line-clamp-1'>{provider.address}</span>
                  </div>
                  {(nearMeOption && provider?.sort?.length) && <div className="flex items-center text-gray-600">
                    <FaRoad className="mr-2" />
                    <span className='line-clamp-1 text-[#0a66c2]'>{provider?.sort?.[0] === "Infinity" ? 'No data' : `${provider?.sort?.[0]?.toFixed(1)} km`}</span>
                  </div>}
                  <div className="flex items-center text-gray-600">
                    <FaCalendarDay className="mr-2" />
                    <span className='line-clamp-1'>{`Since: ${moment(provider.createdAt).format('DD/MM/YYYY')}`}</span>
                  </div>
                <button
                  onClick={()=> navigate(`/detail_provider/${provider?.id}`)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label={`View details for ${provider.name}`}
                >
                  View Details
                </button>
              </div>
            </div>
            </div>
            ))}
      </div>

      </div>
      <div className='w-main m-auto my-4 flex justify-end'>
       {allProviders &&
       <Pagination
        totalCount={totalProvider}/>}
      </div>

      { isLoading &&
        <div className='flex justify-center z-50 w-full h-full fixed top-0 left-0 items-center bg-overlay'>
          <HashLoader className='z-50' color='#3B82F6' loading={isLoading} size={80} />
        </div>
      }
    </div>
  )
}

export default OurProviders