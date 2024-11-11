import React, { useEffect } from 'react'
import bgImage from '../../assets/clouds.svg'
import { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaLinkedin, FaTwitter } from "react-icons/fa";
import { MdDragIndicator } from "react-icons/md";
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { apiGetProviderByAdmin, apiUpdateFooterSection } from 'apis';
import { FaX, FaXTwitter } from 'react-icons/fa6';
import { Button } from 'components';
import { IoSaveOutline } from 'react-icons/io5';

const ManageFooterSection = () => {
  const [logoSize, setLogoSize] = useState("small");
  const [slogan, setSlogan] = useState("Slogan");
  const [providerData, setProviderData] = useState([])
  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    twitter: "",
    tiktok: ""
  })

  useEffect(() => {
    const fetchProviderData = async () => {
      const response = await apiGetProviderByAdmin()
      setProviderData(response?.payload)
    }
    fetchProviderData()
  }, []);

  useEffect(() => {
    setSlogan(providerData?.slogan)
    setSocialMedia({
      facebook: providerData?.socialMedia?.facebook || "",
      instagram: providerData?.socialMedia?.instagram || "",
      linkedin: providerData?.socialMedia?.linkedin || "",
      youtube: providerData?.socialMedia?.youtube || "",
      twitter: providerData?.socialMedia?.twitter || "",
      tiktok: providerData?.socialMedia?.tiktok || ""
    });
    setLogoSize(providerData?.logoSize || "small");
  }, [providerData]);

  const [elements, setElements] = useState({
    left: [
      { id: "logo", content: "Logo" },
      { id: "slogan", content: "Slogan" }
    ],
    right: [
      { id: "address", content: "Address" },
      { id: "businessName", content: "Provider Name" },
      { id: "mobile", content: "Mobile Phone" },
      { id: "social", content: "Social Media" }
    ]
  });

  const [visibleElements, setVisibleElements] = useState({
    logo: true,
    slogan: true,
    address: true,
    businessName: true,
    mobile: true,
    social: true
  });

  useEffect(() => {
    if (providerData?.indexFooter) {
      // Tạo một bản sao của elements để tránh thay đổi trực tiếp state
      const updatedElements = { left: [...elements.left], right: [...elements.right] };
  
      // Duyệt qua từng đối tượng trong indexFooter và cập nhật lại vị trí
      providerData.indexFooter.forEach(item => {
        const { field, column, order, isVisible } = item;
  
        // Xoá phần tử khỏi cột cũ
        updatedElements.left = updatedElements.left.filter(el => el.id !== field);
        updatedElements.right = updatedElements.right.filter(el => el.id !== field);

        // Lấy phần tử từ elements ban đầu
        let element = elements.left.find(el => el.id === field) || elements.right.find(el => el.id === field);

        // Thêm phần tử vào cột mới
        if (element) {
          updatedElements[column].push(element);
        }
      });
  
      // Sắp xếp các phần tử trong từng cột theo order mà không cần thay đổi state elements
      updatedElements.left.sort((a, b) => {
        const aOrder = providerData.indexFooter.find(item => item.field === a.id)?.order || 0;
        const bOrder = providerData.indexFooter.find(item => item.field === b.id)?.order || 0;
        return aOrder - bOrder;
      });

      updatedElements.right.sort((a, b) => {
        const aOrder = providerData.indexFooter.find(item => item.field === a.id)?.order || 0;
        const bOrder = providerData.indexFooter.find(item => item.field === b.id)?.order || 0;
        return aOrder - bOrder;
      });

      // Cập nhật lại state elements mà không thay đổi cấu trúc order
      setElements(updatedElements);
    }
  }, [providerData]);

  useEffect(() => {
    if (providerData?.indexFooter) {
      const updatedVisibility = { ...visibleElements };
  
      // Duyệt qua từng phần tử trong indexFooter và cập nhật visibleElements
      providerData.indexFooter.forEach(item => {
        const { field, isVisible } = item;
  
        // Cập nhật trạng thái của phần tử tương ứng trong visibleElements
        if (updatedVisibility.hasOwnProperty(field)) {
          updatedVisibility[field] = isVisible;
        }
      });
  
      // Cập nhật lại state visibleElements
      setVisibleElements(updatedVisibility);
    }
  }, [providerData]);

  const [socialLinks, setSocialLinks] = useState([
    { platform: "facebook", url: "https://facebook.com", icon: FaFacebook },
    { platform: "instagram", url: "https://instagram.com", icon: FaInstagram },
    { platform: "youtube", url: "https://youtube.com", icon: FaYoutube },
    { platform: "tiktok", url: "https://tiktok.com", icon: FaTiktok },
    { platform: "linkedin", url: "https://linkedin.com", icon: FaLinkedin },
    { platform: "twitter", url: "https://twitter.com", icon: FaXTwitter }
  ]);

  useEffect(() => {
    if(socialMedia && typeof socialMedia === 'object' && Object.keys(socialMedia).length > 0){
      const updatedLinks = socialLinks.map((link) => ({
        ...link,
        url: socialMedia[link.platform] || "" // Sử dụng giá trị từ socialMedia nếu có, nếu không thì giữ nguyên
      }));
      setSocialLinks(updatedLinks);
    }
  }, [socialMedia]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceList = result.source.droppableId;
    const destinationList = result.destination.droppableId;

    const newElements = { ...elements };

    const [removed] = newElements[sourceList].splice(result.source.index, 1);
    newElements[destinationList].splice(result.destination.index, 0, removed);

    setElements(newElements);
  };

  const toggleElementVisibility = (elementId) => {
    setVisibleElements(prev => ({
      ...prev,
      [elementId]: !prev[elementId]
    }));
  };

  const handleSocialLinkChange = (platform, newUrl) => {
    setSocialLinks(prev => 
      prev.map(link => 
        link.platform === platform ? { ...link, url: newUrl } : link
      )
    );
  };

  const renderElement = (element, index, columnType) => {
    const displayIndex = columnType === "right" ? index + elements.left.length + 1 : index + 1;

    switch (element.id) {
      case "social":
        return (
          <div className="flex items-center w-full">
            <span className="text-gray-500 mr-2 font-semibold">{displayIndex}.</span>
            <div className="flex space-x-4 cursor-move">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-500 transition-colors duration-300"
                  aria-label={`Visit our ${link.platform} page`}
                >
                  <link.icon className="text-2xl" />
                </a>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center w-full">
            <span className="text-gray-500 mr-2 font-semibold">{displayIndex}.</span>
            <p className="text-gray-700 cursor-move">{element.content}</p>
          </div>
        );
    }
  };

  const renderDroppableColumn = (id, columnElements) => (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`space-y-4 rounded-lg ${snapshot.isDraggingOver ? "bg-gray-100" : ""} transition-colors duration-300`}
        >
          {columnElements.map((element, index) => (
            <Draggable key={element.id} draggableId={element.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`p-3 bg-white rounded-lg shadow-sm ${snapshot.isDragging ? "shadow-lg ring-2 ring-blue-400" : ""} 
                    transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className='flex items-center gap-2'>
                      <div className="text-gray-400">
                        <MdDragIndicator size={20} />
                      </div>
                      {renderElement(element, index, id)}
                    </div>
                    <button
                      onClick={() => toggleElementVisibility(element.id)}
                      className="text-2xl text-blue-500 hover:text-blue-600 transition-colors duration-300"
                    >
                      {visibleElements[element.id] ? <BsToggleOn /> : <BsToggleOff />}
                    </button>
                  </div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  const renderContentEditor = () => (
    <div className="mt-8 p-6 rounded-lg bg-[#f0f2f5] border border-[#d0d7de]">
      <h3 className="text-lg font-semibold mb-4 text-[#00143c]">Edit Content</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo Size</label>
          <select
            value={logoSize}
            onChange={(e) => setLogoSize(e.target.value)}
            className="w-full h-10 p-2 border text-[#00143c] outline-none"
          >
            <option value="small">Small</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
          <input
            type="text"
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            className="w-full h-10 p-2 border rounded text-[#00143c]"
          />
        </div>
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">Social Media Links</h4>
          {socialLinks.map((link) => (
            <div key={link.platform} className="flex items-center space-x-2">
              <link.icon className="text-xl text-gray-600" />
              <label className="capitalize text-sm font-medium text-gray-700 w-24">{link.platform}</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => handleSocialLinkChange(link.platform, e.target.value)}
                className="flex-1 h-10 p-2 border rounded outline-none text-[#00143c]"
                placeholder={`Enter ${link.platform} URL`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  const PreviewFooter = () => (
    <div className="mt-8 p-6 bg-gray-800 text-white rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Footer Preview</h3>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {elements.left.map((element) => (
            visibleElements[element.id] && (
              <div key={element.id} className="text-gray-300">
                {element.content}
              </div>
            )
          ))}
        </div>
        <div className="space-y-4">
          {elements.right.map((element) => (
            visibleElements[element.id] && (
              <div key={element.id} className="text-gray-300">
                {element.id === "social" ? (
                  <div className="flex space-x-4">
                    {socialLinks.map((link) => (
                      <link.icon key={link.platform} className="text-2xl hover:text-blue-400 cursor-pointer" />
                    ))}
                  </div>
                ) : (
                  element.content
                )}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );

  const formatDataForAPI = (elements, visibleElements) => {
    const result = [];
  
    // Xử lý cột bên trái
    elements.left.forEach((element, index) => {
      result.push({
        field: element.id,
        order: index + 1,
        column: "left",
        isVisible: visibleElements[element.id] || false,
      });
    });
  
    // Xử lý cột bên phải, bắt đầu order từ chiều dài của cột bên trái + 1
    const leftLength = elements.left.length;
    elements.right.forEach((element, index) => {
      result.push({
        field: element.id,
        order: leftLength + index + 1,
        column: "right",
        isVisible: visibleElements[element.id] || false,
      });
    });
  
    return result;
  };
  const handleSaveFooter = async() => {
    const formattedData = formatDataForAPI(elements, visibleElements);
    const socialLinksWithoutIcons = socialLinks?.map(({ icon, ...rest }) => rest);

    console.log(formattedData);
    console.log(socialLinksWithoutIcons);
    console.log(logoSize)
    console.log(slogan)

    const response = await apiUpdateFooterSection({
      formattedData,
      socialLinks: socialLinksWithoutIcons,
      logoSize,
      slogan
    })
    
  }
  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-24 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Manage Footer Section</span>
        </div>
        <div className='w-[95%] h-fit shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-6 py-4 flex flex-col gap-4'>
          <div className='w-full h-fit flex items-center'>
            <h1 className='font-medium text-[16px]' style={{color: 'rgba(128,138,158,1)'}}>Footer Section</h1>
          </div>
          <footer className="bg-white border-t">
            <div className="container mx-auto py-8">
              <div className="space-y-8">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="grid md:grid-cols-2 gap-8 rounded-md bg-[#f0f2f5] border border-[#d0d7de] p-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#00143c]">Left Column</h3>
                      {renderDroppableColumn("left", elements.left)}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#00143c]">Right Column</h3>
                      {renderDroppableColumn("right", elements.right)}
                    </div>
                  </div>
                </DragDropContext>
                {renderContentEditor()}
                <PreviewFooter />
              </div>
            </div>
          </footer>
          <div className='w-full h-[60px] flex items-center justify-center'>
            <Button handleOnclick={handleSaveFooter} style={'px-4 py-2 rounded-md text-white bg-[#005aee] font-semibold w-fit h-fit flex gap-1 items-center'}><IoSaveOutline size={20}/> Save Changes</Button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default ManageFooterSection