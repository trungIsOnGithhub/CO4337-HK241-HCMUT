import React, {useCallback, useEffect, useState} from 'react'
import { InputForm, Pagination, Variant,MultiSelect} from 'components'
import { useForm } from 'react-hook-form'
import { apiGetProduct, apiDeleteProduct} from 'apis/product'
import { useSearchParams, createSearchParams, useNavigate, useLocation} from 'react-router-dom'
import useDebounce from 'hook/useDebounce'
import UpdateProduct from './UpdateProduct'
import icons from 'ultils/icon'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { apiDeleteServiceByAdmin, apiGetServiceByAdmin } from 'apis/service'
import clsx from 'clsx'
import { formatPricee } from 'ultils/helper'
import UpdateService from './UpdateService'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from "moment";
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const StaffCalendar = () => {
  const {MdModeEdit, MdDelete, FaCopy} = icons
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const {register,formState:{errors}, handleSubmit, watch} = useForm()
  const [products, setProducts] = useState(null)
  const [counts, setCounts] = useState(0)
  const [editService, setEditService] = useState(null)
  const [update, setUpdate] = useState(false)
  const [variant, setVariant] = useState(null)
  const [staffs, setStaffs] = useState([
    {
        firstName: 'Nguyen',
        lastName: 'Trung',
        _id: 1
    },
    {
        firstName: 'Tri',
        lastName: 'Vien',
        _id: 2
    }
  ])
  const [services, setServices] = useState([
    {
        name: 'Herbal Massage',
        _id: 1
    },
    {
        name: 'Sauna Massage',
        _id: 2
    }
  ])
//   const fetchStaff = async(params) => {
//     const response = await apiGetAllStaffs()
//     if(response.success){
//       setStaffs(response.staffs)
//     }
//   }
//   useEffect(() => {
//     fetchStaff()
//   }, [])

  const options = staffs?.map((staff) => ({
    label: `${staff.firstName} ${staff.lastName}`,
    value: staff._id
  }));

  const optionsService = services?.map((staff) => ({
    label: `${staff.firstName} ${staff.lastName}`,
    value: staff._id
  }));

  const [selectedStaff, setSelectedStaff] = useState([]);
  const handleSelectStaffChange = useCallback(selectedOptions => {
    setSelectedStaff(selectedOptions);
  }, []);

  const [selectedServices, setSelectedServices] = useState([]);
  const handleSelectServicesChange = useCallback(selectedOptions => {
    setSelectedStaff(selectedOptions);
  }, []);


  const [calendarEvents, setCalendarEvents] = useState([
    {
        id: 1,
        title: 'Herbal Massage',
        start: new Date(2024, 4, 16, 9, 15, 6),
        end: new Date(2024, 4, 16, 9, 55, 6),
        desc: 'Regular Customer',
        color: 'lightgreen',
    },
    {
        id: 2,
        title: 'Sauna Massage',
        start: new Date(2024, 4, 10, 14, 15, 6),
        end: new Date(2024, 4, 10, 14, 55, 6),
        desc: 'New Customer',
        color: 'lightred',
    },
    {
        id: 3,
        title: 'Herbal Massage',
        start: new Date(2024, 4, 14, 14, 15, 6),
        end: new Date(2024, 4, 14, 14, 55, 6),
        desc: 'New Customer',
        color: 'lightgreen',
    }
])

  const render = useCallback(() => {
    setUpdate(!update)
   })

  const handleSearchProduct = (data) => {
    console.log(data)
  }

  const fetchProduct = async(params) => {
    const response = await apiGetServiceByAdmin({...params, limit: process.env.REACT_APP_LIMIT})
    if(response?.success){
      console.log(response)
      setProducts(response.services)
      setCounts(response.counts)
    }
  }

//   const queryDebounce = useDebounce(watch('q'),800)

//   useEffect(() => {
//     const searchParams = Object.fromEntries([...params]) 
//     fetchProduct(searchParams)
//   }, [params, update])

//   useEffect(() => {
//     if(queryDebounce) {
//       navigate({
//         pathname: location.pathname,
//         search: createSearchParams({q:queryDebounce}).toString()
//       })
//     }
//     else{
//       navigate({
//         pathname: location.pathname,
//       })
//     }
//   }, [queryDebounce])

    const eventStyleGetter = (event) => {
        var style = {
            backgroundColor: event.color,
            borderRadius: '0px',
            opacity: 0.8,
            color: 'black',
            border: '0px',
            display: 'block'
        };
        return {
            style: style
        };
    }

  return (
    <div className='w-full flex flex-col gap-4 relative'>
      {editService &&  
      <div className='absolute inset-0 bg-zinc-900 h-fit z-50 flex-auto'>
        <UpdateService editService={editService} render={render} setEditService={setEditService}/>
      </div>}

      {variant &&  
      <div className='absolute inset-0 bg-zinc-900 h-[200%] z-50 flex-auto'>
        <Variant variant={variant} render={render} setVariant={setVariant}/>
      </div>}

      <div className='h-[69px] w-full'>
      </div>
      <div className='p-4 border-b w-full flex justify-between items-center fixed top-0 bg-black z-30'>
        <h1 className='text-3xl font-bold tracking-tight'>Staff Calendar</h1>
      </div>

      <div className='flex w-full justify-end items-center px-4 '>
        <form className='w-[45%]' onSubmit={handleSubmit(handleSearchProduct)}>
          {/* <InputForm
            id='q'
            register={register}
            errors={errors}
            fullWidth
            placeholder= 'Search service by name, category ...'
          >
            
          </InputForm> */}
          <MultiSelect 
            id='assigned_staffs' 
            options={options}
            onChange={handleSelectStaffChange}
            values={selectedStaff}
          />
          {/* <MultiSelect 
            id='chosen_services' 
            options={optionsService}
            onChange={handleSelectServicesChange}
            values={selectedServices}
          /> */}
        </form>
      </div>

      <div style={{ height: '600px'}}>
        <Calendar
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            defaultDate={moment().toDate()}
            localizer={localizer}
            eventPropGetter={eventStyleGetter}
        />
      </div>
    </div>
  )
}

export default StaffCalendar