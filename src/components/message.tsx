// src/components/Message.tsx
import React from "react";

interface MessageProps {
  text: string;
  sender: "guest" | "ai";
}

const Message: React.FC<MessageProps> = ({ text, sender }) => {
  const isGuest = sender === "guest";

  return (
    <div className={`flex ${isGuest ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg break-words
          ${isGuest ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
      >
        {text}
      </div>
    </div>
  );
};

export default Message;
