import React, { memo, useEffect, useState} from 'react'
import icons from '../../ultils/icon'
import { colors } from '../../ultils/constant'
import { createSearchParams, useNavigate, useParams, useSearchParams} from 'react-router-dom'
import path from '../../ultils/path'
import { apiGetProduct } from '../../apis'
import useDebounce from '../../hook/useDebounce'
const {FaCaretDown} = icons
const SearchItem = ({name, activeClick, changeActiveFilter, type='checkbox'}) => {
  const navigate = useNavigate()
  const {category} = useParams()
  const [selected, setSelected] = useState([])
  const [bestPrice, setBestPrice] = useState(null)
  const [params] = useSearchParams()
  const [price, setPrice] = useState({
    from:'',
    to:''
  })

  const handleSelected = (e) => {
    const alreadyEl = selected?.find(el => el === e.target.value)
    if(alreadyEl) setSelected(prev => prev.filter(el => el !== e.target.value))
    else setSelected(prev => [...prev, e.target.value])
    changeActiveFilter(null)
  }
  const deboucePriceFrom = useDebounce(price.from, 500)
  const deboucePriceTo = useDebounce(price.to, 500)
  useEffect(() => {
    let param = []
    for (let i of params.entries()) param.push(i)
    const queries = {}
    for (let i of param){
      queries[i[0]] = i[1]
    }
    if(Number(price.from)>0) queries.from = price.from
    else delete queries.from 

    if(Number(price.to)>0) queries.to = price.to
    else delete queries.to

    queries.page = 1
    navigate({
      pathname: `/${category}`,
      search: createSearchParams(queries).toString()
    })    
  }, [deboucePriceFrom, deboucePriceTo])

  useEffect(() => {
    let param = []
    for (let i of params.entries()) param.push(i)
    const queries = {}
    for (let i of param){
      queries[i[0]] = i[1]
    }
    if(selected.length > 0){
      if(selected) queries.color = selected.join(',')
      queries.page = 1
    }
    else delete queries.color
    navigate({
      pathname: `/${category}`,
      search: createSearchParams(queries).toString()
    })    
  }, [selected])
  

  useEffect(() => {
    if(price.from && price.to){
      if(Number(price.from) > Number(price.to)){
        alert('From cannot be greater than To')
      }
    }
  }, [price])
  
  
  const fetchHighestPrice = async() =>{
    const response = await apiGetProduct({sort:'-price', limit:1})
    if(response.success){
      setBestPrice(response.products[0]?.price)
    }
  }


  //goi 1 lan duy nhat thoi
  useEffect(() => { 
    if(type==='input') fetchHighestPrice()
   },[])
  
  return (
    <div 
    onClick={()=>changeActiveFilter(name)}
    className='cursor-pointer text-gray-500  p-3 text-xs relative border border-gray-800 flex gap-6 justify-between items-center'>
        <span className='capitalize'>{name}</span>
        <FaCaretDown />
        {activeClick === name && <div className='absolute z-10 top-[calc(100%+1px)] left-0 w-fit p-4 border bg-white min-w-[150px]'>
            {type === 'checkbox' && 
              <div className=''>
                <div className='p-4 items-center flex justify-between gap-8 border-b'>
                  <span className='whitespace-nowrap'>
                    {`${selected.length} selected`}
                  </span>
                  <span onClick={e=>{
                    e.stopPropagation() 
                    setSelected([])
                    changeActiveFilter(null)
                    }} className='cursor-pointer underline hover:text-main'>Reset</span>
                </div>
                <div onClick={e=> e.stopPropagation()} className='flex flex-col gap-3 mt-4'>
                {
                  colors.map((el,index)=>(
                    <div key={index} className='flex items-center gap-4'>
                      <input type='checkbox' onChange={handleSelected} id={el} value={el} checked={selected.some(selectedItem => selectedItem===el)}/>
                      <label className='capitalize text-gray-700' htmlFor={el}>{el}</label>
                    </div>
                  ))
                }
                </div>
              </div>
            }
            {type === 'input' &&
              <div onClick={e=>e.stopPropagation()}>
                <div className='p-4 items-center flex justify-between gap-8 border-b'>
                  <span className='whitespace-nowrap'>
                    {`The highest price is ${Number(bestPrice).toLocaleString()} VND`}
                  </span>
                  <span onClick={e=>{
                    e.stopPropagation() 
                    setPrice({from:'',to:''})
                    changeActiveFilter(null)
                    }} className='cursor-pointer underline hover:text-main'>Reset</span>
                </div>
                <div className='flex items-center p-2 gap-2'>
                  <div className='flex items-center gap-2'>
                    <label htmlFor='From'>From</label>
                    <input 
                      className='form-input' 
                      type="number" 
                      id="From"
                      value={price.from}
                      onChange={e=> setPrice(prev => ({...prev, from: e.target.value}))}
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <label htmlFor='To'>To</label>
                    <input 
                      className='form-input' 
                      type="number" 
                      id="To"
                      value={price.to}
                      onChange={e=> setPrice(prev => ({...prev, to: e.target.value}))}
                    />
                  </div>
                </div>
              </div>
            }
        </div>}
    </div>
  )
}

export default memo(SearchItem)