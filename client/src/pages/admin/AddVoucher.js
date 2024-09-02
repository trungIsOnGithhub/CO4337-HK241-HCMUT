import { Button, InputForm, MultiSelect } from 'components';
import React, { useCallback, useEffect, useState } from 'react';
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

const AddVoucher = () => {
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
        alert('Voucher created successfully!');
        reset(); // Reset the form fields
        setSelectedService([])
        setExprdate(null)
      } else {
        alert('Failed to create voucher.');
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


  
  return (
    <div className='w-full'>
      <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
        <span>Add Voucher Code</span>
      </h1>
      <div className='p-4'>
        <form onSubmit={handleSubmit(handleAddVoucherCode)}>
          <div className='w-full my-6 flex gap-4'>
            <InputForm
              label='Voucher Name'
              register={register}
              errors={errors}
              id='name'
              validate={{ required: 'Need fill this field' }}
              style='flex-1'
              placeholder='Name of service ...'
              require
            />
          </div>

          <div className='w-full my-6 flex gap-4'>
            <InputForm
              label='Voucher Code'
              register={register}
              errors={errors}
              id='code'
              validate={{ required: 'Need fill this field' }}
              style='flex-1'
              placeholder='Code ...'
              require
            />
          </div>

          <div className='w-full my-6 flex flex-col gap-2'>
            <div className='flex gap-4 items-center max-w-fit relative text-white'>
              <span className='font-medium'>Expiration Date<sup className='text-red-500 font-semibold'> *</sup></span>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker']}>
                  <DatePicker
                    label="Small picker"
                    slotProps={{ textField: { size: 'small' } }}
                    className='custom-datepicker'
                    onChange={handleDateChange}
                    value={exprDate}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </div>
            {errors.expiration && <p className='text-red-500'>{errors.expiration.message}</p>}
          </div>

          <div className='w-full my-6 flex gap-4 items-center'>
            <div className='w-[40%]'>
              <InputForm
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
                style='flex-1'
                placeholder='Usage Limit ...'
                disabled={noUsageLimit}
                type='number'
                step='1'
                min='1'
              />
            </div>
            <div className='flex'>
              <input 
                type='checkbox' 
                id='noUsageLimit' 
                {...register('noUsageLimit')} 
                onChange={handleNoUsageLimitChange}
              />
              <label htmlFor='noUsageLimit' className='ml-2'>Voucher has no usage limit</label>
            </div>
          </div>

          <div className='w-full my-6 flex gap-4'>
            <div className='w-[40%]'>
              <InputForm
                label={'Limit Per User'}
                labelClassName={noLimitPerUser && 'text-red-500 italic'}
                register={register}
                errors={errors}
                id='limitPerUser'
                validate={{
                  required: !noLimitPerUser && 'Need fill this field',
                  min: {
                    value: 1,
                    message: 'Limit per user must be greater than 0',
                  },
                  pattern: {
                    value: /^[1-9]\d*$/,
                    message: 'Limit per user must be a whole number greater than 0'
                  }
                }}
                style='flex-1'
                placeholder='Limit Per User ...'
                disabled={noLimitPerUser}
                type='number'
                step='1'
                min='1'
                />
            </div>
            <div className='flex items-center'>
              <input 
                type='checkbox' 
                id='noLimitPerUser' 
                {...register('noLimitPerUser')} 
                onChange={handleNoLimitPerUserChange}
              />
              <label htmlFor='noLimitPerUser' className='ml-2'>Voucher has no limit per user</label>
            </div>
          </div>

          <div className='w-full my-6 flex gap-4'>
            <MultiSelect 
              title='Services'
              id='service' 
              options={options}
              onChangee={handleSelectServiceChange}
              values={selectedService}
            />
          </div>

          <div className='w-full my-6 flex gap-4'>
            <label className='block flex-1'>
              <span className='text-white mb-[8px] block'>Type</span>
              <select
                {...register('type')}
                className='block w-full text-black h-[36px] border-gray-300 pl-2'
                onChange={(e)=>handleEventVoucherType(e?.target?.value)}
                value={voucherType}
              >
                <option className='text-gray-800 font-semibold' value='percentage'>Percentage Amount</option>
                <option className='text-gray-800 font-semibold' value='fixed'>Fixed Amount</option>
              </select>
            </label>
          </div>

          {voucherType === 'percentage' && (
            <div className='w-full my-6 flex flex-col gap-4'>
              {selectedService.map((service) => (
                <div key={service} className='w-[80%]'>
                  <label htmlFor={`percentageDiscount-${service}`} className='block mb-2'>
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
                <div key={service.value} className='w-[80%] flex flex-col items-start'>
                  <label className='block mb-2'>{services.find(s => s._id === service)?.name}</label>
                  <div className='p-2 flex w-full justify-between items-center gap-16 text-white'>
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
                          color: 'white',
                          paddingLeft: '15px',
                        },
                        '& .MuiSlider-thumb': {
                          backgroundColor: 'blue', // Màu của núm kéo
                          boxShadow: 'none'
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: 'blue', // Màu của thanh kéo
                          height: '8px',
                        },
                        '& .MuiSlider-rail': {
                          backgroundColor: 'lightgray', // Màu của đường ray thanh kéo
                          height: '8px',
                        },
                        '& .MuiSlider-mark': {
                          backgroundColor: 'transparent', // Hoặc bất kỳ màu nào bạn muốn
                        },
                      }}
                    />
                    <input
                      type="number"
                      className="border border-gray-300 rounded p-1 w-24 ml-2 text-black outline-none text-center"
                      placeholder="Enter amount"
                      onChange={(e) => handleFixedAmountInputChange(service, e.target.value)}
                      value={fixedAmount.find(item => item.id === service)?.value || ''}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className='mt-8'>
            <Button type='submit'>
              Create a new voucher
            </Button>
          </div>
        </form>
        {isLoading && (
          <div className='flex justify-center z-50 w-full h-full fixed top-0 left-0 items-center bg-overlay'>
            <HashLoader className='z-50' color='#3B82F6' loading={isLoading} size={80} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddVoucher;