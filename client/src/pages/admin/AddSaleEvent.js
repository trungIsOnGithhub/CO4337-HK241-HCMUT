// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { Button, MultiSelect, InputFormm} from 'components'
// import { TbXboxXFilled } from "react-icons/tb";

// import React, { useCallback, useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form';
// import moment from 'moment';
// import { apiCreateNewFlashSaleEvent, apiGetServiceByAdmin } from 'apis';
// import { Slider } from '@mui/material';
// import { HashLoader } from 'react-spinners';
// import { PiSealPercent } from "react-icons/pi";
// import { useSelector } from 'react-redux';
// import { FaCheckCircle, FaExclamationCircle, FaClock} from "react-icons/fa";
// import { toast } from 'react-toastify';
// import bgImage from '../../assets/clouds.svg'
// import dayjs from 'dayjs';

// const AddSaleEvent = () => {
//   const { register, formState: { errors }, reset, handleSubmit, watch, setValue } = useForm();
//   const [exprDate, setExprdate] = useState(null)
//   const [promotionApplicationDate, setPromotionApplicationDate] = useState("");
//   const [services, setServices] = useState([]);
//   const [selectedService, setSelectedService] = useState([]);
//   const [voucherType, setVoucherType] = useState('percentage');
//   const [percentageDiscount, setPercentageDiscount] = useState([]);
//   const [fixedAmount, setFixedAmount] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const {current} = useSelector(state => state.user)

//   const [startTime, setStartTime] = useState("");
//   const [error, setError] = useState("");
//   const [isValid, setIsValid] = useState(false);

//   const [hours, setHours] = useState("")
//   const [minutes, setMinutes] = useState("")
//   const [name, setName] = useState("")


//   useEffect(() => {
//     validateTime(startTime);
//   }, [startTime]);

//   const validateTime = (time) => {
//     const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
//     if (time === "") {
//       setError("");
//       setIsValid(false);
//     } else if (!timeRegex.test(time)) {
//       setError("Please enter a valid time in 24-hour format (HH:mm)");
//       setIsValid(false);
//     } else {
//       setError("");
//       setIsValid(true);
//     }
//   };

//   const handleInputChange = (e) => {
//     setStartTime(e.target.value);
//   };

//   const handleDateChange = (date) => {
//     setPromotionApplicationDate(moment(new Date(date)).format("DD/MM/YYYY"))
//     setExprdate(date)
//   };

//   useEffect(() => {
//     fetchAllServiceByAdmin();
//   }, []);

//   const fetchAllServiceByAdmin = async () => {
//     const response = await apiGetServiceByAdmin({ limit: 999 });
//     if (response?.success) {
//       setServices(response?.services);
//     }
//   };

//   const options = services?.map((service) => ({
//     label: service?.name,
//     value: service?._id
//   }));

//   const handleSelectServiceChange = useCallback(selectedOptions => {
//     // Update selected services
//     setSelectedService(selectedOptions);

//     // Update percentageDiscount state
//     if(voucherType === 'percentage'){
//       setPercentageDiscount(prev => {
//         // Remove services that are no longer selected
//         const updated = prev.filter(item => selectedOptions.some(opt => opt === item.id));
  
//         // Add new services with default value 0
//         selectedOptions.forEach(option => {
//           if (!updated.find(item => item.id === option)) {
//             updated.push({ id: option, value: 0 });
//           }
//         });
  
//         return updated;
//       });
//     }
//     // Update fixedAmount state
//     if(voucherType === 'fixed'){
//       setFixedAmount(prev => {
//         // Remove services that are no longer selected
//         const updated = prev.filter(item => selectedOptions.some(opt => opt === item.id));
  
//         // Add new services with default value 0
//         selectedOptions.forEach(option => {
//           if (!updated.find(item => item.id === option)) {
//             updated.push({ id: option, value: 0 });
//           }
//         });
  
//         return updated;
//       });
//     }
//   }, [voucherType]);

