import { useState, useRef, useEffect } from "react";
import { X, Send, ChevronDown } from "lucide-react";
import portrait from "@/assets/portrait.jpg";
import { RobotHead } from "./robot-heads/RobotHead";

interface Message {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hey, I am Aman Alria's AI assistant. Ask me anything about my web and app builds, 3D work, skills, or how we can collaborate.",
};

const SUGGESTIONS = [
  "What is your core tech stack?",
  "Tell me about your projects",
  "How can I hire you for a project?",
  "Do you build 3D and animated websites?",
];

export default function AmanChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Prevent background page from scrolling when touching or scrolling inside chatbox
  useEffect(() => {
    if (!isOpen) return;

    const modalEl = modalRef.current;
    const messagesEl = messagesContainerRef.current;
    if (!modalEl || !messagesEl) return;

    const handleWheel = (e: WheelEvent) => {
      const isAtTop = messagesEl.scrollTop <= 0;
      const isAtBottom =
        messagesEl.scrollHeight - messagesEl.scrollTop <= messagesEl.clientHeight + 1;

      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault();
      }
      e.stopPropagation();
    };

    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const isScrollingUp = currentY > startY;
      const isScrollingDown = currentY < startY;

      const isAtTop = messagesEl.scrollTop <= 0;
      const isAtBottom =
        messagesEl.scrollHeight - messagesEl.scrollTop <= messagesEl.clientHeight + 1;

      // Check if touch target is inside input or non-scrollable area
      const isScrollArea = messagesEl.contains(e.target as Node);

      if (!isScrollArea) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        return;
      }

      if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
        if (e.cancelable) e.preventDefault();
      }
      e.stopPropagation();
    };

    modalEl.addEventListener("wheel", handleWheel, { passive: false });
    modalEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    modalEl.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      modalEl.removeEventListener("wheel", handleWheel);
      modalEl.removeEventListener("touchstart", handleTouchStart);
      modalEl.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Try local serverless API route first (/api/chat)
      let replyText = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as { reply?: string };
          if (data?.reply) {
            replyText = data.reply;
          }
        }
      } catch (e) {
        console.warn("Direct /api/chat error, trying HiveCloud fallback", e);
      }

      // 2. Fallback to HiveCloud AWS proxy directly if /api/chat didn't respond
      if (!replyText) {
        const directRes = await fetch("https://hivecloud.in/api/chat.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Portfolio-Key": "aman-sec-pt-8e4b2d19f3a67c5e",
            Origin: window.location.origin,
          },
          body: JSON.stringify({
            model: "gemini-3.1-pro",
            stream: false,
            messages: [
              {
                role: "system",
                content:
                  "You are Aman Alria — developer, frontend engineer, and UI/UX designer on your portfolio site (amanalria.in). Talk in first-person as Aman Alria. Contact: amanalria9@gmail.com / +91 70733 61989. NEVER use any emojis or emoji icons under any circumstances. Keep responses completely clean, professional, and composed of pure text.",
              },
              ...newMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
            ],
          }),
        });

        if (directRes.ok) {
          const directData = (await directRes.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          replyText =
            directData?.choices?.[0]?.message?.content ??
            "Thanks for reaching out. Feel free to contact me directly at amanalria9@gmail.com or call +91 70733 61989.";
        }
      }

      if (!replyText) {
        replyText =
          "Thanks for visiting. I would love to discuss your project. Please email me directly at amanalria9@gmail.com or call +91 70733 61989.";
      }

      // Ensure no emojis in response text
      const cleanReply = replyText.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "");

      const assistantMsg: Message = {
        role: "assistant",
        content: cleanReply.trim() || replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (!isOpen) setHasUnread(true);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I am having a connection delay with the AI server. You can reach me directly at amanalria9@gmail.com or call +91 70733 61989.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end">
        {!isOpen && (
          <div className="mb-2 hidden sm:flex items-center gap-2 rounded-full border border-border/80 bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-xs font-medium text-foreground/80">Chat with Aman</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close chat" : "Open chat with Aman"}
          className="group relative flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
        >
          {isOpen ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card/90 border border-border/80 shadow-2xl backdrop-blur-md text-foreground hover:bg-muted transition-all">
              <X className="h-6 w-6 transition-transform duration-200 group-hover:rotate-90" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center filter drop-shadow-[0_8px_20px_rgba(200,55,45,0.4)]">
              <RobotHead
                shape="rectangle"
                state={isLoading ? "thinking" : "happy"}
                size={70}
                color="#c8372d"
                trimColor="#2a2c31"
                screenColor="#e8f2ff"
                interactive
                antenna
                floorShadow={false}
              />
              {hasUnread && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
                </span>
              )}
            </div>
          )}
        </button>
      </div>

      {/* Floating Chat Modal (Non-Fullscreen, Sleek Box) */}
      {isOpen && (
        <div
          ref={modalRef}
          role="dialog"
          aria-label="Aman Alria AI Chat"
          className="fixed bottom-24 right-4 sm:right-6 z-[100] flex w-[calc(100vw-2rem)] max-w-[380px] h-[520px] max-h-[82vh] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-card-foreground shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-250 overscroll-contain"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3.5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border/80 shadow-sm">
                <img
                  src={portrait}
                  alt="Aman Alria"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Aman Alria</h3>
              </div>
            </div>

            <div className="flex items-center text-muted-foreground">
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="rounded-lg p-1.5 hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area with overscroll containment */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm overscroll-contain touch-pan-y"
          >
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-xs shadow-sm font-normal"
                        : "bg-muted/70 text-foreground border border-border/50 rounded-bl-xs shadow-xs font-normal"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.time && (
                    <span className="mt-1 px-1 text-[10px] text-muted-foreground/70">
                      {msg.time}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Collapsible Suggestions Dropdown */}
            {messages.length === 1 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSuggestionsOpen((prev) => !prev)}
                  className="flex items-center justify-between w-full rounded-xl border border-border/80 bg-background/70 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all text-left"
                >
                  <span>Suggested questions</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      isSuggestionsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isSuggestionsOpen && (
                  <div className="flex flex-col gap-1.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          handleSend(s);
                          setIsSuggestionsOpen(false);
                        }}
                        className="rounded-lg border border-border/70 bg-background/90 px-3 py-2 text-xs text-foreground/90 hover:bg-muted hover:border-primary/50 transition-all text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Loading Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs border border-border/50 bg-muted/70 px-4 py-3 text-muted-foreground w-fit animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></span>
                <span
                  className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
                <span className="ml-1 text-xs font-medium text-muted-foreground">
                  Aman is typing...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="border-t border-border/60 bg-background/80 p-3 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Aman anything..."
                disabled={isLoading}
                className="flex-1 rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-2 text-center">
              <span className="text-[10px] text-muted-foreground/80 font-medium tracking-wide">
                amanalria.in
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
