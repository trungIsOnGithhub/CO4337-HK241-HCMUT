import React, {useState, useEffect, useRef} from 'react'
import styled from 'styled-components'
import ChatInput from './ChatInput'
// import {getAllMessagesRoute, sendMessageRoute} from '../utils/APIRoutes'
import axios from 'axios'
import {v4 as uuidv4} from 'uuid'
import { apiAddMessage, apigetAllMessageFromSenderToReceiver } from 'apis/message'
import defaultAvatar from '../../assets/avatarDefault.png'
import { FaQuestionCircle } from 'react-icons/fa'

const ChatContainer = ({currentChat, currentUser, socket}) => {
    const [messages, setMessages] = useState([])
    const [arrivalMessage, setArrivalMessage] = useState(null)
    const [openQuestionsMenu, setOpenQuestionsMenu] = useState(false)
    const [givenQuestionsHint, setGivenQuestionsHint] = useState(true)
    const [firstTimeChat, setFirstTimeChat] = useState(true);
    const scrollRef = useRef()

    const messagesEndRef = useRef(null)

    useEffect(() => {
        setOpenQuestionsMenu(false);
        if(currentChat){
            console.log('//////////////////////////', currentChat);
            const fetchMessages = async() => {
                const response = await apigetAllMessageFromSenderToReceiver({
                    from: currentUser._id,
                    to: currentChat._id
                })
                if (response?.length) {
                    setFirstTimeChat(false)
                    setMessages(response);
                }
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
        if(arrivalMessage) {
            setMessages((prev) => [...prev, arrivalMessage])
        }
    }, [arrivalMessage]);


    useEffect(() => {
        scrollRef.current?.scrollIntoView({behaviour: "smooth"})
        messagesEndRef.current?.scrollIntoView({behaviour: "smooth"})
    }, [messages]);

  return ( 
    <Container ref={messagesEndRef}>
        <div className='chat-header flex justify-between'>
            <div className='user-details mb-2'>
                <div className='avatar'>
                    <img src={currentChat?.avatar || defaultAvatar} alt='avatar'/>
                </div>
                <div className='username'>
                    <h3>
                        {`${currentChat?.firstName} ${currentChat?.lastName}`}
                    </h3>
                    { currentChat?.provider_id?.bussinessName &&
                        <h4 className="p-1 text-blue-400 rounded-md">
                            { currentChat?.provider_id?.bussinessName }
                        </h4>
                    }  
                </div>
            </div>

            {currentChat?.provider_id && <span
                onClick={() => {setOpenQuestionsMenu(prev => !prev);}}
                className='text-gray-600 text-center cursor-pointer flex mb-2'
            >
                Suggested questions&nbsp;<FaQuestionCircle/>
            </span>}
        </div>

        <div className='h-full overflow-y-auto relative'>
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
            {/*
                currentChat?.provider_id?.bussinessName && givenQuestionsHint &&
                <div className='p-2 flex flex-col justify-start items-center text-slate-400 h-fit w-fit absolute top-4 sticky top-0 opacity-75 bg-black mx-auto rounded-md border-2 border-blue-500'>
                    <h4 className='text-center text-slate-400 font-semibold text-lg'>Suggested Questions</h4>
                    {
                        firstTimeChat &&
                        currentChat?.provider_id?.chatGivenQuestions?.slice(0,3).map(qna => {
                            return (
                                <div class="p-2 hover:bg-blue-600 rounded-md flex justify-center m-1 p-2 w-fit"
                                    onClick={() => {
                                        const newMessages = [...messages, {message:qna.question, fromSelf:true}];
                                        if (qna.answer) {
                                            newMessages.push({message:qna.answer, fromSelf:false});
                                        }
                                        setMessages(newMessages);
                                    }}
                                >
                                    {  qna.question }
                                </div>
                            );
                        })
                    }
                    <a href="#" onClick={() => {setOpenQuestionsMenu(true);}} className='underline mt-1'>View All Suggested Questions</a>
                </div>
            */}

            {
                currentChat?.provider_id && openQuestionsMenu &&
                <div className='bg-slate-400 w-1/2 px-2 py-6 flex flex-col justify-center rounded-t-md z-99 sticky top-0 left-1/4'>
                    <h4 className='text-center font-semibold text-lg'>Given Questions</h4>
                    {
                        currentChat?.provider_id?.chatGivenQuestions?.map(qna => {
                            return (
                                <div class="p-2 bg-linme-500 rounded-t-md flex justify-center border m-4 p-4 hover:bg-blue-500"
                                    onClick={() => {
                                        const newMessages = [...messages, {message:qna.question, fromSelf:true}];
                                        if (qna.answer) {
                                            newMessages.push({message:qna.answer, fromSelf:false});
                                        }
                                        setMessages(newMessages);
                                        setOpenQuestionsMenu(false);
                                    }}
                                >
                                    { qna.question }
                                </div>
                            );
                        })
                    }
                    <button className='btn bg-red-500 py-2 px-4 w-fit m-auto rounded-t-md mt-3' onClick={() => {setOpenQuestionsMenu(false);}}>Close This Menu</button>
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
        </div>
        {/* <ProviderOnlyInformationBar/> */}
        
        {/* <div className="h-1/4"> */}
            <ChatInput handleSendMsg={handleSendMsg} onClick={() => {setGivenQuestionsHint(false)}}/>
        {/* </div> */}
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
        border-bottom: 3px solid blue;
        padding-bottom: 4px;
        .user-details{
            display: flex;
            align-items: center;
            gap: 1rem;
            .avatar{
                img{
                    height: 3rem;
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
                color: black;
            }
        }
    }
    .sended{
        justify-content: flex-end;
        .content{
            background-color: #4f04ff21;
            color: black;
        }
    }
    .recieved{
        justify-content: flex-start;
        .content{
            background-color: #9900ff21;
            color: black;
        }
    }
`
export default ChatContainer
