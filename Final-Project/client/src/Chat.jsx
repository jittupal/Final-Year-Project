import {useContext, useEffect, useRef, useState} from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import {UserContext} from "./UserContext.jsx";
import {uniqBy} from "lodash";
import axios from "axios";
import Contact from "./Contact";
import { v4 as uuidv4 } from "uuid"; // Import UUID library

export default function Chat() {
  const [ws,setWs] = useState(null);
  const [onlinePeople,setOnlinePeople] = useState({});
  const [offlinePeople,setOfflinePeople] = useState({});
  const [selectedUserId,setSelectedUserId] = useState(null);
  const [typingStatus, setTypingStatus] = useState(null);
  const [newMessageText,setNewMessageText] = useState('');
  const [messages,setMessages] = useState([]);
  const {username,id,setId,setUsername} = useContext(UserContext);
  const divUnderMessages = useRef();
  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);
  function connectToWs() {
    const ws = new WebSocket('ws://localhost:4040');
    setWs(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => {
      setTimeout(() => {
        console.log('Disconnected. Trying to reconnect.');
        connectToWs();
      }, 1000);
    });
  }
  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({userId,username}) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }
  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    } else if ('text' in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessages(prev => ([...prev, { ...messageData }]));
      }
    } else if ('typing' in messageData) {
      if (messageData.sender === selectedUserId) {
        setTypingStatus(true);
        setTimeout(() => setTypingStatus(false), 2000);
      }
    } else if ('delete-message' in messageData) {
      // Ensure the deleted message is removed from the UI in real-time
      setMessages(prev => prev.filter(msg => msg._id !== messageData.messageId));
    }
  }
  

  function deleteMessage(messageId) {
    if (!messageId || typeof messageId !== "string") {
      console.error("Invalid messageId:", messageId);
      return;
    }
  
    axios.delete(`/messages/${messageId}`)
      .then(() => {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        ws.send(JSON.stringify({
          type: "delete-message",
          messageId,
        }));
      })
      .catch(error => console.error("Delete error:", error.response?.data || error));
  }
  
  

  function logout() {
    axios.post('/logout').then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }
  function sendMessage(ev, file = null) {
    if (ev) ev.preventDefault();
    ws.send(JSON.stringify({
      recipient: selectedUserId,
      text: newMessageText,
      file,
    }));
    if (file) {
      axios.get('/messages/'+selectedUserId).then(res => {
        setMessages(res.data);
      });
    } else {
      setNewMessageText('');
      setMessages(prev => ([...prev,{
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        _id: uuidv4(),  // ✅ Generates a temporary valid string ID
      }]));
    }
  }
  function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
  }

  function handleTyping() {
    ws.send(JSON.stringify({
      recipient: selectedUserId,
      typing: true,
    }));
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({behavior:'smooth', block:'end'});
    }
  }, [messages]);

  useEffect(() => {
    axios.get('/people').then(res => {
      const offlinePeopleArr = res.data
        .filter(p => p._id !== id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach(p => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get('/messages/'+selectedUserId).then(res => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = {...onlinePeople};
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, '_id');

  return (
    <div className="flex h-screen">
      <div className="bg-gradient-to-r from-blue-50 via-pink-50 to-purple-100 w-1/3 flex flex-col shadow-xl p-6 rounded-lg border border-gray-300">
        {/* Logo */}
        <Logo />

        {/* Contact List */}
        <div className="flex-grow space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent p-3">
        {Object.keys(onlinePeopleExclOurUser).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={userId === id ? `Me(${onlinePeopleExclOurUser[userId]})` : onlinePeopleExclOurUser[userId]} // Add "Me()"
              onClick={() => {setSelectedUserId(userId);console.log({userId})}}
              selected={userId === selectedUserId}
      className={`transition-all duration-300 ease-in-out rounded-lg p-4 text-gray-800 font-semibold shadow-md cursor-pointer 
        ${userId === selectedUserId ? "bg-purple-600 text-white" : "bg-purple-100 text-gray-700"} 
        hover:bg-purple-300 hover:scale-105`}
    />
  ))}
  {Object.keys(offlinePeople).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
      className={`transition-all duration-300 ease-in-out rounded-lg p-4 text-gray-500 font-medium shadow-md cursor-pointer 
        ${userId === selectedUserId ? "bg-gray-400 text-gray-900" : "bg-gray-100"} 
        hover:bg-gray-300 hover:scale-105`}
    />
  ))}
</div>


  {/* User Info & Logout Button */}
  <div className="p-4 text-center flex items-center justify-center bg-gradient-to-r from-red-300 via-pink-300 to-purple-400 rounded-lg shadow-lg border border-gray-400">
  <span className="mr-3 text-lg uppercase text-gray-800 flex items-center font-bold">
  {username}
</span>
    <button 
      onClick={logout} 
      className="text-lg bg-blue-600 text-white hover:bg-blue-700 py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 
      bg-opacity-90 backdrop-blur-md"
    >
      Logout
    </button>
  </div>
</div>




<div className="flex flex-col bg-gradient-to-r from-blue-100 via-pink-100 to-purple-100 w-2/3 p-4 rounded-lg shadow-lg border border-gray-300">
  <div className="flex-grow">
    {!selectedUserId && (
      <div className="flex h-full flex-grow items-center justify-center">
        <div className="text-gray-500">&larr; Select a person from the sidebar</div>
      </div>
    )}
    {!!selectedUserId && (
      <div className="relative h-full">
        <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2 p-4 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
          {messagesWithoutDupes.map(message => (
            <div key={message._id} className={(message.sender === id ? 'text-right' : 'text-left')}>
              <div className={"text-left inline-block p-3 my-2 rounded-lg text-sm shadow-md " +(message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-300')}>
                {message.text}
                 {/* Delete Button (Always Available) */}
                 <button
                  onClick={() => deleteMessage(message._id)}
                  className="ml-2 text-red-500 text-sm"
                >
                  Delete
                </button>
                {message.file && (
                  <div>
                    <a target="_blank" className="flex items-center gap-1 border-b text-black" href={axios.defaults.baseURL + '/uploads/' + message.file}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                      </svg>
                      {message.file}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
          {typingStatus && (
  <div className="flex items-center gap-2 text-lg font-semibold text-gray-600 mt-2">
    Typing
    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
    <span className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-200"></span>
    <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-400"></span>
  </div>
)}
          <div ref={divUnderMessages}></div>
        </div>
      </div>
    )}
  </div>
  {!!selectedUserId && (
   <form className="flex gap-2 p-4 bg-white rounded-lg shadow-md border border-gray-200" onSubmit={sendMessage}>
   <input type="text"
          value={newMessageText}
          onChange={ev => { setNewMessageText(ev.target.value); handleTyping(); }}
          placeholder="Type your message here"
          className="bg-gray-100 flex-grow border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-300"/>
   <label className="bg-blue-300 p-3 text-gray-700 cursor-pointer rounded-lg border border-blue-400 hover:bg-blue-400 transition-all">
     <input type="file" className="hidden" onChange={sendFile} />
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
       <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
     </svg>
   </label>
   <button type="submit" className="bg-blue-500 p-3 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
       <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
     </svg>
   </button>
 </form>
  )}
</div>



    </div>
  );
}