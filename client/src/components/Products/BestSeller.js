import React, {useState, useEffect, memo} from 'react'
import {apiGetProduct} from 'apis/product'
import {Product, CustomSlider} from '../'
import {getNewProducts} from 'store/product/asyncAction'
import { useDispatch, useSelector} from 'react-redux'
import clsx from 'clsx'
const tabs = [
    {
        id: 1,
        name: 'best seller'
    },
    {
        id: 2,
        name: 'new arrivals'
    },
]

const BestSeller = () => {
    const [bestSeller, setBestSeller] = useState(null)
    const [activeTab, setActiveTab] = useState(1)
    const [product, setProduct] = useState(null)
    const dispatch = useDispatch()
    const {newProducts} = useSelector(state => state.product)
    const {isShowModal} = useSelector(state => state.app)
    const fetchProduct =  async() =>{
        const response = await apiGetProduct({sort:'-sold'})
        if(response?.success){
            setBestSeller(response.products)
            setProduct(response.products)}
        
    }
    useEffect(()=>{
        fetchProduct()
        dispatch(getNewProducts())
    },[])

    useEffect(()=>{
        if(activeTab===1) setProduct(bestSeller)
        else if(activeTab===2) setProduct(newProducts)
    },[activeTab])
  return (
    <div className={clsx(isShowModal ? 'hidden' : '' )}>
        <div className='flex text-[20px] ml-[-32px]'>
            {tabs.map(el => (
                <span 
                    key={el.id} 
                    className={`font-semibold uppercase px-8 border-r text-gray-400 cursor-pointer ${activeTab === el.id ? 'text-gray-900': ''}`}
                    onClick={()=> setActiveTab(el.id)}>
                    {el.name}
                </span>
            ))}
        </div>
        <div className='mt-4 mx-[-10px] border-t-2 border-main pt-4'>
            <CustomSlider products={product} activeTab={activeTab}/>
        </div>
        <div className='w-full flex gap-4 mt-4'>
            <img src="https://digital-world-2.myshopify.com/cdn/shop/files/banner2-home2_2000x_crop_center.png?v=1613166657"
                className='flex-1 object-contain'
            />
            <img src="https://digital-world-2.myshopify.com/cdn/shop/files/banner1-home2_2000x_crop_center.png?v=1613166657"
                className='flex-1 object-contain'
            />
        </div>
    </div>

  )
}

export default memo(BestSeller)