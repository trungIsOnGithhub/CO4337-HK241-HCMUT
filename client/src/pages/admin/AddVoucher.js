import { Button, InputFormm, MultiSelect } from 'components';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HashLoader } from 'react-spinners';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { apiCreateNewCoupon, apiGetServiceByAdmin } from 'apis';
import { Slider } from '@mui/material';
import moment from 'moment'
import { useSelector } from 'react-redux';
import { BiSolidCoupon } from "react-icons/bi";
import { validate, getBase64 } from 'ultils/helper'
import { toast } from 'react-toastify';
import bgImage from '../../assets/clouds.svg'
import html2canvas from "html2canvas";
import dayjs from 'dayjs';
import { HiPencil } from "react-icons/hi";
import clsx from 'clsx';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaGift, FaTag, FaStar, FaCrown, FaHeart, FaGem, FaDownload } from "react-icons/fa";
import { MdOutlineFileDownload } from 'react-icons/md';

const AddVoucher = () => {
  const voucherRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voucherType, setVoucherType] = useState('percentage');
  const [noUsageLimit, setNoUsageLimit] = useState(false);
  const [noLimitPerUser, setNoLimitPerUser] = useState(false);
  const { register, formState: { errors }, reset, handleSubmit, watch, setValue } = useForm();
  const [expirationDate, setExpirationDate] = useState({});
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState([]);
  const [percentageDiscount, setPercentageDiscount] = useState([]);
  const [fixedAmount, setFixedAmount] = useState([]);
  const [exprDate, setExprdate] = useState(null)
  const {current} = useSelector(state => state.user)
  const [voucherName, setVoucherName] = useState("")
  const [voucherCode, setVoucherCode] = useState("")
  const [showCustomization, setShowCustomization] = useState(false);

  const watermarkIcons = [
    { id: 1, icon: FaGift, name: "Gift" },
    { id: 2, icon: FaTag, name: "Tag" },
    { id: 3, icon: FaStar, name: "Star" },
    { id: 4, icon: FaCrown, name: "Crown" },
    { id: 5, icon: FaHeart, name: "Heart" },
    { id: 6, icon: FaGem, name: "Gem" },
  ];

  const [customization, setCustomization] = useState({
    backgroundColor: "#4F46E5",
    voucherNameColor: "#FFFFFF",
    voucherCodeColor: "#FFFFFF",
    fontSize: "48",
    fontFamily: "Arial",
    iconSize: 24,
    iconSpacing: 20,
    selectedIcons: [],
  });

  const handleAddVoucherCode = async (data) => {
    try {
      setIsLoading(true);
      const couponData = {
        ...data,
        expirationDate,
        services: selectedService,
        discount_type: voucherType,
        percentageDiscount: voucherType === 'percentage' ? percentageDiscount : [],
        fixedAmount: voucherType === 'fixed' ? fixedAmount : [],
      };
      couponData.providerId = current?.provider_id
      //Call API to create a new coupon
      const response = await apiCreateNewCoupon(couponData);
      if (response?.success) {
        toast.success('Voucher created successfully!');
        reset(); // Reset the form fields
        setSelectedService([])
        setExprdate(null)
      } else {
        toast.error('Failed to create voucher.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
    setIsLoading(false);
  };

  const handleDateChange = (date) => {
    setExpirationDate({
      date: moment(new Date(date)).format("DD/MM/YYYY"),
      time: '23:59'
    })
    setExprdate(date)
  };

  const handleNoUsageLimitChange = () => {
    setNoUsageLimit(prev => {
      const newValue = !prev;
      if (newValue) {
        setValue('usageLimit', ''); // Set Usage Limit to 0
      }
      return newValue;
    });
  };

  const handleNoLimitPerUserChange = () => {
    setNoLimitPerUser(prev => {
      const newValue = !prev;
      if (newValue) {
        setValue('limitPerUser', ''); // Set Limit Per User to 0
      }
      return newValue;
    });
  };

  useEffect(() => {
    fetchAllServiceByAdmin();
  }, []);

  const fetchAllServiceByAdmin = async () => {
    const response = await apiGetServiceByAdmin({ limit: 999 });
    if (response?.success) {
      setServices(response?.services);
    }
  };

  const options = services?.map((service) => ({
    label: service?.name,
    value: service?._id
  }));

  const handleSelectServiceChange = useCallback(selectedOptions => {
    // Update selected services
    setSelectedService(selectedOptions);

    // Update percentageDiscount state
    if(voucherType === 'percentage'){
      setPercentageDiscount(prev => {
        // Remove services that are no longer selected
        const updated = prev.filter(item => selectedOptions.some(opt => opt === item.id));
  
        // Add new services with default value 0
        selectedOptions.forEach(option => {
          if (!updated.find(item => item.id === option)) {
            updated.push({ id: option, value: 0 });
          }
        });
  
        return updated;
      });
    }
    // Update fixedAmount state
    if(voucherType === 'fixed'){
      setFixedAmount(prev => {
        // Remove services that are no longer selected
        const updated = prev.filter(item => selectedOptions.some(opt => opt === item.id));
  
        // Add new services with default value 0
        selectedOptions.forEach(option => {
          if (!updated.find(item => item.id === option)) {
            updated.push({ id: option, value: 0 });
          }
        });
  
        return updated;
      });
    }
  }, [voucherType]);

  const marks = (price) => {
    return [
      {
        value: 0,
        label: 'MIN: 0',
      },
      {
        value: price,
        label:`MAX: ${price}`,
      }
    ]
  };

  const handleSliderChange = (serviceId) => (event, newValue) => {
    setFixedAmount(prev => {
      const updated = prev.map(item =>
        item.id === serviceId ? { ...item, value: newValue } : item
      );
      return updated;
    });
  };

  const handlePercentChange = (serviceId) => (event) => {
    const value = parseFloat(event.target.value);
    if (value < 0 || value > 100) return; // Validate ngay khi nhập
    setPercentageDiscount(prev => {
      const updated = prev.map(item =>
        item.id === serviceId ? { ...item, value: value } : item
      );
      if (!updated.find(item => item.id === serviceId)) {
        updated.push({ id: serviceId, value: value });
      }
      return updated;
    });
  };

  const handleFixedAmountInputChange = (serviceId, value) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setFixedAmount(prev => {
        return prev.map(item =>
          item.id === serviceId ? { ...item, value: numericValue } : item
        );
      });
    }
    else{
      setFixedAmount(prev => {
        return prev.map(item =>
          item.id === serviceId ? { ...item, value: 0 } : item
        );
      });
    }
  };


  const handleEventVoucherType = (type) => {
    if(type === 'fixed' && voucherType === 'percentage') {
      setFixedAmount(percentageDiscount)
      setPercentageDiscount([])
    }
    if(type === 'percentage' && voucherType === 'fixed'){
      setPercentageDiscount(fixedAmount?.map(item => ({ id: item.id, value: 0 })));
      setFixedAmount([]);
    }
    setVoucherType(type)
  }


  const handleCustomizationChange = (e) => {
    const { name, value } = e.target;
    setCustomization(prev => ({
      ...prev,
      [name]: value
    }));
  };

  console.log(customization)

  const handleIconToggle = (iconId) => {
    setCustomization((prev) => {
      const newSelectedIcons = prev.selectedIcons.includes(iconId)
        ? prev.selectedIcons.filter((id) => id !== iconId)
        : [...prev.selectedIcons, iconId];
      return { ...prev, selectedIcons: newSelectedIcons };
    });
  };


  const downloadImage = async() => {
    if (voucherRef.current) {
      const canvas = await html2canvas(voucherRef.current);
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${voucherName || "voucher"}.png`;
      link.click();
    }
  };

  const calculateIconGrid = () => {
    const containerWidth = 480;
    const containerHeight = 300;
  
    // Chuyển đổi chuỗi sang số nguyên
    const iconSize = Number(customization.iconSize);
    const iconSpacing = Number(customization.iconSpacing);
  
    const cols = Math.ceil(containerWidth / (iconSize + iconSpacing));
    const rows = Math.ceil(containerHeight / (iconSize + iconSpacing));
  
    return { cols, rows };
  };

  const { cols, rows } = calculateIconGrid();

  const [preview, setPreview] = useState({
    thumb: null,
  })
  const handlePreviewThumb = async(file) => {
    const base64Thumb = await getBase64(file)
    setPreview(prev => ({...prev, thumb: base64Thumb}))
  }

  useEffect(() => {
    console.log(watch('thumb'))
    handlePreviewThumb(watch('thumb')[0])
  }, [watch('thumb')])
  
  const fileInputRef = useRef(null);

  const handleDeleteImageVoucher = () => {
    setPreview({
      thumb: null
    })
  };


  return (
    <div className='w-full h-full relative'>
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className='relative z-10'>
        <div className='w-full h-fit flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl h-fit font-semibold'>Add Voucher</span>
        </div>
        <div className='w-[95%] h-fit shadow-2xl rounded-md bg-white ml-4 mb-[50px] px-4 py-2 flex flex-col gap-4'>
          <form onSubmit={handleSubmit(handleAddVoucherCode)}>
            <div className='w-full my-6 flex gap-4 items-start'>
              <div className='flex flex-1 flex-col'>
                <label htmlFor="name" className="block font-medium text-[#00143c] mb-1">
                  Voucher Name <sup className='text-red-500 font-semibold'> *</sup>
                </label>
                <div className='flex gap-4 items-center text-[#00143c]'>
                  <input
                    type="text"
                    id="name"
                    {...register('name', {
                      required: 'Need fill this field', 
                    })}
                    className={`w-full px-4 py-2 border text-[#00143c] outline-none rounded-md ${errors['names'] ? "border-red-500" : "border-[#dee1e6]"}`}
                    placeholder="Enter a voucher name"
                    onInput={(e)=>{setVoucherName(e.target.value)}}
                  />
                </div>
              </div>
              <div className='flex flex-1 flex-col'>
                <label htmlFor="name" className="block font-medium text-[#00143c] mb-1">
                  Voucher Code <sup className='text-red-500 font-semibold'> *</sup>
                </label>
                <div className='flex gap-4 items-center text-[#00143c]'>
                  <input
                    type="text"
                    id="code"
                    {...register('code', {
                      required: 'Need fill this field', 
                    })}
                    className={`w-full px-4 py-2 border text-[#00143c] outline-none rounded-md ${errors['names'] ? "border-red-500" : "border-[#dee1e6]"}`}
                    placeholder="Enter a voucher code"
                    onInput={(e)=>{setVoucherCode(e.target.value)}}
                  />
                </div>
              </div>
            </div>
            <div className={clsx('w-full my-6 flex gap-4 items-start', (voucherName==="" || voucherCode==="") && 'hidden' )}>
              {!preview?.thumb && 
              <div className='flex flex-1'>
                <div className="relative w-full">
                  <div
                    ref={voucherRef}
                    className="w-[480px] h-[300px] mx-auto aspect-video rounded-lg shadow-lg p-8 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden"
                    style={{ backgroundColor: customization.backgroundColor }}
                  >
                    <div className="absolute inset-0">
                      {customization.selectedIcons.map((iconId) => {
                        const iconData = watermarkIcons.find((icon) => icon.id === iconId);
                        if (!iconData) return null;
                        const IconComponent = iconData.icon;

                        return Array.from({ length: cols * rows }).map((_, index) => {
                          const row = Math.floor(index / cols);
                          const col = index % cols;
                          return (
                            <div
                              key={`${iconId}-${index}`}
                              className="absolute opacity-10"
                              style={{
                                left: `${col * ((+customization.iconSize) + (+customization.iconSpacing))}px`,
                                top: `${row * ((+customization.iconSize) + (+customization.iconSpacing))}px`,
                              }}
                            >
                              <IconComponent
                                style={{
                                  fontSize: `${+customization.iconSize}px`,
                                  color: '#fff'
                                }}
                              />
                            </div>
                          );
                        });
                      })}
                    </div>
                    <div
                      className={clsx("h-full text-center transition-all duration-300 relative z-10 flex flex-col justify-center items-center")}
                      style={{ fontFamily: customization.fontFamily, fontSize: `${customization.fontSize}px`,}}
                    >
                      <div className={`w-fit h-fit mb-[30px]`}>
                        <h4 className="text-2xl font-bold" style={{ fontFamily: customization.fontFamily, fontSize: `${customization.fontSize}px`, color: customization.voucherNameColor,}}>
                          {voucherName || "Voucher Name"}
                        </h4>
                      </div>
                      <p className="text-4xl font-extrabold font-mono" style={{ fontFamily: customization.fontFamily, fontSize: `${customization.fontSize}px`, color: customization.voucherCodeColor,}}>
                        {voucherCode || "CODE123"}
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => setShowCustomization(!showCustomization)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 cursor-pointer"
                  >
                    <HiPencil size={20} className="text-[#00143c]" />
                  </div>
                  <div
                    onClick={downloadImage}
                    className="absolute top-12 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 cursor-pointer"
                  >
                    <MdOutlineFileDownload size={20} className="text-[#00143c]" />
                  </div>
                </div>
              </div>}
              <div className='flex flex-1 h-[300px] overflow-y-auto'> 
                {showCustomization ? (
                  <div className="w-full space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-[#00143c] mb-1">
                        Background Color
                      </label>
                      <input
                        type="color"
                        name="backgroundColor"
                        value={customization.backgroundColor}
                        onChange={handleCustomizationChange}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#00143c] mb-1">
                        Voucher Name Color
                      </label>
                      <input
                        type="color"
                        name="voucherNameColor"
                        value={customization.voucherNameColor}
                        onChange={handleCustomizationChange}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#00143c] mb-1">
                        Voucher Code Color
                      </label>
                      <input
                        type="color"
                        name="voucherCodeColor"
                        value={customization.voucherCodeColor}
                        onChange={handleCustomizationChange}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#00143c] mb-1">
                        Font Size
                      </label>
                      <input
                        type="range"
                        name="fontSize"
                        min="24"
                        max="72"
                        value={customization.fontSize}
                        onChange={handleCustomizationChange}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#00143c] mb-1">
                        Font Family
                      </label>
                      <select
                        name="fontFamily"
                        value={customization.fontFamily}
                        onChange={handleCustomizationChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-[#00143c]"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>

                    {/* Icon Size */}
                    <div>
                      <label className="block text-sm font-medium text-[#00143c] mb-1">
                        Icon Size
                      </label>
                      <input
                        type="range"
                        name="iconSize"
                        min="12"
                        max="96"
                        value={customization.iconSize}
                        onChange={handleCustomizationChange}
                        className="w-full"
                      />
                    </div>

                    {/* Icon Spacing */}
                    <div>
                      <label className="block text-sm font-medium text-[#00143c] mb-1">
                        Icon Spacing
                      </label>
                      <input
                        type="range"
                        name="iconSpacing"
                        min="0"
                        max="50"
                        value={customization.iconSpacing}
                        onChange={handleCustomizationChange}
                        className="w-full"
                      />
                    </div>

                    {/* Select Icon */}
                    <div>
                      <label className="block text-sm font-medium text-[#00143c] mb-1">
                        Watermark Icon
                      </label>
                      <div className="grid grid-cols-3 gap-4 text-[#00143c]">
                        {watermarkIcons.map((iconData) => (
                          <button
                            key={iconData.id}
                            type="button"
                            onClick={() => handleIconToggle(iconData.id)}
                            className={`p-4 rounded-lg border ${customization.selectedIcons.includes(iconData.id) ? "border-blue-500 bg-blue-50" : "border-gray-300"} hover:border-blue-500 transition-colors`}
                          >
                            <iconData.icon className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm">{iconData.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      onClick={downloadImage}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
                    >
                      Download Image
                    </div>
                  </div>
                ):(
                  <div className='w-full flex flex-col'>
                    {!preview?.thumb && <label className='text-[#00143c] font-medium mb-1' htmlFor='thumb'>Do you have an image for the voucher? Upload it!</label>}
                    <input 
                      {...register('thumb', {required: 'Need upload thumb'})}
                      type='file' 
                      id='thumb'
                      className='cursor-pointer'
                    />
                    {errors['thumb'] && <small className='text-xs text-red-500'>{errors['thumb']?.message}</small>}
                  
                    {preview.thumb 
                      && 
                    <div className='mt-2 flex justify-start relative w-fit'>
                      <img src={preview.thumb} alt='thumbnail' className='w-[409px] max-h-[300px] object-contain border border-[#dee1e6] rounded-md shadow-inner'></img>
                      <span onClick={handleDeleteImageVoucher} className='absolute right-1 top-1 text-2xl text-[#fff] font-medium hover:text-gray-400 cursor-pointer'><IoIosCloseCircleOutline /></span>
                    </div>
                    }
                  </div>
                )}
              </div>
            </div>
            <div className='w-1/2 my-6 flex gap-4 items-start pr-2'>
              <div className='flex flex-1 flex-col'>
                <span className='font-medium mb-1 text-[#00143c]'>Promotion Application Date<sup className='text-red-500 font-semibold'> *</sup></span>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DatePicker']}>
                    <DatePicker
                      slotProps={{ textField: { size: 'small' } }}
                      className="w-full h-full custom-datepicker font-bold text-[#00143c] z-[50]"
                      onChange={handleDateChange}
                      value={exprDate}
                      shouldDisableDate={(date) => dayjs(date).isBefore(dayjs(), 'day') || dayjs(date).isSame(dayjs(), 'day')}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </div>
            </div>
            <div className='w-full my-6 flex gap-4 items-center'>
              <div className='w-[40%]'>
                <InputFormm
                  label={'Usage Limit'}
                  labelClassName={noUsageLimit && 'text-red-500 italic'}
                  register={register}
                  errors={errors}
                  id='usageLimit'
                  validate={{
                    required: !noUsageLimit && 'Need fill this field',
                    min: {
                      value: 1,
                      message: 'Usage limit must be greater than 0',
                    },
                    pattern: {
                      value: /^[1-9]\d*$/,
                      message: 'Usage limit must be a whole number greater than 0'
                    }
                  }}
                  style='flex-1 flex flex-col'
                  styleLabel={'font-medium text-[#00143c]'}
                  styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none transition-all duration-300 rounded-md mt-1 border-[#dee1e6] font-'}
                  placeholder='Usage Limit ...'
                  type='number'
                  step='1'
                  min='1'
                />
              </div>
              <div className='flex mt-5 items-center'>
                <input 
                  type='checkbox' 
                  id='noUsageLimit' 
                  {...register('noUsageLimit')} 
                  onChange={handleNoUsageLimitChange}
                />
                <label htmlFor='noUsageLimit' className='ml-2 text-[#00143c] italic'>Voucher has no usage limit</label>
              </div>
            </div>
            <div className='w-full my-6 flex gap-4 items-center'>
              <div className='w-[40%]'>
                <InputFormm
                  label={'Limit Per User'}
                  labelClassName={noUsageLimit && 'text-red-500 italic'}
                  register={register}
                  errors={errors}
                  id='limitPerUser'
                  validate={{
                    required: !noUsageLimit && 'Need fill this field',
                    min: {
                      value: 1,
                      message: 'Limit per user must be greater than 0',
                    },
                    pattern: {
                      value: /^[1-9]\d*$/,
                      message: 'Limit per user must be a whole number greater than 0'
                    }
                  }}
                  style='flex-1 flex flex-col'
                  styleLabel={'font-medium text-[#00143c]'}
                  styleInput={'w-full px-4 py-2 border text-[#00143c] outline-none transition-all duration-300 rounded-md mt-1 border-[#dee1e6] font-'}
                  placeholder='Usage Limit ...'
                  type='number'
                  step='1'
                  min='1'
                />
              </div>
              <div className='flex mt-5 items-center'>
                <input 
                  type='checkbox' 
                  id='noLimitPerUser' 
                  {...register('noUsageLimit')} 
                  onChange={handleNoLimitPerUserChange}
                />
                <label htmlFor='noLimitPerUser' className='ml-2 text-[#00143c] italic'>Voucher has no limit per user</label>
              </div>
            </div>
            <div className='w-full my-6 flex gap-4 items-start'>
              <MultiSelect
                labelStyle={'text-[#00143c] font-medium'}
                title='Services'
                id='service' 
                require={true}
                options={options}
                onChangee={handleSelectServiceChange}
                values={selectedService}
                style={'w-full flex flex-col gap-1'}
              />
            </div>
            <div className='w-full my-6 flex gap-4'>
              <label className='block flex-1'>
                <span className='text-[#00143c] font-medium mb-[8px] block'>Type</span>
                <select
                  {...register('type')}
                  className='block w-full h-[36px] border border-[#dee1e6] pl-2 outline-none rounded-md text-[#00143c] cursor-pointer'
                  onChange={(e)=>handleEventVoucherType(e?.target?.value)}
                  value={voucherType}
                >
                  <option className='text-[#00143c] font-medium' value='percentage'>Percentage Amount</option>
                  <option className='text-[#00143c] font-medium' value='fixed'>Fixed Amount</option>
                </select>
              </label>
            </div>
            {voucherType === 'percentage' && (
              <div className='w-full my-6 flex flex-col gap-4'>
                {selectedService.map((service) => (
                  <div key={service} className='w-[80%]'>
                    <label htmlFor={`percentageDiscount-${service}`} className='block mb-2 text-[#00143c] font-medium'>
                      Percentage Discount of {services.find(s => s._id === service)?.name}
                    </label>
                    <input
                      id={`percentageDiscount-${service}`}
                      type='number'
                      step='0.01'
                      min='0'
                      max='100'
                      className='w-full p-2 border border-gray-300 text-black outline-none'
                      placeholder='Percentage Discount ...'
                      onChange={handlePercentChange(service)}
                      value={percentageDiscount.find(item => item.id === service)?.value || ''}
                      required
                    />
                    {errors[`percentageDiscount-${service}`] && (
                      <small className="text-xs text-red-500">
                        {errors[`percentageDiscount-${service}`].message}
                      </small>
                    )}
                  </div>
                ))}
              </div>
            )}
            {voucherType === 'fixed' && selectedService.length > 0 && (
              <div className='w-full my-6 flex flex-col gap-4'>
                {selectedService.map((service) => (
                  <div key={service.value} className='w-[80%] flex flex-col items-start text-[#00143c] font-medium'>
                    <label className='block mb-2'>{services.find(s => s._id === service)?.name}</label>
                    <div className='p-2 flex w-full justify-between items-center gap-16 text-[#00143c]'>
                      <Slider
                        defaultValue={0}
                        min={0}
                        max={services.find(s => s._id === service)?.price}
                        step={1}
                        aria-label="Custom marks"
                        valueLabelDisplay="auto"
                        color="secondary"
                        marks={marks(services.find(s => s._id === service)?.price)}
                        onChange={handleSliderChange(service)}
                        value={fixedAmount.find(item => item.id === service)?.value || 0}
                        sx={{
                          '& .MuiSlider-markLabel': {
                            color: '#00143c',
                            paddingLeft: '20px',
                          },
                          '& .MuiSlider-thumb': {
                            backgroundColor: '#36A2EB', // Màu của núm kéo
                            boxShadow: 'none'
                          },
                          '& .MuiSlider-track': {
                            backgroundColor: '#36A2EB', // Màu của thanh kéo
                            height: '8px',
                          },
                          '& .MuiSlider-rail': {
                            backgroundColor: '#36A2EB', // Màu của đường ray thanh kéo
                            height: '8px',
                          },
                          '& .MuiSlider-mark': {
                            backgroundColor: 'transparent', // Hoặc bất kỳ màu nào bạn muốn
                          },
                        }}
                      />
                      <input
                        type="number"
                        className="border border-[#dee1e6] rounded p-1 w-32 ml-2 text-[#00143c] outline-none text-center bg-blue-200 "
                        placeholder="Enter amount"
                        onChange={(e) => handleFixedAmountInputChange(service, e.target.value)}
                        value={fixedAmount.find(item => item.id === service)?.value || ''}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVoucher;