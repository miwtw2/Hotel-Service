// src/components/ChatWindow.tsx
import React, { useState, useEffect, useRef } from "react";
import Message from "./Message";
import { sendMessage, sendRequest, getChatHistory } from "../api/chatApi";

interface ChatWindowProps {
  roomNumber: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ roomNumber }) => {
  const [messages, setMessages] = useState<{ text: string; sender: "guest" | "ai" }[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getChatHistory(roomNumber);
      setMessages(history);
    };
    fetchHistory();
  }, [roomNumber]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add guest message locally
    setMessages((prev) => [...prev, { text: input, sender: "guest" }]);

    // Send to backend
    const reply = await sendMessage(input, roomNumber);

    // Add AI reply locally
    setMessages((prev) => [...prev, { text: reply, sender: "ai" }]);

    setInput("");
  };

  const handleQuickRequest = async (request: string) => {
    setMessages((prev) => [...prev, { text: request, sender: "guest" }]);

    const reply = await sendRequest(request, roomNumber);

    setMessages((prev) => [...prev, { text: reply, sender: "ai" }]);
  };

  const quickRequests = [
    "🛏️ Request Housekeeping",
    "🧴 Extra Towels",
    "🍽️ Room Service Menu",
    "⏰ Check-Out Time",
    "📶 Wi-Fi Info"
  ];

  return (
    <div className="flex flex-col h-full p-4 border rounded-lg bg-white max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((msg, idx) => (
          <Message key={idx} text={msg.text} sender={msg.sender} />
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Quick Request Buttons */}
      <div className="flex flex-wrap gap-2 mb-2">
        {quickRequests.map((req) => (
          <button
            key={req}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            onClick={() => handleQuickRequest(req)}
          >
            {req}
          </button>
        ))}
      </div>

      {/* Text Input */}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