//   const handlePercentChange = (serviceId) => (event) => {
//     const value = parseFloat(event.target.value);
//     if (value < 0 || value > 100) return; // Validate ngay khi nhập
//     setPercentageDiscount(prev => {
//       const updated = prev.map(item =>
//         item.id === serviceId ? { ...item, value: value } : item
//       );
//       if (!updated.find(item => item.id === serviceId)) {
//         updated.push({ id: serviceId, value: value });
//       }
//       return updated;
//     });
//   };

//   const handleEventVoucherType = (type) => {
//     if(type === 'fixed' && voucherType === 'percentage') {
//       setFixedAmount(percentageDiscount)
//       setPercentageDiscount([])
//     }
//     if(type === 'percentage' && voucherType === 'fixed'){
//       setPercentageDiscount(fixedAmount?.map(item => ({ id: item.id, value: 0 })));
//       setFixedAmount([]);
//     }
//     setVoucherType(type)
//   }


//   const marks = (price) => {
//     return [
//       {
//         value: 0,
//         label: 'MIN: 0',
//       },
//       {
//         value: price,
//         label:`MAX: ${price}`,
//       }
//     ]
//   };

//   const handleSliderChange = (serviceId) => (event, newValue) => {
//     setFixedAmount(prev => {
//       const updated = prev.map(item =>
//         item.id === serviceId ? { ...item, value: newValue } : item
//       );
//       return updated;
//     });
//   };

//   const handleFixedAmountInputChange = (serviceId, value) => {
//     const numericValue = parseFloat(value);
//     if (!isNaN(numericValue)) {
//       setFixedAmount(prev => {
//         return prev.map(item =>
//           item.id === serviceId ? { ...item, value: numericValue } : item
//         );
//       });
//     }
//     else{
//       setFixedAmount(prev => {
//         return prev.map(item =>
//           item.id === serviceId ? { ...item, value: 0 } : item
//         );
//       });
//     }
//   };



//   const handleAddSaleEvent = async (data) => {
//     try {
//       setIsLoading(true);
//       console.log(data)
//       const flashSaleData = {
//         ...data,
//         promotionApplicationDate,
//         services: selectedService,
//         discount_type: voucherType,
//         percentageDiscount: voucherType === 'percentage' ? percentageDiscount : [],
//         fixedAmount: voucherType === 'fixed' ? fixedAmount : [],
//       };
//       flashSaleData.providerId = current?.provider_id
//       flashSaleData.duration = (+hours) * 60 + (+minutes)

//       const response = await apiCreateNewFlashSaleEvent(flashSaleData)
//       if (response?.success) {
//         toast.success('Voucher created successfully!');
//         reset(); // Reset the form fields
//         setSelectedService([])
//         setExprdate(null)
//         setPromotionApplicationDate("")
//         setHours("")
//         setMinutes("")
//         setStartTime("")
//       } else {
//         toast.error('Failed to create voucher.');
//       }
      
//     } catch (error) {
//       alert('An error occurred. Please try again.');
//     }
//     setIsLoading(false);
//   };


