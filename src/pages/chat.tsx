import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, MessageCircle, Loader2, RefreshCw, Plus } from 'lucide-react';
import { ThoughtChain } from '@/components/ThoughtChain';
import { Sidebar } from '@/components/Sidebar';
import { Message, TaskStatus, ReActStep } from '@/types';
import { chat, getTaskStatus, confirmAction, getAgentConfig } from '@/services/mockApi';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState('新对话');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      const firstUserMsg = messages.find(m => m.role === 'user');
      if (firstUserMsg) {
        const title = firstUserMsg.content.substring(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '');
        setSessionTitle(title);
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await chat({
        agentId: 'agent-001',
        message: inputValue.trim(),
      });

      if (response.mode === 'react' && response.taskId) {
        setActiveTaskId(response.taskId);
        
        const assistantMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: '',
          taskId: response.taskId,
          mode: 'react',
          steps: [],
          status: 'PENDING',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        pollTaskStatus(response.taskId);
      } else if (response.mode === 'workflow' && response.answer) {
        const assistantMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          mode: 'workflow',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const pollTaskStatus = useCallback(async (taskId: string) => {
    let pollInterval: ReturnType<typeof setInterval>;

    const poll = async () => {
      try {
        const status = await getTaskStatus(taskId);
        
        setMessages(prev => prev.map(msg => {
          if (msg.taskId === taskId) {
            return {
              ...msg,
              status: status.status,
              steps: status.steps,
              finalAnswer: status.finalAnswer,
              requiresAction: status.requiresAction,
            };
          }
          return msg;
        }));

        if (status.status === 'COMPLETED' || status.status === 'FAILED') {
          clearInterval(pollInterval);
          setActiveTaskId(null);
          setIsTyping(false);
        } else if (status.status === 'WAITING_USER') {
          clearInterval(pollInterval);
          setIsTyping(false);
        }
      } catch (error) {
        console.error('Error polling task status:', error);
        clearInterval(pollInterval);
        setIsTyping(false);
      }
    };

    await poll();
    
    pollInterval = setInterval(poll, 1500);
    
    return () => clearInterval(pollInterval);
  }, []);

  const handleConfirmAction = async (taskId: string, confirmed: boolean) => {
    setIsTyping(true);
    
    try {
      const response = await confirmAction(taskId, confirmed);
      
      setMessages(prev => prev.map(msg => {
        if (msg.taskId === taskId) {
          return {
            ...msg,
            status: response.status,
            steps: response.steps,
            requiresAction: undefined,
          };
        }
        return msg;
      }));

      if (response.status === 'RUNNING') {
        pollTaskStatus(taskId);
      } else {
        setActiveTaskId(null);
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error confirming action:', error);
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionTitle('新对话');
    setInputValue('');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar activeView="chat" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              新对话
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <h1 className="font-semibold text-gray-800">{sessionTitle}</h1>
              <p className="text-xs text-gray-500">智能体助手</p>
            </div>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6">
              <Bot className="w-20 h-20 text-blue-600 mb-6" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">欢迎使用智能体</h2>
              <p className="text-gray-500 mb-6 text-center">请输入您的问题，智能体将为您解答</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['天气', '用户信息', '计算', '设备日志'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setInputValue(tag === '设备日志' ? '查看设备日志' : `查询${tag}`)}
                    className="px-4 py-2 text-sm bg-white text-gray-600 rounded-full hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                    }`}
                  >
                    {message.role === 'assistant' && message.mode === 'react' ? (
                      <ThoughtChain
                        steps={message.steps || []}
                        status={message.status || 'PENDING'}
                        finalAnswer={message.finalAnswer}
                        requiresAction={message.requiresAction}
                        onConfirm={message.requiresAction && message.taskId ? (confirmed) => handleConfirmAction(message.taskId!, confirmed) : undefined}
                        onRetry={() => {
                          const lastUserMsg = messages.filter(m => m.role === 'user').pop();
                          if (lastUserMsg) {
                            setInputValue(lastUserMsg.content);
                            handleSend();
                          }
                        }}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="text-sm text-gray-500">
                        {activeTaskId ? '思考中...' : '处理中...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="bg-white border-t border-gray-200 p-4 shrink-0">
          <div className="max-w-4xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="请输入您的问题或需求..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              <span>发送</span>
            </button>
          </div>
          <div className="max-w-4xl mx-auto mt-3">
            <div className="flex flex-wrap gap-2">
              {['天气', '用户信息', '计算', '设备日志'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setInputValue(tag === '设备日志' ? '查看设备日志' : `查询${tag}`)}
                  className="px-4 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors border border-gray-200"
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              按 Enter 发送，Shift + Enter 换行
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}