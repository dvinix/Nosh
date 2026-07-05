'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return
    
    const userMsg: Message = { role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: err.message || 'Assistant is busy, try again in a moment' }])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedPrompts = [
    "What's healthy near me?",
    "Recommend something for dinner",
    "What did I order last week?"
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-card border border-border shadow-2xl rounded-2xl w-80 sm:w-96 mb-4 flex flex-col overflow-hidden h-[500px] max-h-[80vh]">
          {/* Header */}
          <div className="bg-[#FF4500] text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <MessageCircle size={20} />
              Nosh Assistant
            </h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-4 space-y-4">
                <p className="text-sm">Hi! I'm your Nosh AI assistant. How can I help you today?</p>
                <div className="flex flex-col gap-2">
                  {suggestedPrompts.map((prompt, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(prompt)}
                      className="text-xs bg-secondary hover:bg-border text-secondary-foreground py-2 px-3 rounded-full transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#FF4500] text-white rounded-br-sm' 
                      : 'bg-card border border-border text-card-foreground shadow-sm rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border text-card-foreground shadow-sm rounded-2xl rounded-bl-sm px-4 py-2 text-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[#FF4500]" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-3 bg-card border-t border-border">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="flex items-center gap-2"
            >
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Nosh..." 
                className="flex-1 bg-input text-foreground text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-[#FF4500] hover:bg-[#FF4500]/90 disabled:opacity-50 text-white p-2 rounded-full transition-colors flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
      
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  )
}
