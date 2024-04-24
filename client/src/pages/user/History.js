import {apiGetOrdersByUser } from 'apis/order'
import { CustomSelect, InputForm, Pagination } from 'components'
import withBaseComponent from 'hocs/withBaseComponent'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createSearchParams, useSearchParams } from 'react-router-dom'
import { statusOrder } from 'ultils/constant'


const History = ({navigate, location}) => {
  const [orders, setOrders] = useState(null)
  const [counts, setCounts] = useState(0)
  const {
    register,
    formState:{errors}, 
    watch, 
    setValue} = useForm()

  const q = watch('q')
  const status = watch('status')

  const [params] = useSearchParams()
  const fetchOrders = async(params) => {
    const response = await apiGetOrdersByUser({...params, limit: process.env.REACT_APP_LIMIT})
    console.log(response) 
    if(response.success){
      setOrders(response.order)
      console.log(response.order)
      setCounts(response.counts)
    }
  }
  
  const handleSearchStatus = ({value}) => {
    navigate({
      pathname: location.pathname,
      search: createSearchParams({status: value}).toString()
    })
  }

  useEffect(() => {
    const pr = Object.fromEntries([...params])
    fetchOrders(pr)
  }, [params])
  console.log(status)
  
  return (
    <div className='w-full relative px-4'>
      <header className='text-3xl font-semibold py-4 border-b border-b-gray-200'>History</header>
      <div className='flex w-full justify-end items-center px-4 '>
        <form className='w-[45%] grid grid-cols-2 gap-4'>
          <div className='col-span-1'>
            <InputForm
            id='q'
            register={register}
            errors={errors}
            fullWidth
            placeholder= 'Search orders by status ...'
            >
            </InputForm>
          </div>
          <div className='col-span-1 flex items-center'>
          <CustomSelect 
            options={statusOrder}
            value={status}
            onChange={(val)=> handleSearchStatus(val)}
            wrapClassname='w-full'
          />
          </div>
        </form>
      </div>
      <table className='table-auto p-0 w-full'>
        <thead className='font-bold bg-blue-500 text-[13px] text-white w-full'>
          <tr className='border border-gray-500'>
            <th className='text-center py-2'>#</th>
            <th className='text-center py-2'>Products</th>
            <th className='text-center py-2'>Total Price</th>
            <th className='text-center py-2'>Status</th>
            <th className='text-center py-2'>Created At</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((el,idx)=>(
            <tr key={el._id} className='border border-gray-500'>
              <td className='text-center py-2'>{((+params.get('page')||1)-1)*+process.env.REACT_APP_LIMIT + idx + 1}</td>
              <td className='text-center py-2'>
                <span className='flex flex-col gap-2'>
                  {el.products?.map(item=>(
                    <span className='flex items-center gap-2' key={item?._id}>
                      <img src={item?.thumb} alt='thumbnail' className='w-12 h-12 rounded-md object-cover'></img>
                      <span className='flex flex-col'>
                        <span className='text-main font-semibold'>{item?.title}</span>
                        <span className='flex items-center text-xs italic gap-2'>
                          <span>Quantity: </span>
                          <span>{item?.quantity}</span>
                        </span>
                      </span>
                   
                    </span>
                  ))}
                </span>
              </td>
              <td className='text-center py-2'>{`${el?.total} 💲`}</td>
              <td className='text-center py-2'>{el?.status}</td>
              <td className='text-center py-2'>{moment(el.createdAt).format('DD/MM/YYYY')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='w-full flex justify-end'>
        <Pagination totalCount={counts} />
      </div>
    </div>
  )
}

export default withBaseComponent(History)