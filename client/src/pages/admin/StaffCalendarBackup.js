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
import { apiGetServiceByAdmin } from 'apis/service'
import { apiGetAllStaffs, apiGetOrdersForStaffCalendar } from 'apis'
import clsx from 'clsx'
import UpdateService from './UpdateService'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from "moment";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Provider, useSelector } from 'react-redux';
import path from 'ultils/path'

const localizer = momentLocalizer(moment);

const StaffCalendar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const {register,formState:{errors}, handleSubmit, watch} = useForm()
  const [editService, setEditService] = useState(null)
  const [update, setUpdate] = useState(false)
  const [variant, setVariant] = useState(null)
  const [staffs, setStaffs] = useState([])
  const [services, setServices] = useState([])
  const { current } = useSelector((state) => state.user);

  const fetchStaff = async(params) => {
    const response = await apiGetAllStaffs()
    if(response.success){
      setStaffs(response.staffs)
    }
  }
  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchService = async(params) => {
    const response = await apiGetServiceByAdmin()
    if(response?.success && response.services){
      setServices(response.services)
    }
    else {
      Swal.fire({
        title: 'Error Occured',
        text: 'Error Occured Reading Data',
        icon: 'warning',
      })
    }
  }
  useEffect(() => {
    fetchService()
  }, [])

  const staffOptions = staffs?.map(staff => ({
    label: `${staff.firstName} ${staff.lastName}`,
    value: staff._id
  }));

  const serviceOptions = services?.map(service => ({
    label: service.name,
    value: service._id
  }));

  const [selectedStaff, setSelectedStaff] = useState([]);
  const handleSelectStaffChange = useCallback(selectedOptions => {
    setSelectedStaff(selectedOptions);
  }, []);

  const [selectedServices, setSelectedServices] = useState([]);
  const handleSelectServicesChange = useCallback(selectedOptions => {
    setSelectedServices(selectedOptions);
  }, []);

  const getEventDatePair = useCallback((dateStr, timeStr, duration) => {
    const ddmmyyArr = dateStr.split('/').map(Number)
    const hhmmArr = timeStr.split(':').map(Number)


    const startDate = new Date(ddmmyyArr[2], ddmmyyArr[1]-1, ddmmyyArr[0], hhmmArr[0], hhmmArr[1], 0)
    const endDate = moment(startDate).add(duration, 'm')

    return [startDate, endDate]
  }, []);


  const [calendarEvents, setCalendarEvents] = useState([])

  const render = useCallback(() => {
    setUpdate(!update)
   })

  const handleSearchProduct = (data) => {
  }

  const mapOrderToCalendarEvents = useCallback((orderRaw) => {
    return orderRaw.map((order, index) => {
      if (!order.info.length || !order?.service?.duration) {
        throw new Error('Cannot Parse Payload');
      }
      const datepair = getEventDatePair(order.info[0].date, order.info[0].time, order.service.duration);

      return {
        id: index,
        title: order?.service?.name,
        bookingid: order?._id,
        start: datepair[0],
        end: datepair[1],
        desc: order?.service?.name + ' - ' + order?._id,
        color: 'lightgreen',
      };
    })
  }, [])

  const fetchOrder = async(params) => {
    const payload = {
      provider_id: current.provider_id,
      assigned_staff_ids: selectedStaff,
      service_ids: selectedServices
    }
    const response = await apiGetOrdersForStaffCalendar(payload)
    // for (const order of response.order) {
    //   if (order.info && order.info.length > 0) {
    //   }
    // }
    if (response?.order) {
      const newEventsList = mapOrderToCalendarEvents(response?.order)
      setCalendarEvents(newEventsList)
    } else {
      Swal.fire({
        title: 'Error Occured',
        text: 'Error Occured Reading Data',
        icon: 'warning',
      })
    }
  }
  useEffect(() => {
    fetchOrder()
  }, [selectedStaff, selectedServices])


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
  
    const handleOnClickDetail = (bookingid) => {
      navigate({
        pathname:  `/${path.ADMIN}/${path.MANAGE_BOOKING_DETAIL}`,
        search: createSearchParams({bookingid}).toString()
      })
    }

  return (
    <div className='w-full flex flex-col gap-4 relative'>
      {editService &&  
      <div className='absolute inset-0 bg-zinc-900 h-fit z-50 flex-auto'>
        <UpdateService editService={editService} render={render} setEditService={setEditService}/>
      </div>}

      {/* {variant &&  
      <div className='absolute inset-0 bg-zinc-900 h-[200%] z-50 flex-auto'>
        <Variant variant={variant} render={render} setVariant={setVariant}/>
      </div>} */}

      <div className='h-[69px] w-full'>
      </div>
      <div className='p-4 border-b w-full flex justify-between items-center fixed top-0 bg-black z-30'>
        <h1 className='text-3xl font-bold tracking-tight'>Working Calendar</h1>
      </div>

      <div className='flex w-full justify-start items-center px-4 gap-5'>
        {/* <form className='w-[45%]' onSubmit={handleSubmit(handleSearchProduct)}> */}
          {/* <InputForm
            id='q'
            register={register}
            errors={errors}
            fullWidth
            placeholder= 'Search service by name, category ...'
          >
            
          </InputForm> */}
          {/* <div> */}
            <MultiSelect 
              id='assigned_staffs' 
              options={staffOptions}
              onChangee={handleSelectStaffChange}
              values={selectedStaff}
            />
            <MultiSelect 
              id='chosen_services' 
              options={serviceOptions}
              onChangee={handleSelectServicesChange}
              values={selectedServices}
              title="Services"
            />
          {/* </div> */}
        {/* </form> */}
      </div>

      <div style={{ height: '600px'}}>
        <Calendar
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            defaultDate={moment().toDate()}
            localizer={localizer}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={event => handleOnClickDetail(event.bookingid)}
        />
      </div>
    </div>
  )
}

export default StaffCalendar