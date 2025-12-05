"use client";

import {
  useAIChat,
  useCareerStrategy,
  useResearchCompany,
} from "@/hooks/useTRPC";
import { cn } from "@/lib/utils";
import { ChatMessage, ResumeData } from "@/types";
import {
  BrainCircuit,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/Button";

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

  const chatMutation = useAIChat();
  const researchMutation = useResearchCompany();
  const strategyMutation = useCareerStrategy();

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

      if (mode === "search") {
        const result = await researchMutation.mutateAsync({
          companyName: userMsg.text,
          language: "en",
        });
        responseText = result.text;
        if (result.sources?.length > 0) {
          groundingData = { web: result.sources };
        }
      } else if (mode === "think") {
        const result = await strategyMutation.mutateAsync({
          query: userMsg.text,
          context: resumeContext?.summary || "",
          language: "en",
        });
        responseText = result || "";
      } else {
        // Streaming chat
        const tempId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          {
            id: tempId,
            role: "model",
            text: "",
            timestamp: Date.now(),
          },
        ]);

        const stream = await chatMutation.mutateAsync({
          history: messages.map((m) => ({
            role: m.role,
            parts: [{ text: m.text }],
          })),
          message: userMsg.text,
          language: "en",
        });

        if (!stream) {
          throw new Error("No response from chat");
        }

        let fullText = "";
        for await (const chunk of stream) {
          fullText += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? { ...msg, text: fullText } : msg
            )
          );
        }
        return; // Already handled
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
          className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-purple-600 text-white shadow-xl transition-all hover:scale-105 hover:shadow-purple-500/25"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed right-6 bottom-6 z-50 flex h-[600px] w-96 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                AI Assistant
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2 border-b border-slate-100 bg-white p-2 dark:border-slate-700 dark:bg-slate-800/50">
            <button
              onClick={() => setMode("chat")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                mode === "chat"
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                  : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
              )}
            >
              <MessageSquare className="h-3 w-3" /> Chat
            </button>
            <button
              onClick={() => setMode("search")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                mode === "search"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                  : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
              )}
            >
              <Search className="h-3 w-3" /> Research
            </button>
            <button
              onClick={() => setMode("think")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                mode === "think"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                  : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
              )}
            >
              <BrainCircuit className="h-3 w-3" /> Career Plan
            </button>
          </div>

          <div
            className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-800/50"
            ref={scrollRef}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "rounded-br-none bg-linear-to-br from-violet-500 to-purple-600 text-white"
                      : "rounded-bl-none border border-slate-100 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  )}
                >
                  {msg.isThinking && (
                    <div className="mb-1 flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                      <BrainCircuit className="h-3 w-3" /> Deep Thinking
                    </div>
                  )}
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                  {msg.groundingMetadata?.web && (
                    <div className="mt-3 border-t border-slate-100 pt-3 text-xs dark:border-slate-700">
                      <p className="mb-1 font-semibold text-slate-500 dark:text-slate-400">
                        Sources:
                      </p>
                      <ul className="space-y-1">
                        {msg.groundingMetadata.web.map((source, idx) => (
                          <li key={idx}>
                            <a
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate text-violet-500 hover:underline dark:text-violet-400"
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
                <div className="rounded-2xl rounded-bl-none border border-slate-100 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-300 dark:bg-slate-600"
                      style={{ animationDelay: "0.1s" }}
                    ></span>
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-300 dark:bg-slate-600"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
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
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <Button
              type="submit"
              size="sm"
              className="flex h-10 w-10 items-center justify-center rounded-xl p-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};
