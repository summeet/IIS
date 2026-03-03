import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      },
    ])
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="app-page chat-page bg-white py-10">
      <div className="chat-page-content !max-w-full">
        <header className="chat-page-header">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-sky-200 uppercase">
            Chat
          </p>
          <h2 className="mt-1.5 text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Message
          </h2>
          <p className="mt-1 text-sm text-slate-200/90 max-w-xl">
            Send a message. Connect a backend to enable replies.
          </p>
        </header>

        <div className="chat-panel">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-messages-empty">
                <p>No messages yet.</p>
                <p className="chat-messages-empty-hint">Type below and press Enter or Send.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message chat-message--${msg.role}`}
                >
                  <div className="chat-message-bubble">
                    <p className="chat-message-text">{msg.content}</p>
                    <span className="chat-message-time">
                      {msg.timestamp.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              aria-label="Message"
            />
            <button
              type="submit"
              className="primary-button chat-send-btn"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <Send size={20} strokeWidth={2} aria-hidden />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
