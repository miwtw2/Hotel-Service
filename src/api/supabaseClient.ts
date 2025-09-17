// src/api/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fetch all messages for a room
export const getChatHistory = async (roomNumber: string) => {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("room_number", roomNumber)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }

  // Map data to expected frontend format
  return data.map((msg) => ({
    text: msg.message,
    sender: msg.sender as "guest" | "ai",
  }));
};

// Send guest message
export const sendMessage = async (text: string, roomNumber: string) => {
  const { error } = await supabase
    .from("chat_messages")
    .insert([{ room_number: roomNumber, message: text, sender: "guest" }])
    .select();

  if (error) {
    console.error("Error sending message:", error);
    return "Sorry, something went wrong.";
  }

  // Optionally call your backend API to get AI reply
  const response = await fetch(`${process.env.REACT_APP_API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, room_number: roomNumber }),
  });

  const result = await response.json();
  return result.reply || "Sorry, no reply from AI.";
};

// Send quick request
export const sendRequest = async (request: string, roomNumber: string) => {
  const { error } = await supabase
    .from("chat_messages")
    .insert([{ room_number: roomNumber, message: request, sender: "guest" }])
    .select();

  if (error) {
    console.error("Error sending request:", error);
    return "Sorry, something went wrong.";
  }

  // Call backend /request endpoint for AI confirmation
  const response = await fetch(`${process.env.REACT_APP_API_URL}/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request, room: roomNumber }),
  });

  const result = await response.json();
  return result.status || "Your request has been sent to staff.";
};
