
import React, { memo, useRef, useEffect} from 'react'
import icons from '../../ultils/icon'

const  {FaStar} = icons
const VoteBar = ({number, count, totalCount}) => {
    const percent = useRef()
    useEffect(() => {
        const percentt = Math.round(count*100/totalCount)||0
        percent.current.style.cssText = `right: ${100-percentt}%`
        
    }, [count, totalCount])
    
  return (
    <div className='flex items-center gap-2 text-sm text-gray-500'>
        <div className='flex w-[10%] items-center justify-center gap-1 text-sm'>
            <span>{number}</span>
            <FaStar color='orange' />
        </div>
        <div className='w-[75%]'> 
            <div className='w-full h-[6px] relative bg-gray-200 rounded-l-full rounded-r-full'>
                <div ref={percent} className='absolute inset-0 bg-red-500'></div>
            </div>
        </div>
        <div className='w-[15%] flex justify-end text-xs text-gray-400'> 
            {`${count||0} reviews`}
        </div>
    </div>
  )
}

export default memo(VoteBar)