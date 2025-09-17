// src/App.tsx
import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";

const App: React.FC = () => {
  const [roomNumber, setRoomNumber] = useState<string>("101"); // default room

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Hotel Chatbot Concierge</h1>
      
      {/* Optional: Room number selection */}
      <div className="mb-4">
        <label className="mr-2 font-semibold text-gray-700">Room Number:</label>
        <input
          type="text"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* Chat window */}
      <div className="w-full max-w-md h-[600px]">
        <ChatWindow roomNumber={roomNumber} />
      </div>
    </div>
  );
};

export default App;
