import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
// import Logo from '../../assets/logo.svg'
import defaultAvatar from '../../assets/avatarDefault.png'
import { useNavigate } from 'react-router-dom'
import bgImage from '../../assets/clouds.svg'

const Contact = ({contacts, currentUser, changeChat}) => {
  const navigate = useNavigate()

  const [currentUserName, setCurrentUserName] = useState(undefined)
  const [currentUserImage, setCurrentUserImage] = useState(undefined)
  const [currentSelected, setCurrentSelected] = useState(undefined)
  useEffect(() => {
    if(currentUser){
      if(currentUser?.avatar){
        setCurrentUserImage(currentUser?.avatar)
      }
      else{
        setCurrentUserImage(defaultAvatar)
      }
      setCurrentUserName(currentUser?.firstName + " " + currentUser?.lastName)
    }
  }, [currentUser]);
  

  const changeCurrentChat = (index, contact) => { 
    setCurrentSelected(index)
    changeChat(contact)
  }
  return (
    <>
    {
      currentUserImage && currentUserName && (
        <Container>
          <div className="brand bg-[#0a66c2] rounded-tl-md" onClick={()=>navigate('/')}>
            <span className="text-gray-600 text-lg text-white font-bold">Recent&nbsp;Chat</span>
            {/* <span className="text-[#0a66c2] text-2xl italic font-bold">Provider</span> */}
          </div>

          <div className='contacts bg-white'>
            {
              contacts.map((contact, index) => {
                return (
                  <div className={`contact border-b-2 ${index === currentSelected ? "selected" : ""}`}
                    key={index}
                    onClick={()=>changeCurrentChat(index, contact)}
                  >
                    <div className='avatar rounded-lg border'>
                      <img src={contact.avatar || defaultAvatar} alt='avatar'/>
                    </div>
                    <div className='username'>
                      <h3 className='text-gray-600'>{`${contact.firstName} ${contact.lastName}`}</h3>
                    </div>
                  </div>
                )
              })
            }
          </div>

          <div className='current-user bg-white rounded-bl-md border-blue-500'>
            <div className='avatar'>
              <img src={currentUserImage} alt='avatar'/>
            </div>
            <div className='username'>
              <h2>{currentUserName}</h2>
            </div>
          </div>
        </Container>
      )
    }
    </>
  )
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  .brand{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
  }
  .contacts{
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar{
      width: 0.2rem;
      &-thumb{
        background-color: white;
        width: 0.1rem;
        border-radius: 1rem
      }
    }
    .contact{
      min-height: 5rem;
      width: 90%;
      cursor: pointer;
      border-radius: 0.2rem;
      padding: 0.4rem;
      gap: 1rem;
      display: flex;
      align-items: center;
      transition: 0.5s ease-in-out;
      .avatar{
        img{
          height: 3rem;
        }
      }
    }
    .selected{
      background-color: #9186f3;
    }
  }
  .current-user{
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    border-top: 3px solid blue;
    .avatar{
      img{
        height: 3rem;
        max-inline-size: 100%;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px){
      gap: 0.5rem;
      .username{
        h2{
          font-size: 1rem;
        }
      }
    }
  }
`

export default Contact