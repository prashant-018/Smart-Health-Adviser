import React from "react";

export default function MessageBubble({ msg, isSpeaking, speakText }) {
  const isUser = msg.sender === "user";

  return (
    <div
      className={`flex max-w-[90%] flex-col gap-2 sm:max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}
    >
      <div
        className={
          isUser
            ? "rounded-2xl rounded-br-md bg-cyan-500 px-4 py-2.5 text-sm leading-relaxed text-white shadow-md shadow-cyan-500/20"
            : "rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm"
        }
      >
        {msg.text.split("\n").map((line, i) => {
          if (line.startsWith("MAP_LINK:")) {
            const link = line.replace("MAP_LINK:", "");
            return (
              <div key={i} className="mt-2">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-cyan-600 underline-offset-2 hover:text-cyan-700 hover:underline"
                >
                  Open in Maps
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            );
          }
          return (
            <div key={i} className={i > 0 ? "mt-1" : ""}>
              {line}
            </div>
          );
        })}
      </div>

      {!isUser ? (
        <button
          type="button"
          onClick={() => speakText(msg.text)}
          className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
            isSpeaking
              ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
              : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
          }`}
        >
          {isSpeaking ? "Stop" : "Read aloud"}
        </button>
      ) : null}
    </div>
  );
}
