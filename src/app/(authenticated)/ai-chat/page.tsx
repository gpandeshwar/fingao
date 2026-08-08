"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "How diversified is my portfolio?",
  "What's my biggest risk right now?",
  "Suggest income-generating alternatives",
  "How would a recession affect my holdings?",
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your portfolio AI assistant. I can help you analyze your holdings, suggest optimizations, and answer questions about your investments. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: Replace with actual Amplify AI Kit / Bedrock call
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getPlaceholderResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[var(--color-primary)]" />
              </div>
            )}
            <div
              className={`max-w-[80%] sm:max-w-[70%] rounded-xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 bg-[var(--color-bg-tertiary)] rounded-full flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-[var(--color-text-secondary)]" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions (only show if no user messages) */}
      {messages.length <= 1 && (
        <div className="pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-text-muted)]">
              Try asking
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                onClick={() => setInput(question)}
                className="text-sm px-3 py-1.5 border border-[var(--color-border)] rounded-full text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-3"
        >
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about your portfolio..."
              rows={1}
              className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// Placeholder responses until Bedrock is connected
function getPlaceholderResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("diversif")) {
    return `Based on your current portfolio analysis:

**Diversification Score: 72/100**

Your portfolio has 6 holdings across primarily the technology sector (55% allocation). Here are the key findings:

• **Sector concentration**: Technology dominates at 55% — ideally this should be under 35%
• **Geographic exposure**: 100% US — consider adding international (VXUS or EFA)
• **Market cap**: Heavily large-cap — consider small/mid-cap for growth
• **Correlation**: AAPL, MSFT, GOOGL are highly correlated (0.75+)

**Recommendations:**
1. Add 2-3 holdings in healthcare, consumer staples, or utilities
2. Consider international ETF for geographic diversification
3. Add a bond ETF (AGG or BND) for reduced volatility`;
  }

  if (q.includes("risk")) {
    return `Here's your portfolio risk assessment:

**Overall Risk Level: Moderate-High**

• **Portfolio Beta**: 1.24 (24% more volatile than S&P 500)
• **Max Historical Drawdown**: -32% (during 2022 tech correction)
• **Concentration Risk**: Top 3 holdings = 55% of portfolio
• **Sector Risk**: Technology overweight at 55%

**Key Risks:**
1. A tech sector downturn would significantly impact your portfolio
2. High correlation between top holdings reduces diversification benefit
3. No defensive positions for market downturns

**Mitigation suggestions:**
- Add low-beta positions (utilities, consumer staples)
- Consider a 10-15% bond allocation
- Set stop-loss alerts on concentrated positions`;
  }

  if (q.includes("income") || q.includes("dividend")) {
    return `Here's your income analysis and suggestions:

**Current Portfolio Yield: 0.8%**
**Projected Annual Income: $1,003**

Your portfolio is growth-oriented with low income generation. Here are income-focused alternatives:

| Current | Replace With | Yield Improvement |
|---------|-------------|-------------------|
| TSLA (0%) | JNJ (3.1%) | +$155/yr |
| Partial NVDA | SCHD (3.4%) | +$340/yr |
| New position | O (Realty, 5.2%) | +$520/yr |

**If you shift 30% to income:**
- New projected yield: 2.1%
- Annual income: ~$2,634
- You'd give up some growth potential but gain cash flow stability`;
  }

  return `That's a great question! Based on your portfolio of 6 holdings with a total value of ~$125,000:

I can see your portfolio is growth-oriented with heavy technology exposure. Here are a few quick observations:

1. **Strong performers**: NVDA (+118%) and MSFT (+46%) are your biggest winners
2. **Opportunity areas**: Limited diversification and no income-generating assets
3. **Risk factor**: 55% in one sector creates concentration risk

Would you like me to dive deeper into any specific aspect? I can analyze:
- Sector rebalancing options
- Risk reduction strategies
- Income generation alternatives
- Tax optimization opportunities`;
}
