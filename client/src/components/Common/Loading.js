import React, { memo } from 'react'
import { HashLoader } from 'react-spinners'

const Loading = () => {
  return (
    <HashLoader color='#ee3131'></HashLoader>
  )
}

export default memo(Loading)