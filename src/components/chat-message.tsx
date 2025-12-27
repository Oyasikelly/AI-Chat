import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus.js'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  thinking?: string
}

export function ChatMessage({ role, content, thinking }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div
      className={cn(
        'flex w-full items-start gap-4 p-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar className={cn("h-8 w-8", isUser ? "bg-primary" : "bg-muted")}>
        <AvatarFallback>{isUser ? 'U' : 'AI'}</AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col gap-2 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        {/* Thinking Block */}
        {thinking && (
          <ThinkingBlock content={thinking} />
        )}

        {/* Message Content */}
        <div
          className={cn(
            'rounded-lg px-4 py-3 text-sm shadow-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border text-card-foreground'
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <div className="relative rounded-md overflow-hidden my-2">
                    <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-b border-zinc-800">
                         <span className="text-xs text-zinc-400">{match[1]}</span>
                         {/* Copy button could go here */}
                    </div>
                    <SyntaxHighlighter
                      {...props}
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, borderRadius: 0 }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code {...props} className={cn("bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono", className)}>
                    {children}
                  </code>
                )
              },
              // Style other markdown elements
              p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({children}) => <ul className="list-disc pl-4 mb-2 warning:marker:text-foreground/50">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{children}</a>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

function ThinkingBlock({ content }: { content: string }) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full max-w-lg mb-2">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 gap-2 text-muted-foreground w-fit px-2 font-normal hover:bg-muted/50">
                    <Calculator className="h-3.5 w-3.5" />
                    <span className="text-xs">Reasoning Process</span>
                    {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="mt-2 text-xs text-muted-foreground border-l-2 pl-4 italic">
                    {content}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
