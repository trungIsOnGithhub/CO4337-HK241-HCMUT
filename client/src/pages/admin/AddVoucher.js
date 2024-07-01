import { Button, InputForm } from 'components';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HashLoader } from 'react-spinners';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MdDateRange } from "react-icons/md";

const AddVoucher = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [voucherType, setVoucherType] = useState('percentage');
  const { register, formState: { errors }, reset, handleSubmit, watch } = useForm();
  const [expirationDate, setExpirationDate] = useState(null);

  const handleAddVoucherCode = (data) => {
    console.log(data);
    // Handle form submission logic
  };

  return (
    <div className='w-full'>
      <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
        <span>Add Voucher Code</span>
      </h1>
      <div className='p-4 '>
        <form onSubmit={handleSubmit(handleAddVoucherCode)}>
          <div className='w-full my-6 flex gap-4'>
            <InputForm
              label='Voucher Name'
              register={register}
              errors={errors}
              id='name'
              validate={{
                required: 'Need fill this field'
              }}
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
              validate={{
                required: 'Need fill this field'
              }}
              style='flex-1'
              placeholder='Code ...'
              require
            />
          </div>

          <div className='w-full my-6 flex flex-col gap-2'>
            <div className='flex gap-4 items-center max-w-fit relative text-white'>
              <span className='font-medium'>Expiration Date</span>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker', 'DatePicker', 'DatePicker']}>
                  <DatePicker
                    label="Picker with helper text"
                    slotProps={{ textField: { helperText: 'Please fill this field' } }}
                    className='custom-datepicker' // Add custom class
                  />
                </DemoContainer>
              </LocalizationProvider>
            </div>
            {errors.expiration && <p className='text-red-500'>{errors.expiration.message}</p>}
          </div>

          <div className='w-full my-6 flex gap-4'>
            <InputForm
              label='Usage Limit'
              register={register}
              errors={errors}
              id='usageLimit'
              validate={{
                required: 'Need fill this field'
              }}
              style='flex-1'
              placeholder='Usage Limit ...'
            />
            <div className='flex items-center'>
              <input type='checkbox' id='noUsageLimit' {...register('noUsageLimit')} />
              <label htmlFor='noUsageLimit' className='ml-2'>Voucher has no usage limit</label>
            </div>
          </div>

          <div className='w-full my-6 flex gap-4'>
            <InputForm
              label='Limit Per User'
              register={register}
              errors={errors}
              id='limitPerUser'
              validate={{
                required: 'Need fill this field'
              }}
              style='flex-1'
              placeholder='Limit Per User ...'
            />
            <div className='flex items-center'>
              <input type='checkbox' id='noLimitPerUser' {...register('noLimitPerUser')} />
              <label htmlFor='noLimitPerUser' className='ml-2'>Voucher has no limit per user</label>
            </div>
          </div>

          <div className='w-full my-6 flex gap-4'>
            <InputForm
              label='Service'
              register={register}
              errors={errors}
              id='service'
              validate={{
                required: 'Need fill this field'
              }}
              style='flex-1'
              placeholder='Service ...'
              require
            />
          </div>

          <div className='w-full my-6 flex gap-4'>
            <label className='block flex-1'>
              <span className='text-gray-700'>Type</span>
              <select
                {...register('type')}
                className='mt-1 block w-full'
                onChange={(e) => setVoucherType(e.target.value)}
              >
                <option value='percentage'>Percentage Amount</option>
                <option value='fixed'>Fixed Amount</option>
              </select>
            </label>
          </div>

          {voucherType === 'percentage' && (
            <div className='w-full my-6 flex gap-4'>
              <InputForm
                label='Percentage Discount'
                register={register}
                errors={errors}
                id='percentageDiscount'
                validate={{
                  required: 'Need fill this field',
                  min: { value: 0, message: 'Must be at least 0%' },
                  max: { value: 100, message: 'Must be at most 100%' }
                }}
                style='flex-1'
                placeholder='Percentage Discount ...'
                type='number'
                step='0.01'
                min='0'
                max='100'
                require
              />
            </div>
          )}

          {voucherType === 'fixed' && (
            <div className='w-full my-6 flex gap-4'>
              <InputForm
                label='Fixed Discount Amount'
                register={register}
                errors={errors}
                id='fixedDiscount'
                validate={{
                  required: 'Need fill this field'
                }}
                style='flex-1'
                placeholder='Fixed Discount Amount ...'
                type='number'
                step='0.01'
                require
              />
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
}

export default AddVoucher;
