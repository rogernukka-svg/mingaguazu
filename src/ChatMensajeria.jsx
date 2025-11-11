import React, { useEffect, useState, useRef } from "react";
import { getSupabase } from "../supabaseClient";
const supabase = getSupabase();

export default function ChatMensajeria({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function loadMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error) setMessages(data);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await supabase.from("messages").insert({
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      content: text.trim(),
    });
    setText("");
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-neutral-900/80 border border-red-700/40 rounded-2xl p-4 flex flex-col h-[400px] shadow-lg">
      <h3 className="text-red-400 font-semibold mb-2">💬 Chat de Coordinación</h3>

      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded-lg text-sm w-fit max-w-[80%] ${
              m.sender_role === "general"
                ? "bg-red-700/40 text-white self-end ml-auto"
                : "bg-gray-800 text-gray-200"
            }`}
          >
            <p className="font-semibold text-xs text-gray-300 mb-1">
              {m.sender_name}
            </p>
            <p>{m.content}</p>
            <p className="text-[10px] text-gray-500 mt-1">
              {new Date(m.created_at).toLocaleTimeString("es-PY", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-500 text-black px-4 rounded-lg text-sm font-semibold"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
