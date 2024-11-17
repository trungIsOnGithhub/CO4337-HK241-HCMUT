import React, {useState, useEffect, useRef} from 'react'
import styled from 'styled-components'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import Contact from './Contact'
import Welcome from './Welcome'
import ChatContainer from './ChatContainer'
import { getCurrent } from 'store/user/asyncAction'

//Socket
import {io} from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux'
import { apiGetAllContact } from 'apis'
import { host } from 'ultils/APIRoute'
import { apigetLastMessages } from 'apis/message'

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {current} = useSelector(state => state.user)
  const socket = useRef()
  
  const [contacts, setContacts] = useState([])

  const [currentChat, setCurrentChat] = useState(undefined)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    dispatch(getCurrent())
  }, []);

  useEffect(() => {
    if(current){
      socket.current = io(host)
      socket.current.emit("add-user", current._id)
      setIsLoaded(true)
    }
  }, [current]);

  useEffect(() => {
    const fetchData = async () => {
      if(current){
        const response = await apigetLastMessages({userId: current._id})
        setContacts(response)
      }
    }
    fetchData();
  }, [current]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat)
  }

  return (
    
    <Container>
      <div className='container bg-white p-6 rounded-md'>
        <Contact contacts={contacts} currentUser={current} changeChat={handleChatChange}/>
        {
          isLoaded && (currentChat === undefined ?
          <div className='bg-slate-300 rounded-r-md'><Welcome currentUser={current}/></div> : 
          <ChatContainer currentChat={currentChat} currentUser={current} socket={socket}/>)
        }
      </div>
    </Container>
  )
}

const Container =styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  .container{
    height: 85vh;
    width: 85vw;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width:720px) and (max-width: 1080px){
      grid-template-columns: 35% 65%;
      
    }
  }
`
export default Chat