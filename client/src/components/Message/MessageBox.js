import { apiAddMessage, apigetAllMessageFromSenderToReceiver } from 'apis/message'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {io} from 'socket.io-client'
import { host } from 'ultils/APIRoute'
import defaultAvatar from 'assets/avatarDefault.png'
import { FaXmark } from "react-icons/fa6";
import {showMessageBox} from '../../store/app/appSlice'
import {v4 as uuidv4} from 'uuid'
import clsx from 'clsx'
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import Picker from "emoji-picker-react";
import styled from "styled-components";
import { GoDotFill } from "react-icons/go";

const MessageBox = ({currentChat}) => {
  const dispatch = useDispatch()
  const socket = useRef()
  const scrollRef = useRef()
  const {current} = useSelector(state => state.user)
  const [messages, setMessages] = useState([])
  const [arrivalMessage, setArrivalMessage] = useState(null)

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [msg, setMsg] = useState("")

  const handleEmojiPickerHideShow = () => { 
    setShowEmojiPicker(!showEmojiPicker)
  }

  const handleEmojiClick = (event, emoji) => {
      let message = msg;
      message += emoji.emoji;
      setMsg(message)
  }

  useEffect(() => {
    if(currentChat){
        const fetchMessages = async() => {
            const response = await apigetAllMessageFromSenderToReceiver({
                from: current._id,
                to: currentChat.id
            })
            setMessages(response)
        }
        fetchMessages()
    }
}, [currentChat]);

  useEffect(() => {
    if(current){
      socket.current = io(host)
      socket.current.emit("add-user", current._id)
    }
  }, [current]);

  const handleSendMsg = async(msg) => {
    await apiAddMessage({
        from: current._id,
        to: currentChat.id,
        message: msg
    })
    socket.current.emit("send-msg", {
        to: currentChat.id,
        from: current?._id,
        message: msg
    })
    const msgs = [...messages]
    msgs.push({fromSelf: true, message: msg})
    setMessages(msgs)
  }

  useEffect(() => {
    if(socket.current){
        socket.current.on('msg-recieve', (msg) => {
            setArrivalMessage({fromSelf: false, message: msg})
        })
    }
}, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage])
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({behaviour: "smooth"})
  }, [messages]);

  const handleCloseMessageBox = () => {
    dispatch(showMessageBox())
  }

  const sendChat = (event) => {
    event.preventDefault()
    if(msg.length  > 0){
        handleSendMsg(msg)
        setMsg("")
        // Scroll to bottom after sending message
        // scrollToBottom()
    }
}

  return (
    <div className='fixed bottom-0 right-0 mb-4 mr-8 z-50 w-[300px] h-[400px] bg-slate-200 border border-gray-400 rounded-md overflow-hidden shadow-lg flex flex-col'>
      <div className='flex justify-between px-4 py-2 border-b border-gray-400 items-center'>
        <div className='flex gap-4 justify-start'>
          <div className='avatar'>
            <img className='w-10 h-10 object-cover rounded-full' src={currentChat?.avatar || defaultAvatar} alt='avatar'/>
          </div>
          <div className='flex flex-col'>
            <h3>
              {`${currentChat?.firstName} ${currentChat?.lastName}`}
            </h3>
            <small className='text-xs text-green-500 font-semibold flex items-center'><GoDotFill className='inline-block mr-[2px] text-green-500' />Đang hoạt động</small>
          </div>
        </div>
        <span className='cursor-pointer text-red-500 font-semibold text-2xl' onClick={() => {handleCloseMessageBox()}}>
          <FaXmark />
        </span>
      </div>
      <div className='flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-white'>
        {
          messages?.map((message)=> {
            return (
              <div ref={scrollRef} key={uuidv4()} className='py-2'>
                <div className={`flex w-full ${message.fromSelf ? "justify-end" : "justify-start"}`}>
                  <span className={clsx('p-2 rounded-md inline-block max-w-[60%] break-words', message.fromSelf ? 'bg-blue-500' : 'bg-slate-400')}>
                    {message.message}
                  </span>
                </div>
              </div>
            )
          })
        }
      </div>
      <div className='flex w-full gap-4 items-center px-2 py-1 border-t border-gray-400 bg-slate-200'>
        <div className='text-yellow-400 cursor-pointer text-xl font-semibold flex items-center relative'>
          <BsEmojiSmileFill onClick={handleEmojiPickerHideShow}/>
          {
              showEmojiPicker && 
              <div className='absolute top-[-350px] left-0 bg-[#080420] border border-[#9186f3] shadow-lg shadow-[#9a86f3]'>
                <Picker onEmojiClick={handleEmojiClick} />
              </div>
          }
        </div>
        <form className='flex-1 flex gap-1 items-center' onSubmit={(e)=>sendChat(e)}>
            <input className='inline-block w-[90%] border border-gray-400 rounded-md outline-none px-1 py-1 placeholder:text-gray-400 placeholder:italic' type='text' placeholder='Type your message here ...' value={msg} onChange={(e)=>setMsg(e.target.value)}/>
            <button className='text-xl font-semibold'>
                <IoMdSend />
            </button>
        </form>
      </div>
</div>

  )
}

export default MessageBox
