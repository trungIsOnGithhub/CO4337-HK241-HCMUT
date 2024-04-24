import React, {useEffect, useState, useCallback} from 'react'
import { useParams, useSearchParams, createSearchParams, useNavigate} from 'react-router-dom'
import { Breadcrumb, Product, SearchItem, InputSelect, Pagination} from '../../components'
import { apiGetProduct } from '../../apis'
import Masonry from 'react-masonry-css'
import { sorts } from '../../ultils/constant'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import withBaseComponent from 'hocs/withBaseComponent'
import { getCurrent } from 'store/user/asyncAction'

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const Products = ({dispatch}) => {
  const navigate = useNavigate()
  const [products, setProducts] = useState(null)
  const [active, setActive] = useState(null)
  const [params] = useSearchParams()
  const [sort, setSort] = useState('')
  const {category} = useParams()
  console.log(category)
  const {isShowModal} = useSelector(state => state.app)


  const fetchProductCategories = async (queries) =>{
    if(category && category !== 'products'){
      queries.category = category
    }
    const response = await apiGetProduct(queries)
    if(response.success) setProducts(response)
    dispatch(getCurrent())
  }

  useEffect(() => {
    console.log('chay qua ham nay ko')
    window.scrollTo(0,0)
    const queries = Object.fromEntries([...params])
    let priceQuery =  {}
    if(queries.to && queries.from){
      priceQuery = {$and: [
        {price: {gte: queries.from}},
        {price: {lte: queries.to}},
      ]}
      delete queries.price
    }
    else{
      if(queries.from) queries.price = {gte:queries.from}
      if(queries.to) queries.price = {gte:queries.to}
    }
    delete queries.from
    delete queries.to
    const q = {...priceQuery, ...queries}
    fetchProductCategories(q)
  }, [params])
  
  const changeActive = useCallback((name)=>{
    if(name===active) setActive(null)
    else {
      setActive(name)
    }
  },[active])

  const changeValue = useCallback((value)=>{
    setSort(value)
  },[sort])

  useEffect(() => {
    if(sort){
      navigate({
      pathname: `/${category}`,
      search: createSearchParams({
        sort
      }).toString()
      }) 
    }   
  }, [sort])
  
  return (
    <div className='w-full'>
      <div className='h-[81px] flex items-center justify-center bg-gray-100'>
        <div className='w-main'>
          <h3 className='font-semibold uppercase'>{category}</h3>
          <Breadcrumb category={category} />
        </div>
      </div>
      <div className='w-main border p-4 flex justify-between m-auto mt-8'>
        <div className='w-4/5 flex-auto flex flex-col gap-3'>
          <span className='font-semibold text-sm'>Filter by:</span>
          <div className='flex items-center gap-4'>
          <SearchItem name='price' activeClick={active} changeActiveFilter={changeActive} type='input'/>
          <SearchItem name='color' activeClick={active} changeActiveFilter={changeActive}/>
          </div>
        </div>
        <div className='w-1/5 flex flex-col gap-3'>
          <span className='font-semibold text-sm'>Sort by:</span>
          <div className='w-full'> 
            <InputSelect value={sort} options={sorts} changeValue={changeValue} />
          </div>
        </div>
      </div>
      <div className={clsx('mt-8 w-main m-auto', isShowModal ? 'hidden' : '')}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid flex mx-[-10px]"
          columnClassName="my-masonry-grid_column">
          {products?.products?.map(el => (
            <Product 
              key={el._id} 
              productData={el}
              pid= {el._id}
              normal={true}
            />
          ))}
        </Masonry>
      </div>
      <div className='w-main m-auto my-4 flex justify-end'>
       {products&&
       <Pagination 
       totalCount={products?.counts}/>}
      </div>
      <div className='w-full h-[500px]'>
      </div>
    </div>
  )
}

export default withBaseComponent(Products)