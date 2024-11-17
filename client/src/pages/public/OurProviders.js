import { apiGetServiceProviders } from 'apis';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react'
import Masonry from 'react-masonry-css';
import Swal from 'sweetalert2';
import { useParams, useSearchParams, createSearchParams, useNavigate } from 'react-router-dom'
import { apiSearchServiceAdvanced, apiSearchServicePublic, apiGetServicePublic } from '../../apis'
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
import { apiModifyUser } from '../../apis/user';
import Button from 'components/Buttons/Button';
import { FaSortAmountDown, FaMoneyCheckAlt, FaCubes, FaBahai, FaSearch  } from "react-icons/fa";
import ToggleButton from './ToggleButton';
const REACT_APP_PAGINATION_LIMIT_DEFAULT = 8;

const OurProviders = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [services, setServices] = useState(null)
  // const [active, setActive] = useState(null)
  const [params] = useSearchParams();
  const [sort, setSort] = useState('')
  const [nearMeOption, setNearMeOption] = useState(false)
  const {category} = useParams();
  const {isShowModal} = useSelector(state => state.app);
  const [filterCateg, setFilterCateg] = useState([]);
  const {current} = useSelector((state) => state.user);

  const [searchedClick, setSearchedClick] = useState(0);
  const [searchFilter, setSearchFilter] = useState({
    term: '',
    province: '',
    maxDistance: '',
    unit: 'km'
  });
  const [allProviders, setAllProviders] = useState(null)
  const [clientLat, setClientLat] = useState(999999);
  const [clientLon, setClientLon] = useState(999999);
  const [totalCount, setTotalCount] = useState(0);

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

  // useEffect(() => {
  //   // Yêu cầu người dùng chia sẻ vị trí
  //   Swal.fire({
  //     title: 'Chia sẻ vị trí',
  //     text: "Bạn có muốn chia sẻ vị trí hiện tại của mình?",
  //     icon: 'question',
  //     showCancelButton: true,
  //     confirmButtonText: 'Chia sẻ',
  //     cancelButtonText: 'Không'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       if ("geolocation" in navigator) {
  //         navigator.geolocation.getCurrentPosition(position => {
  //           const { latitude, longitude } = position.coords;
  //           setLatitude(latitude);
  //           setLongitude(longitude);
  //         }, () => {
  //           Swal.fire('Không thể lấy vị trí của bạn.');
  //         });
  //       } else {
  //         Swal.fire('Geolocation không khả dụng.');
  //       }
  //     }
  //   });
  // }, []);
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
    Swal.fire({
      title: 'Chia sẻ vị trí',
      text: "Bạn có muốn chia sẻ vị trí hiện tại của mình để xem đường đi?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Chia sẻ',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        // if ("geolocation" in navigator) {
        //     navigator.geolocation.getCurrentPosition(async (position) => {
        //     const { latitude, longitude } = position.coords;
        //     await apiModifyUser({ lastGeoLocation: {
        //       type: "Point",
        //       coordinates: [longitude, latitude]
        //     } }, current._id);
        //     // Call the function to show the route using latitude and longitude
        //     // showRoute(latitude, longitude);
            setClientLat(0);
            setClientLon(0);

            setNearMeOption(prev => !prev);
          // }, () => {
          //   Swal.fire('Không thể lấy vị trí của bạn.');
          // });
        } else {
          Swal.fire('Geolocation không khả dụng.');
        }
      // }
      // else {

      // }
    });
  };


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
                        placeholder={"Maximum distance..."}
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