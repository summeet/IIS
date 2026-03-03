import { useState, useRef, useEffect, useMemo } from 'react'
import { Send } from 'lucide-react'
import apiClient from '../../../api/client'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_PROMPTS = [
  'How can I improve my boxing punch speed?',
  'What metrics should I track for wrestling performance?',
  'Explain the key techniques for judo throws.',
  'How do I analyse my swimming lap times?',
  'What are the best drills for track and field?',
  'How can I reduce injury risk in winter sports?',
  'Suggest a training plan for better endurance.',
  'What should I focus on in my next video analysis?',
  'How do I compare my performance over time?',
  'What does a good warm-up routine look like?',
]

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const sessionIdRef = useRef<string>(`session_${crypto.randomUUID()}`)

  const suggestedPrompts = useMemo(
    () => shuffle(SUGGESTED_PROMPTS).slice(0, 4),
    [],
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isSending])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isSending) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setError(null)
    setIsSending(true)

    try {
      const response = await apiClient.post<{
        message?: string
        reply?: string
        response?: string
        content?: string
      }>('/chatbot/chat', {
        message: text,
        model: 'llama-3.3-70b-versatile',
        api_key: import.meta.env.VITE_CHAT_API_KEY,
        google_api_key: import.meta.env.VITE_GOOGLE_API_KEY,
        session_id: sessionIdRef.current,
      })

      const data = response.data as {
        message?: string
        reply?: string
        response?: string
        content?: string
      }

      const replyText =
        data.reply ??
        data.response ??
        data.message ??
        data.content ??
        ''

      if (replyText) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: replyText,
            timestamp: new Date(),
          },
        ])
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Chat send failed', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
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
            Send a message to the assistant. Your session stays within this browser tab.
          </p>
        </header>

        {error && (
          <p className="chat-messages-empty-hint" role="alert">
            {error}
          </p>
        )}

        <div className="chat-panel">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-messages-empty chat-suggestions">
                <p className="chat-suggestions-title">What are you working on?</p>
                <div className="chat-suggestions-list">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="chat-suggestion-chip"
                      onClick={() => {
                        setInput(prompt)
                        inputRef.current?.focus()
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
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
                ))}
                {isSending && (
                  <div className="chat-message chat-message--assistant">
                    <div className="chat-message-bubble chat-thinking-bubble">
                      <span className="chat-typing-dots" aria-hidden>
                        <span className="chat-typing-dot" />
                        <span className="chat-typing-dot" />
                        <span className="chat-typing-dot" />
                      </span>
                    </div>
                  </div>
                )}
              </>
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
              disabled={!input.trim() || isSending}
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
