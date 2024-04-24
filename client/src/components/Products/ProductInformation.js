import React, { memo,useState,useCallback} from 'react'
import {tabs} from 'ultils/constant'
import {VoteBar, Button, VoteOption, Comment} from '../index'
import { renderStarfromNumber } from 'ultils/helper'
import { apiRatings } from 'apis'
import { useDispatch, useSelector } from 'react-redux'
import {showModal} from 'store/app/appSlice'
import Swal from 'sweetalert2'
import path from 'ultils/path'
import { useNavigate } from 'react-router-dom'

const ProductInformation = ({totalRatings, ratings, nameProduct, pid, reRender}) => {
    const [activeTab, setActiveTab] = useState(1)
    const dispatch = useDispatch()

    const navigate = useNavigate()

   

    const {isLogin} = useSelector(state => state.user)
    const handleSubmitVoteOption = async({comment, score})=>{
        if(!comment|| !score|| !pid) {
            alert('Missing input. Please rating again!')
            return
        }
        await apiRatings({star:score, comment, pid, updatedAt:Date.now() })
        dispatch(showModal({isShowModal:false, modalChildren: null}))
        reRender()
    }

    const handleVoteNow = () => {
        if(!isLogin){
            Swal.fire({
                text: 'Login to vote',
                cancelButtonText: 'Cancel',
                confirmButtonText: 'Go login',
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                title: 'Oops!',
                showCancelButton: true,
            }).then((rs)=>{
                if(rs.isConfirmed){
                    navigate(`/${path.LOGIN}`)
                }
            })
        }
        else{
            dispatch(showModal({isShowModal: true, modalChildren: <VoteOption 
                nameProduct={nameProduct} 
                handleSubmitVoteOption={handleSubmitVoteOption}/>}))
        }
    }

    return (
    <div className=''>
        
        <div className='flex items-center gap-2 relative bottom-[-1px]'>
            {tabs.map(el=>(
                <span 
                    onClick={()=>{setActiveTab(el.id)}}
                    className={`p-2 px-4 cursor-pointer ${activeTab===el.id ? 'bg-white border border-b-0': 'bg-gray-200'}`} key={el.id}>
                    {el.name}
                </span>
            ))}
        </div>
        <div className='w-full border p-4'>
            {tabs.some(el => el.id === activeTab) && tabs[activeTab-1]?.content}
           
        </div>
        <div className='flex py-8 flex-col w-main'>
            <div className='flex border'>
            <div className='flex-4 flex flex-col items-center justify-center '>
                <span className='font-semibold text-3xl'>{`${totalRatings}/5`}</span>
                <span className='flex items-center gap-1'>{renderStarfromNumber(totalRatings)?.map((el,index) => (
                    <span key={index}>{el}</span>
                ))}</span>
                <span className='text-sm'>{`${ratings?.length} reviewers`}</span>
            </div>
            <div className='flex-6 flex flex-col gap-2 order p-4'>
                {Array.from(Array(5).keys()).reverse().map(el=>(
                    <VoteBar key={el} number={el+1} totalCount={ratings?.length} count={ratings?.filter(i => i.star === el+1)?.length}/>
                ))}
            </div>
            </div>
            <div className='p-4 flex items-center justify-center text-sm flex-col gap-2'>
                <span>Do you review this product?</span>
                <Button handleOnclick={handleVoteNow}>Rate now!</Button>
            </div>
            <div className='flex flex-col gap-4'>
                {ratings?.map(el=>(
                    <Comment 
                        key = {el._id}
                        star = {el.star}
                        updatedAt = {el.updatedAt}
                        comment = {el.comment}
                        name={`${el.postedBy.lastName} ${el.postedBy.firstName}`}c
                    />
                ))}
            </div>
        </div>
    </div>
  )
}

export default memo(ProductInformation)