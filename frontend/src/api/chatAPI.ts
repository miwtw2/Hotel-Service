// src/api/chatApi.ts
export const sendMessage = async (text: string, roomNumber: string) => {
  const res = await fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, room_number: roomNumber }),
  });
  const data = await res.json();
  return data.reply;
};

export const sendRequest = async (request: string, roomNumber: string) => {
  const res = await fetch("http://127.0.0.1:8000/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request, room: roomNumber }),
  });
  const data = await res.json();
  return data.status;
};

// Fetch chat history
export const getChatHistory = async (roomNumber: string) => {
  const res = await fetch(`http://127.0.0.1:8000/history?room_number=${roomNumber}`);
  const data = await res.json();
  return data.messages; // expected: [{text: string, sender: "guest"|"ai"}]
};
