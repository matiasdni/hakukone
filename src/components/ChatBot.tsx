"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Search,
  BrainCircuit,
} from "lucide-react";
import { Button } from "./ui/Button";
import { ChatMessage, ResumeData } from "@/types";
import ReactMarkdown from "react-markdown";
import { clsx } from "clsx";

interface ChatBotProps {
  resumeContext?: ResumeData;
}

export const ChatBot: React.FC<ChatBotProps> = ({ resumeContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "model",
      text: "Hi! I am your AI Career Assistant. How can I help you improve your resume today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"chat" | "search" | "think">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      let responseText = "";
      let groundingData = undefined;

      const endpoint =
        mode === "search"
          ? "/api/ai/research-company"
          : mode === "think"
            ? "/api/ai/career-strategy"
            : "/api/ai/chat";

      const body =
        mode === "search"
          ? { company: userMsg.text }
          : mode === "think"
            ? { question: userMsg.text, context: resumeContext?.summary || "" }
            : {
                history: messages.map((m) => ({
                  role: m.role,
                  parts: [{ text: m.text }],
                })),
                message: userMsg.text,
              };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (mode === "search") {
        responseText = data.text;
        if (data.sources?.length > 0) {
          groundingData = { web: data.sources };
        }
      } else if (mode === "think") {
        responseText = data.response;
      } else {
        responseText = data.response || "";
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: responseText || "I encountered an error.",
        timestamp: Date.now(),
        isThinking: mode === "think",
        groundingMetadata: groundingData,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: "Sorry, I had trouble connecting.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-all hover:scale-105 hover:bg-blue-700"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed right-6 bottom-6 z-50 flex h-[600px] w-96 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-slate-800">AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2 border-b border-slate-100 bg-white p-2">
            <button
              onClick={() => setMode("chat")}
              className={clsx(
                "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                mode === "chat"
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <MessageSquare className="h-3 w-3" /> Chat
            </button>
            <button
              onClick={() => setMode("search")}
              className={clsx(
                "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                mode === "search"
                  ? "bg-green-100 text-green-700"
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Search className="h-3 w-3" /> Research
            </button>
            <button
              onClick={() => setMode("think")}
              className={clsx(
                "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                mode === "think"
                  ? "bg-purple-100 text-purple-700"
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <BrainCircuit className="h-3 w-3" /> Career Plan
            </button>
          </div>

          <div
            className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4"
            ref={scrollRef}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={clsx(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "rounded-br-none bg-blue-600 text-white"
                      : "rounded-bl-none border border-slate-100 bg-white text-slate-800"
                  )}
                >
                  {msg.isThinking && (
                    <div className="mb-1 flex items-center gap-1 text-xs font-bold text-purple-600">
                      <BrainCircuit className="h-3 w-3" /> Deep Thinking
                    </div>
                  )}
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                  {msg.groundingMetadata?.web && (
                    <div className="mt-3 border-t border-slate-100 pt-3 text-xs">
                      <p className="mb-1 font-semibold text-slate-500">
                        Sources:
                      </p>
                      <ul className="space-y-1">
                        {msg.groundingMetadata.web.map((source, idx) => (
                          <li key={idx}>
                            <a
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate text-blue-500 hover:underline"
                            >
                              {source.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-none border border-slate-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300"></span>
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-300"
                      style={{ animationDelay: "0.1s" }}
                    ></span>
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-300"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-slate-200 bg-white p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "search"
                  ? "Research a company..."
                  : mode === "think"
                    ? "Ask a complex career question..."
                    : "Ask about your resume..."
              }
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Button
              type="submit"
              size="sm"
              className="flex h-10 w-10 items-center justify-center rounded-xl p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};
