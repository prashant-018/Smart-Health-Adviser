import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatMessages({ messages, loading, isSpeaking, speakText }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  return (
    <div className="flex min-h-[min(420px,55vh)] max-h-[min(480px,50vh)] flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 ring-1 ring-slate-100 sm:min-h-[440px] sm:max-h-[520px]">
      {messages.length === 0 && !loading ? (
        <div className="m-auto max-w-sm px-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-800">Start a conversation</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Describe your symptoms below. Use the menu for lab reports, medicine photos, or nearby
            hospitals.
          </p>
        </div>
      ) : null}

      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          msg={msg}
          isSpeaking={isSpeaking}
          speakText={speakText}
        />
      ))}

      {loading ? (
        <div className="flex max-w-[85%] items-center gap-2 self-start rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
          </span>
          Thinking…
        </div>
      ) : null}

      <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
    </div>
  );
}
