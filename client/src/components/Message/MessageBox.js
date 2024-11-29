import { FaRegWindowClose } from 'react-icons/fa'; // Import close icon
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
import { apiGetProviderByOwnerId } from 'apis';

const MessageBox = ({currentChat}) => {
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  // const [messages, setMessages] = useState([
  //   { type: 'admin', text: 'Hello! How can we help you today?' },
  // ]);
  // const [customMessage, setCustomMessage] = useState(''); // State for custom message input

  const dispatch = useDispatch()
  const socket = useRef()
  const scrollRef = useRef()
  const {current} = useSelector(state => state.user)
  const [messages, setMessages] = useState([])
  const [arrivalMessage, setArrivalMessage] = useState(null)

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [msg, setMsg] = useState("")
  const [currentChatProvider, setCurrentChatProvider] = useState(null);

  useEffect(() => {
    const fetchCurrentChatProvider = async() => {
      let response = await apiGetProviderByOwnerId({owner:currentChat?.id});
      console.log("111111111111111>>>>", response.provider);
      if (response?.success && response?.provider?.bussinessName) {
        // console.log('[[[[[[[[[[');
        setCurrentChatProvider(response.provider)
      }
    }
    fetchCurrentChatProvider()
  }, [isQuickMenuOpen]);


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
        console.log('================');
        console.log(currentChat);
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
  // const handleSendMsgReversed = async(msg) => {
  //   await apiAddMessage({
  //       to: current._id,
  //       from: currentChat.id,
  //       message: msg
  //   })
  //   socket.current.emit("send-msg", {
  //       to: current._id,
  //       from: currentChat.id,
  //       message: msg
  //   })
  //   const msgs = [...messages]
  //   msgs.push({fromSelf: false, message: msg})
  //   setMessages(msgs)
  // }

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
    // event.preventDefault()
    if(msg.length  > 0){
        handleSendMsg(msg)
        setMsg("")
    }
}

  return (
    <div className="fixed bottom-2 right-2 z-[9999] max-w-[380px]">
      {/* Minimized MessageBox */}
      {/* {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#0a66c2] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#084a93] transition-all"
        >
          💬 Chat with Us
        </button>
      )} */}

      {/* Expanded MessageBox */}

        <div className="w-full max-w-[350px] min-h-[60vh] max-h-[75vh] bg-white shadow-lg rounded-lg flex flex-col overflow-hidden border border-[#0a66c2] transition-all">
          {/* Header */}
          <div className="bg-[#0a66c2] text-white px-4 py-3 flex items-start space-x-3 relative">
            <img
              src={currentChat?.avatar || defaultAvatar} // Replace with actual avatar URL
              alt="support avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className='flex flex-col  w-full max-h-8'>
              <span className={clsx(currentChatProvider?.bussinessName && 'text-xs font-medium' ,'font-semibold')}>{`${currentChat?.firstName} ${currentChat?.lastName}`}</span>
              <span className="text-xs text-gray-200 flex">{currentChatProvider?.bussinessName}</span> {/* Organization */}
            </div>

            <span className='flex w-full items-start justify-end'>
              { currentChatProvider &&
              <button
                onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
                className="text-xs text-white hover:opacity-80 ml-auto border p-1 rounded-md hover:bg-white hover:text-[#0a66c2]"
              >
                {isQuickMenuOpen ? 'Hide Quick Questions' : 'Show Quick Questions'}
              </button>
              }
              <button
                onClick={() => {handleCloseMessageBox();}}
                className="ml-2 text-white hover:opacity-80 text-2xl" // Bigger size
              >
                <FaRegWindowClose />
              </button>
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50 max-h-[350px]">
            {messages.map((msg, idx) => (
              <div
                ref={scrollRef}
                key={idx}
                className={`flex ${
                  msg.fromSelf ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`${
                    msg.fromSelf === 'admin'
                      ? 'bg-[#e8f4fd] text-left'
                      : 'bg-[#d0ebff] text-right'
                  } p-3 rounded-lg w-fit max-w-xs`}
                >
                  {msg.message || 'no content'}
                </div>
              </div>
            ))}

{isQuickMenuOpen && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gray-100 border-t border-[#0a66c2] z-[99]">
              <h3 className='font-semibold text-sm text-center text-[#0a66c2]'>Quick Questions:</h3>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {currentChatProvider?.chatGivenQuestions?.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const newMessages = [...messages, {message:item.question, fromSelf:true}];
                      // handleSendMsg(item.question);

                      if (item.answer) {
                          newMessages.push({message:item.answer, fromSelf:false});
                          // handleSendMsgReversed(item.answer);
                      }
                      setMessages(newMessages);
                      setIsQuickMenuOpen(false);

                  }}
                    className="w-full text-left bg-gray-200 px-3 py-2 rounded-md hover:bg-gray-300 transition overflow-y-auto max-h-16"
                  >
                    {item?.question || 'No question available'}
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>

          {/* Predefined Questions */}


          {/* Custom Message Input */}
          <div className="p-2 bg-gray-100 border-t border-[#0a66c2] flex justify-between items-center h-[100px]">
            <div className='flex items-center gap-1 w-[80%]'>
              <div className='text-yellow-400 cursor-pointer text-xl font-semibold flex items-center relative w-[7%]'>
                <BsEmojiSmileFill onClick={handleEmojiPickerHideShow}/>
                {
                    showEmojiPicker && 
                    <div className='absolute top-[-350px] left-0 bg-[#080420] border border-[#9186f3] shadow-lg shadow-[#9a86f3]'>
                      <Picker onEmojiClick={handleEmojiClick} />
                    </div>
                }
              </div>
              <input
                type="text"
                value={msg}
                onChange={e=>setMsg(e.target.value)}
                onKeyDown={e=>{
                  if (e.key === 'Enter' && e.target.value?.length > 0) {
                    setMsg(e.target.value);
                  }
                }}
                placeholder="Write a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
              />
            </div>
            <button
              onClick={(e)=>sendChat(e)}
              className="bg-[#0a66c2] text-white px-4 py-2 rounded-md hover:bg-[#084a93] transition w-[15%] h-fit flex items-center justify-center"
            >
              Send
            </button>
          </div>
        </div>

    </div>
  );
};

export default MessageBox;