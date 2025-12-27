import { v4 as uuidv4 } from 'uuid'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  parts?: any[]
  createdAt: string
}

export interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

export interface ConversationStore {
  conversations: Conversation[]
  activeConversationId: string | null
}

const STORAGE_KEY = 'chat_conversations'

// Get all conversations from localStorage
export function getConversations(): ConversationStore {
  if (typeof window === 'undefined') {
    return { conversations: [], activeConversationId: null }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { conversations: [], activeConversationId: null }
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error loading conversations:', error)
    return { conversations: [], activeConversationId: null }
  }
}

// Save conversations to localStorage
function saveToStorage(store: ConversationStore): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch (error) {
    console.error('Error saving conversations:', error)
  }
}

// Create a new conversation
export function createConversation(title?: string): Conversation {
  const store = getConversations()
  
  const newConversation: Conversation = {
    id: uuidv4(),
    title: title || 'New Chat',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  }
  
  store.conversations.unshift(newConversation)
  store.activeConversationId = newConversation.id
  saveToStorage(store)
  
  return newConversation
}

// Get a specific conversation
export function getConversation(id: string): Conversation | null {
  const store = getConversations()
  return store.conversations.find(c => c.id === id) || null
}

// Get active conversation
export function getActiveConversation(): Conversation | null {
  const store = getConversations()
  if (!store.activeConversationId) return null
  return getConversation(store.activeConversationId)
}

// Set active conversation
export function setActiveConversation(id: string): void {
  const store = getConversations()
  store.activeConversationId = id
  saveToStorage(store)
}

// Add message to conversation
export function addMessage(conversationId: string, message: Omit<Message, 'id' | 'createdAt'>): void {
  const store = getConversations()
  const conversation = store.conversations.find(c => c.id === conversationId)
  
  if (!conversation) return
  
  const newMessage: Message = {
    ...message,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
  
  conversation.messages.push(newMessage)
  conversation.updatedAt = new Date().toISOString()
  
  // Auto-generate title from first user message if still "New Chat"
  if (conversation.title === 'New Chat' && message.role === 'user' && conversation.messages.length === 1) {
    conversation.title = generateTitle(message.content)
  }
  
  saveToStorage(store)
}

// Update conversation title
export function updateConversationTitle(id: string, title: string): void {
  const store = getConversations()
  const conversation = store.conversations.find(c => c.id === id)
  
  if (!conversation) return
  
  conversation.title = title
  conversation.updatedAt = new Date().toISOString()
  saveToStorage(store)
}

// Delete conversation
export function deleteConversation(id: string): void {
  const store = getConversations()
  store.conversations = store.conversations.filter(c => c.id !== id)
  
  // If deleted conversation was active, set to null
  if (store.activeConversationId === id) {
    store.activeConversationId = store.conversations[0]?.id || null
  }
  
  saveToStorage(store)
}

// Clean up empty messages (messages with no content)
export function cleanupEmptyMessages(): void {
  const store = getConversations()
  
  store.conversations.forEach(conversation => {
    conversation.messages = conversation.messages.filter(msg => {
      // Keep messages that have content
      return msg.content && msg.content.trim().length > 0
    })
  })
  
  saveToStorage(store)
}

// Generate title from message content
function generateTitle(content: string): string {
  // Take first 50 characters and add ellipsis if longer
  const maxLength = 50
  const cleaned = content.trim().replace(/\n/g, ' ')
  
  if (cleaned.length <= maxLength) {
    return cleaned
  }
  
  return cleaned.substring(0, maxLength).trim() + '...'
}

// Clear all conversations (for testing)
export function clearAllConversations(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
