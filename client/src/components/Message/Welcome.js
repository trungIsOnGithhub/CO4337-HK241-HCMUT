import React from 'react'
import styled from 'styled-components'
import Robot from '../../assets/robot.gif'

const Welcome = ({currentUser}) => {

  return (
    <Container>
        <img src={Robot} alt='robot'/>
        <h1 className='text-gray-600'>
            Welcome, <span className='text-gray-600'>{`${currentUser?.firstName} ${currentUser?.lastName}`}</span>
        </h1>
        <h3 className='text-gray-600'>Select a chat to start.</h3>
    </Container>
  )
}

const Container = styled.div`
    display:flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: white;
    img{
        height: 20rem;
    }
`
export default Welcome