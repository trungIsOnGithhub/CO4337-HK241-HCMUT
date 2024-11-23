import React, { memo } from 'react'
import usePagination from '../../hook/usePagination'
import {PageItem} from '..'
import { useSearchParams} from 'react-router-dom'

const REACT_APP_LIMIT = process.env.REACT_APP_LIMIT;
const Pagination = ({totalCount}) => {
  const [params] = useSearchParams()
  const pagination = usePagination(totalCount,+params.get('page')||1)

  const range = () =>{
    const currentPage = +params.get('page')
    const pageSize = REACT_APP_LIMIT;
    const start = Math.min((currentPage - 1) * pageSize + 1||totalCount)
    const end = Math.min(currentPage*pageSize, totalCount)
    return `${start} - ${end}`
  }
  return (
    <div className='flex w-full justify-between items-center pl-2'>
      {!+params.get('page') ? <span className='text-sm italic '>{`Show ${Math.min(totalCount,1)}-${Math.min(REACT_APP_LIMIT,totalCount)} of ${totalCount}`}</span>:''}
      {+params.get('page') ? <span className='text-sm italic '>{`Show ${range()} of ${totalCount}`}</span>:''}
      <div className='flex items-center'>
      {pagination?.map(el=>(
        <PageItem key={el}>
          {el}
        </PageItem>
      ))}
      </div>
    </div>
  )
}

export default memo(Pagination)

// Note:
// 1. first + last + current + sibling + 2*DOTS
// min: 6
// totalPagination: ceil(total/countperpage)
// totalPaginationItem: sibling + 5