//   return (
//     <div className='w-full h-full relative'>
//       <div className='inset-0 absolute z-0'>
//         <img src={bgImage} className='w-full h-full object-cover'/>
//       </div>
//       <div className='relative z-10'>
//         <div className='w-full h-fit flex justify-between p-4'>
//           <span className='text-[#00143c] text-3xl h-fit font-semibold'>Add Sale Event</span>
//         </div>
//         <div className='w-[95%] h-fit shadow-2xl rounded-md bg-white ml-4 mb-[50px] px-4 py-2 flex flex-col gap-4'>
//           <form onSubmit={handleSubmit(handleAddSaleEvent)}>
//             <div className='w-full my-6 flex gap-4 items-start'>
//               <div className='flex flex-1 flex-col'>
//                 <label htmlFor="name" className="block font-medium text-[#00143c] mb-1">
//                   Sale Event Name <sup className='text-red-500 font-semibold'> *</sup>
//                 </label>
//                 <div className='flex gap-4 items-center text-[#00143c]'>
//                   <input
//                     type="text"
//                     id="name"
//                     {...register('name', {
//                       required: 'Need fill this field', 
//                     })}
//                     className={`w-full px-4 py-2 border text-[#00143c] outline-none rounded-md ${errors['names'] ? "border-red-500" : "border-[#dee1e6]"}`}
//                     placeholder="Enter sale event name"
//                     onInput={(e)=>{setName(e.target.value)}}
//                   />
//                 </div>
//               </div>
//               <div className='flex flex-1 flex-col'>
//                 <span className='font-medium mb-1 text-[#00143c]'>Promotion Application Date<sup className='text-red-500 font-semibold'> *</sup></span>
//                 <LocalizationProvider dateAdapter={AdapterDayjs}>
//                   <DemoContainer components={['DatePicker']}>
//                     <DatePicker
//                       slotProps={{ textField: { size: 'small' } }}
//                       className="w-full h-full custom-datepicker font-bold text-[#00143c] z-[50]"
//                       onChange={handleDateChange}
//                       value={exprDate}
//                       shouldDisableDate={(date) => dayjs(date).isBefore(dayjs(), 'day') || dayjs(date).isSame(dayjs(), 'day')}
//                     />
//                   </DemoContainer>
//                 </LocalizationProvider>
//               </div>
//             </div>
//             <div className='w-full my-6 text-[#00143c]'> 
//               <div className='flex flex-1 flex-col items-start'>
//                 <h2 className="font-medium h-fit text-[#00143c] mb-1">Flash Sale Duration<sup className='text-red-500 font-semibold'> *</sup></h2>
//                 <div className='flex gap-4 w-full'>
//                   <div className="flex-1">
//                     <div className="relative mb-1">
//                       <input
//                         type="number"
//                         id="hours"
//                         {...register('hours', {
//                           required: 'Need fill this field', 
//                           min: {
//                             value: 0,
//                             message: 'Hours must be at least 0',
//                           },
//                           max: {
//                             value: 23,
//                             message: 'Hours must be at most 23',
//                           }
//                         })}
//                         className={`w-full px-4 py-2 border text-[#00143c] outline-none rounded-md ${errors['hours'] ? "border-red-500" : "border-[#dee1e6]"}`}
//                         placeholder="Enter hours (0-23)"
//                         aria-label="Hours input"
//                         onInput={(e)=>{setHours(e.target.value)}}
//                       />
//                       {
//                         hours !== "" && +hours >= 0 && +hours < 24  ?
//                       <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
//                         : 
//                         hours === "" ?
//                       <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" /> 
//                         :
//                       <TbXboxXFilled className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"/>
//                       }
//                     </div>
//                     {errors['hours'] && <small className='text-xs text-red-500'>{errors['hours']?.message}</small>}
//                   </div>
//                   <div className="flex-1">
//                     <div className="relative mb-1">
//                       <input
//                         type="number"
//                         id="minutes"
//                         {...register("minutes", {
//                           required: 'Need fill this field',
//                           min: {
//                             value: 0,
//                             message: 'Hours must be at least 0',
//                           },
//                           max: {
//                             value: 59,
//                             message: 'Hours must be at most 59',
//                           }  
//                         })}
//                         className={`w-full px-4 py-2 border text-[#00143c] outline-none rounded-md ${errors['minutes'] ? "border-red-500" : "border-[#dee1e6]"}`}
//                         placeholder="Enter minutes (0-59)"
//                         min="0"
//                         max="59"
//                         aria-label="Minutes input"
//                         onInput={(e)=>{setMinutes(e.target.value)}}
//                       />
//                       {
//                         minutes !== "" && +minutes >= 0 && +minutes < 60  ?
//                       <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
//                         : 
//                         minutes === "" ?
//                       <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                         :
//                       <TbXboxXFilled className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"/>
//                       }
//                     </div>
//                     {errors['minutes'] && <small className='text-xs text-red-500'>{errors['minutes']?.message}</small>}
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-1 p-4 bg-blue-200 rounded-md">
//                 <h3 className="text-lg font-semibold mb-2 text-blue-800">Example</h3>
//                 <p className="text-sm text-blue-600">
//                   For a 75-minute, enter: <strong>1 hour</strong> and <strong>15 minutes</strong>
//                 </p>
//               </div>
//             </div>
//             <div className='w-full my-6 flex gap-4 items-start'>
//                 <div className="flex-1 flex flex-col">
//                   <label
//                     htmlFor="startTime"
//                     className="block text-[#00143c] font-medium mb-1"
//                   >
//                     Flash Sale Start Time <sup className='text-red-500 font-semibold'> *</sup>
//                   </label>
//                   <div className="relative mb-1">
//                     <input
//                       type="text"
//                       id="startTime"
//                       className={`w-full px-4 py-2 border text-[#00143c] outline-none transition-all duration-300 rounded-md ${
//                         errors['startTime']
//                           ? "border-red-500 focus:ring-red-200"
//                           : "[border-[#dee1e6] focus:ring-blue-200"
//                       } ${isValid ? "pr-10" : ""}`}
//                       placeholder="Enter time (e.g., 18:00)"
//                       value={startTime}
//                       onInput={handleInputChange}
//                       aria-invalid={error ? "true" : "false"}
//                       aria-describedby="timeError"
//                       {...register("startTime", {
//                         required: 'Need fill this field'})}
//                     />
//                   </div>
//                   {errors['startTime'] && <small className='text-xs text-red-500 mb-1'>{errors['startTime']?.message}</small>}
//                   {error && (
//                     <div
//                       id="timeError"
//                       className="flex items-center mb-1 text-sm text-red-600"
//                     >
//                       <FaExclamationCircle className="mr-2" />
//                       <span>{error}</span>
//                     </div>
//                   )}
//                   <p className="text-sm text-gray-400">
//                     Enter the start time for your flash sale in 24-hour format (HH:mm).
//                   </p>
//                 </div>
//                 <div className='flex-1'>
//                   <InputFormm
//                     label={'Usage Limit'}
//                     require={true}
//                     register={register}
//                     errors={errors}
//                     id='usageLimit'
//                     validate={{
//                       required: 'Need fill this field',
//                       min: {
//                         value: 1,
//                         message: 'Usage limit must be greater than 0',
//                       },
//                       pattern: {
//                         value: /^[1-9]\d*$/,
//                         message: 'Usage limit must be a whole number greater than 0'
//                       }
//                     }}
//                     style='flex-1 flex flex-col'
//                     styleLabel={'font-medium text-[#00143c]'}
//                     styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none transition-all duration-300 rounded-md mt-1 border-[#dee1e6] font-'}
//                     placeholder='Usage Limit ...'
//                     type='number'
//                     step='1'
//                     min='1'
//                   />
//                 </div>
//             </div>
//             <div className='w-full my-6 flex gap-4 items-start'>
//               <MultiSelect
//                 labelStyle={'text-[#00143c] font-medium'}
//                 title='Services'
//                 id='service' 
//                 require={true}
//                 options={options}
//                 onChangee={handleSelectServiceChange}
//                 values={selectedService}
//               />
//             </div>
//             <div className='w-full my-6 flex gap-4'>
//               <label className='block flex-1'>
//                 <span className='text-[#00143c] font-medium mb-[8px] block'>Type</span>
//                 <select
//                   {...register('type')}
//                   className='block w-full h-[36px] border border-[#dee1e6] pl-2 outline-none rounded-md text-[#00143c] cursor-pointer'
//                   onChange={(e)=>handleEventVoucherType(e?.target?.value)}
//                   value={voucherType}
//                 >
//                   <option className='text-[#00143c] font-medium' value='percentage'>Percentage Amount</option>
//                   <option className='text-[#00143c] font-medium' value='fixed'>Fixed Amount</option>
//                 </select>
//               </label>
//             </div>
//             {voucherType === 'percentage' && (
//               <div className='w-full my-6 flex flex-col gap-4'>
//                 {selectedService.map((service) => (
//                   <div key={service} className='w-[80%]'>
//                     <label htmlFor={`percentageDiscount-${service}`} className='block mb-2 text-[#00143c] font-medium'>
//                       Percentage Discount of {services.find(s => s._id === service)?.name}
//                     </label>
//                     <input
//                       id={`percentageDiscount-${service}`}
//                       type='number'
//                       step='0.01'
//                       min='0'
//                       max='100'
//                       className='w-full p-2 border border-gray-300 text-black outline-none'
//                       placeholder='Percentage Discount ...'
//                       onChange={handlePercentChange(service)}
//                       value={percentageDiscount.find(item => item.id === service)?.value || ''}
//                       required
//                     />
//                     {errors[`percentageDiscount-${service}`] && (
//                       <small className="text-xs text-red-500">
//                         {errors[`percentageDiscount-${service}`].message}
//                       </small>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//             {voucherType === 'fixed' && selectedService.length > 0 && (
//               <div className='w-full my-6 flex flex-col gap-4'>
//                 {selectedService.map((service) => (
//                   <div key={service.value} className='w-[80%] flex flex-col items-start text-[#00143c] font-medium'>
//                     <label className='block mb-2'>{services.find(s => s._id === service)?.name}</label>
//                     <div className='p-2 flex w-full justify-between items-center gap-16 text-[#00143c]'>
//                       <Slider
//                         defaultValue={0}
//                         min={0}
//                         max={services.find(s => s._id === service)?.price}
//                         step={1}
//                         aria-label="Custom marks"
//                         valueLabelDisplay="auto"
//                         color="secondary"
//                         marks={marks(services.find(s => s._id === service)?.price)}
//                         onChange={handleSliderChange(service)}
//                         value={fixedAmount.find(item => item.id === service)?.value || 0}
//                         sx={{
//                           '& .MuiSlider-markLabel': {
//                             color: '#00143c',
//                             paddingLeft: '20px',
//                           },
//                           '& .MuiSlider-thumb': {
//                             backgroundColor: '#36A2EB', // Màu của núm kéo
//                             boxShadow: 'none'
//                           },
//                           '& .MuiSlider-track': {
//                             backgroundColor: '#36A2EB', // Màu của thanh kéo
//                             height: '8px',
//                           },
//                           '& .MuiSlider-rail': {
//                             backgroundColor: '#36A2EB', // Màu của đường ray thanh kéo
//                             height: '8px',
//                           },
//                           '& .MuiSlider-mark': {
//                             backgroundColor: 'transparent', // Hoặc bất kỳ màu nào bạn muốn
//                           },
//                         }}
//                       />
//                       <input
//                         type="number"
//                         className="border border-[#dee1e6] rounded p-1 w-32 ml-2 text-[#00143c] outline-none text-center bg-blue-200 "
//                         placeholder="Enter amount"
//                         onChange={(e) => handleFixedAmountInputChange(service, e.target.value)}
//                         value={fixedAmount.find(item => item.id === service)?.value || ''}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//             <Button type='submit' style={'w-fit flex gap-1 items-center bg-[#005aee] px-4 py-2 rounded-md text-white shadow-inner mx-auto mb-4'}>
//               Create a new flash sale event
//               <span><PiSealPercent size={24}/></span>
//             </Button>
//           </form>


//           {isLoading && (
//             <div className='flex justify-center z-50 w-full h-full fixed top-0 left-0 items-center bg-overlay'>
//               <HashLoader className='z-50' color='#3B82F6' loading={isLoading} size={80} />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
const AddSaleEvent = () => {}
export default AddSaleEvent