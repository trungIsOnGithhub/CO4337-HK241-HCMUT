import React, {useState, useEffect, useRef} from 'react'
import styled from 'styled-components'
import ChatInput from './ChatInput'
// import {getAllMessagesRoute, sendMessageRoute} from '../utils/APIRoutes'
import axios from 'axios'
import {v4 as uuidv4} from 'uuid'
import { apiAddMessage, apigetAllMessageFromSenderToReceiver } from 'apis/message'
import defaultAvatar from '../../assets/avatarDefault.png'
import { FaQuestion } from 'react-icons/fa'

const ChatContainer = ({currentChat, currentUser, socket}) => {
    const [messages, setMessages] = useState([])
    const [arrivalMessage, setArrivalMessage] = useState(null)
    const [openQuestionsMenu, setOpenQuestionsMenu] = useState(false)
    const [givenQuestionsHint, setGivenQuestionsHint] = useState(true)
    const scrollRef = useRef()

    const messagesEndRef = useRef(null)

    useEffect(() => {
        if(currentChat){
            const fetchMessages = async() => {
                const response = await apigetAllMessageFromSenderToReceiver({
                    from: currentUser._id,
                    to: currentChat._id
                })
                setMessages(response)
            }
            fetchMessages();
        }
    }, [currentChat]);
    
    const handleSendMsg = async(msg) => {
        await apiAddMessage({
            from: currentUser._id,
            to: currentChat._id,
            message: msg
        })
        socket.current.emit("send-msg", {
            to: currentChat?._id,
            from: currentUser?._id,
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
        messagesEndRef.current?.scrollIntoView({behaviour: "smooth"})
    }, [messages]);

  return ( 
    <Container ref={messagesEndRef}>
        <div className='chat-header'>
            <div className='user-details'>
                <div className='avatar'>
                    <img src={currentChat?.avatar || defaultAvatar} alt='avatar'/>
                </div>
                <div className='username'>
                    <h3>
                        {`${currentChat?.firstName} ${currentChat?.lastName}`}
                    </h3>
                    { currentChat?.provider_id?.bussinessName &&
                        <h4 className="p-1 bg-lime-600 rounded-md">
                            { currentChat?.provider_id?.bussinessName }
                        </h4>
                    }  
                </div>
            </div>
        </div>
        {/* {
            currentChat?.provider_id?.bussinessName &&
            <div className='flex justify-center h-fit'>
                <div className="text-green-900 bg-lime-600 w-fit rounded-md p-2 text-sm text-center hover:bg-slate-500 mt-2"
                    onClick={() => {setOpenQuestionsMenu(true)}}
                >
                    You Can Use Given Questions In Chat With Service Provider <FaQuestion className='inline mb-1'/>
                </div>
            </div>
        } */}
        {
            currentChat?.provider_id?.bussinessName && givenQuestionsHint &&
            <div className='p-5 flex flex-col justify-start items-center text-slate-400 h-16'>
                <h4 className='text-center text-slate-400 font-semibold text-lg'>Suggested Questions</h4>
                {
                    currentChat.provider_id.chatGivenQuestions?.slice(0,3).map(question => {
                        return (
                            <div class="p-2 hover:bg-blue-600 rounded-md flex justify-center m-1 p-2 w-fit"
                                onClick={() => {setMessages(prev => [...prev, {message:question, fromSelf:true}])}}
                            >
                                { question }
                            </div>
                        );
                    })
                }
                <a href="#" onClick={() => {setOpenQuestionsMenu(true);}} className='underline mt-1'>View All Given Questions</a>
            </div>
        }
        {
            currentChat?.provider_id?.bussinessName && openQuestionsMenu &&
            <div className='absolute top-30 left-1/4 bg-slate-500 w-1/2 px-2 py-8 flex flex-col justify-center rounded-md'>
                <h4 className='text-center font-semibold text-lg'>Given Questions</h4>
                {
                    currentChat.provider_id.chatGivenQuestions?.map(question => {
                        return (
                            <div class="p-2 bg-linme-500 rounded-md flex justify-center border m-4 p-4 hover:bg-blue-500"
                                onClick={() => {setMessages(prev => [...prev, {message:question, fromSelf:true}])}}
                            >
                                { question }
                            </div>
                        );
                    })
                }
                <button className='btn bg-red-500 py-2 px-4 w-fit m-auto rounded-md mt-3' onClick={() => {setOpenQuestionsMenu(false);}}>Close This Menu</button>
            </div>
        }
        <div className='chat-messages'>
            {
                messages?.map((message) => {
                    return (
                        <div  ref={scrollRef} key={uuidv4()}>
                            <div className={`message ${message.fromSelf ? "sended" : "recieved"}`}>
                                <div className='content'>
                                    <p>
                                        {message.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
        {/* <ProviderOnlyInformationBar/> */}

        <ChatInput handleSendMsg={handleSendMsg} onClick={() => {setGivenQuestionsHint(false)}}/>
    </Container>
  )
}

const Container = styled.div`
    padding-top: 1rem;
    display: grid;
    grid-template-rows: 10% 78% 12%;
    gap: 0.1rem;
    overflow: hidden;
    @media screen and (min-width: 720px) and (max-width: 1080px){
        grid-template-rows: 15% 70% 15%;
    }
    .chat-header{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 2rem;
        .user-details{
            display: flex;
            align-items: center;
            gap: 1rem;
            .avatar{
                img{
                    height: 3rem;
                }
            }
            .username{
                h3{
                    color: white;

                }
            }
        }
    }
    .chat-messages{
        padding: 1rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        overflow: auto;
        &::-webkit-scrollbar{
            width: 0.5rem;
            &-thumb{
                background-color: #ffffff39;
                width: 0.1rem;
                border-radius: 1rem;
            }
        }
        .message{
            display: flex;
            align-items: center;
            .content{
                max-width: 40%;
                overflow-wrap: break-word;
                padding: 1rem;
                font-size: 1.1rem;
                border-radius: 1rem;
                color: #d1d1d1;
            }
        }
    }
    .sended{
        justify-content: flex-end;
        .content{
            background-color: #4f04ff21;
        }
    }
    .recieved{
        justify-content: flex-start;
        .content{
            background-color: #9900ff21;
        }
    }
`
export default ChatContainer