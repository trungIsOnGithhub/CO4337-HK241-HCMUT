// Note:
// 1. first + last + current + sibling + 2*DOTS
// min: 6
// totalPagination: ceil(total/countperpage)
// totalPaginationItem: sibling + 5

import { useMemo } from 'react'
import { generateRange } from '../ultils/helper'
import { HiDotsHorizontal } from "react-icons/hi";

const usePagination = (totalCount, currentPage, siblingCount = 1) => {
    const paginationArray = useMemo(() => {
        const pageSize = process.env.REACT_APP_LIMIT||10
        const pagination = Math.ceil(totalCount / pageSize)

        const paginationItem = siblingCount + 5
        if(pagination <= paginationItem){
            return generateRange(1,pagination)
        }
        const isShowLeft = currentPage - siblingCount > 2
        const isShowRight = currentPage + siblingCount < pagination - 1

        if(isShowLeft && !isShowRight){
            const rightStart = pagination - 4
            const rightRange = generateRange(rightStart, pagination)
            return [1, <HiDotsHorizontal />, ...rightRange]
        }
        if(!isShowLeft && isShowRight){
            const leftRange = generateRange(1, 5)
            return [...leftRange, <HiDotsHorizontal />, pagination]
        }
        const siblingLeft = Math.max(currentPage - siblingCount,1)
        const siblingRight = Math.min(currentPage + siblingCount,pagination)
        
        if(isShowLeft && isShowRight){
            const middleRange = generateRange(siblingLeft, siblingRight)
            return [1,<HiDotsHorizontal />, ...middleRange, <HiDotsHorizontal />, pagination]
        }

    },[totalCount, currentPage, siblingCount])
    return paginationArray
}

export default usePagination