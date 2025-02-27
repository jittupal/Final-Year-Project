import { useEffect, useState } from "react";
import Avatar from "./Avatar.jsx";

export default function Contact({ id, username, onClick, selected, online, lastMessage, isTyping }) {
  const [bgColor, setBgColor] = useState(""); // State to track background color

  // Function to handle click event and change color based on online status
  const handleClick = () => {
    setBgColor(online ? "bg-green-200" : "bg-red-200");
    onClick(id); // Ensure original click functionality remains
  };

  return (
    <div
      key={id}
      onClick={handleClick}
      className={`border-b border-gray-300 flex items-center gap-3 cursor-pointer transition-all duration-300 rounded-lg overflow-hidden 
        ${selected ? "bg-purple-200 shadow-lg scale-105" : "hover:bg-gray-100"} ${bgColor}`}
    >
      {selected && <div className="w-1.5 bg-purple-500 h-12 rounded-r-full"></div>}
      <div className="flex gap-4 py-4 px-5 items-center w-full">
        <Avatar online={online} username={username} userId={id} />
        <div className="flex flex-col w-full">
          <span className="text-gray-900 font-semibold text-base tracking-wide">
            {username}
          </span>
          <span className={online ? "text-green-500 text-sm font-medium" : "text-gray-500 text-sm"}>
            {online ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
}
