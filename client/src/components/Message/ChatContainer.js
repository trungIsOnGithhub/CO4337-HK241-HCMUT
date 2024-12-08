import React, {useState, useEffect, useRef} from 'react'
import styled from 'styled-components'
import ChatInput from './ChatInput'
// import {getAllMessagesRoute, sendMessageRoute} from '../utils/APIRoutes'
import axios from 'axios'
import {v4 as uuidv4} from 'uuid'
import { apiAddMessage, apigetAllMessageFromSenderToReceiver } from 'apis/message'
import defaultAvatar from '../../assets/avatarDefault.png'
import { FaQuestionCircle } from 'react-icons/fa'

const ChatContainer = ({messagesEndRef, currentChat, currentUser, socket}) => {
    const [messages, setMessages] = useState([])
    const [arrivalMessage, setArrivalMessage] = useState(null)
    const [openQuestionsMenu, setOpenQuestionsMenu] = useState(false)
    const [givenQuestionsHint, setGivenQuestionsHint] = useState(true)
    const [firstTimeChat, setFirstTimeChat] = useState(true);
    const scrollRef = useRef()


    useEffect(() => {
        setOpenQuestionsMenu(false);
        if(currentChat){
            // removed log
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
    <Container className='border-r border-t border-b border-[#0a66c2] rounded-r-md'>
        <div className='chat-header flex justify-between'>
            <div className='user-details h-full w-full'>
                <div className='avatar'>
                    <img className='w-[36px] h-[36px] object-cover rounded-full border border-[#0a66c2]' src={currentChat?.avatar || defaultAvatar} alt='avatar'/>
                </div>
                <div className='username'>
                    <h3>
                        {`${currentChat?.firstname} ${currentChat?.lastname}`}
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
                            <div ref={scrollRef} key={uuidv4()}>
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
    display: grid;
    grid-template-rows: 10% 75% 15%;
    gap: 0.1rem;
    overflow: hidden;
    @media screen and (min-width: 720px) and (max-width: 1080px){
        grid-template-rows: 10% 75% 15%;
    }
    .chat-header{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 2rem;
        border-bottom: 1px solid #0a66c2;
        .user-details{
            display: flex;
            align-items: center;
            gap: 1rem;
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
