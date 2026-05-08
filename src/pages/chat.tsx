import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, Plus, RefreshCw, Wrench } from 'lucide-react';
import { ThoughtChain } from '@/components/ThoughtChain';
import { Sidebar } from '@/components/Sidebar';
import ExecutablePlanBoard, { ExecutionPhase } from '@/components/ExecutablePlanBoard';
import { Step } from '@/components/StepCard';
import ExecutionTrace from '@/components/ExecutionTrace';
import ExpertGuidanceCard from '@/components/ExpertGuidanceCard';
import { SolutionReportCard } from '@/components/SolutionReportCard';
import { Message, TaskStatus, ReActStep } from '@/types';

const longDeviceLog = `[2024-01-15 08:30:00] INFO: 设备启动中...
[2024-01-15 08:30:01] INFO: 加载配置文件 /etc/device/config.ini
[2024-01-15 08:30:02] INFO: 初始化传感器模块
[2024-01-15 08:30:03] INFO: 传感器模块初始化完成
[2024-01-15 08:30:04] WARN: 检测到温度传感器异常 - 当前值: -100°C
[2024-01-15 08:30:05] ERROR: 温度传感器读取失败，错误码: EIO-001
[2024-01-15 08:30:06] INFO: 尝试重新连接传感器...
[2024-01-15 08:30:07] INFO: 重新连接成功，传感器恢复正常
[2024-01-15 08:30:08] INFO: 当前温度: 25.3°C, 湿度: 62%, 气压: 1013 hPa
[2024-01-15 08:30:09] INFO: 启动数据采集线程
[2024-01-15 08:30:10] INFO: 数据采集周期: 100ms
[2024-01-15 08:30:11] INFO: 连接云端服务器...
[2024-01-15 08:30:12] INFO: 云端连接成功，服务器地址: api.example.com
[2024-01-15 08:30:13] INFO: 开始同步历史数据...
[2024-01-15 08:30:14] INFO: 已同步记录数: 1500
[2024-01-15 08:30:15] WARN: 网络延迟增加，当前延迟: 250ms
[2024-01-15 08:30:16] INFO: 数据同步完成
[2024-01-15 08:30:17] INFO: 设备状态: 正常运行中
[2024-01-15 08:30:18] INFO: CPU使用率: 23%, 内存使用率: 45%
[2024-01-15 08:30:19] INFO: 磁盘空间: 可用 2.3GB / 总计 8GB
[2024-01-15 08:30:20] INFO: 设备健康检查完成`;

const mockStepObservations: Record<string, string> = {
  'log-query': longDeviceLog,
  'cpu-monitor': '[CPU监控结果]\nCPU核心数: 4\n当前使用率: 23%\n最高使用率: 45%\n进程数: 156\n内存使用: 45% / 8GB',
  'port-scan': '[端口扫描结果]\n端口 80: 开放 (HTTP)\n端口 443: 开放 (HTTPS)\n端口 22: 开放 (SSH)\n端口 3306: 关闭\n端口 8080: 开放 (应用服务)',
  'protocol-analyze': '[协议分析结果]\nTCP连接数: 128\nUDP数据包: 45/秒\n异常流量: 未检测到\n延迟: 25ms',
  'security-check': '[安全检测结果]\n防火墙状态: 开启\n入侵检测: 无异常\n病毒扫描: 未发现威胁\n系统更新: 最新',
  'command-exec': '[命令执行结果]\n执行命令: ls -la\n输出行数: 42\n执行时间: 0.12s\n退出码: 0',
};

function generateReActStepsForPlan(steps: Step[]): ReActStep[] {
  const reactSteps: ReActStep[] = [];
  
  steps.forEach((step, index) => {
    const observation = mockStepObservations[step.apiId] || `执行 ${step.apiName} 完成，返回正常结果。`;
    
    reactSteps.push({
      id: `react-step-${step.id}`,
      thought: `正在执行计划中的第 ${index + 1} 步：[${step.apiName}]，旨在${step.description}`,
      action: step.apiName,
      actionParams: { 
        apiId: step.apiId,
        deviceId: 'ECHO-001',
        timestamp: new Date().toISOString()
      },
      observation,
      timestamp: new Date().toISOString(),
    });
  });
  
  reactSteps.push({
    id: `react-step-final`,
    thought: '所有计划步骤已执行完成，现在总结分析结果并生成故障处置方案。',
    action: '总结回答',
    observation: '分析完成！综合所有步骤的执行结果，已完成故障排查和分析。',
    timestamp: new Date().toISOString(),
  });
  
  return reactSteps;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('新对话');
  const [executionPhase, setExecutionPhase] = useState<ExecutionPhase>('planning');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [planSteps, setPlanSteps] = useState<Step[]>([]);
  const [originalSteps, setOriginalSteps] = useState<Step[]>([]);
  const [executedSteps, setExecutedSteps] = useState<Step[]>([]);
  const [reactSteps, setReactSteps] = useState<ReActStep[]>([]);
  const [showExpertGuidance, setShowExpertGuidance] = useState(false);
  const [dynamicAdjustments, setDynamicAdjustments] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, planSteps, executionPhase, reactSteps, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      const firstUserMsg = messages.find(m => m.role === 'user');
      if (firstUserMsg) {
        const title = firstUserMsg.content.substring(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '');
        setSessionTitle(title);
      }
    }
  }, [messages]);

  const initializePlan = (input: string): Step[] => {
    const defaultSteps: Step[] = [
      {
        id: 'step-1',
        apiId: 'log-query',
        apiName: '日志查询',
        description: '查询设备运行日志，获取故障相关信息',
        status: 'pending'
      },
      {
        id: 'step-2',
        apiId: 'cpu-monitor',
        apiName: 'CPU监控',
        description: '检查设备CPU使用率和进程信息',
        status: 'pending'
      },
      {
        id: 'step-3',
        apiId: 'port-scan',
        apiName: '端口诊断',
        description: '扫描目标设备的开放端口',
        status: 'pending'
      }
    ];

    if (input.includes('网络') || input.includes('连接')) {
      return [
        {
          id: 'step-1',
          apiId: 'port-scan',
          apiName: '端口诊断',
          description: '扫描目标设备的开放端口，检测网络连接状态',
          status: 'pending'
        },
        {
          id: 'step-2',
          apiId: 'protocol-analyze',
          apiName: '协议分析',
          description: '分析网络协议数据包，识别异常流量',
          status: 'pending'
        }
      ];
    }

    if (input.includes('安全') || input.includes('权限')) {
      return [
        {
          id: 'step-1',
          apiId: 'security-check',
          apiName: '安全检测',
          description: '检查设备安全状态，识别潜在威胁',
          status: 'pending'
        },
        {
          id: 'step-2',
          apiId: 'log-query',
          apiName: '日志查询',
          description: '查询安全相关日志',
          status: 'pending'
        }
      ];
    }

    return defaultSteps;
  };

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

    if (inputValue.includes('专家指导') || inputValue.includes('人工')) {
      setShowExpertGuidance(true);
      setPlanSteps([]);
      setOriginalSteps([]);
      setReactSteps([]);
      setExecutedSteps([]);
      setDynamicAdjustments([]);
      return;
    }

    const steps = initializePlan(inputValue);
    setPlanSteps(steps);
    setOriginalSteps([...steps]);
    setExecutedSteps([]);
    setReactSteps([]);
    setDynamicAdjustments([]);
    setExecutionPhase('planning');
    setCurrentStepIndex(-1);
    setShowExpertGuidance(false);
  };

  const handleStartExecution = async () => {
    setExecutionPhase('executing');
    setCurrentStepIndex(-1);
    setIsTyping(true);
    setDynamicAdjustments([]);

    const allReActSteps = generateReActStepsForPlan(planSteps);
    setReactSteps([]);

    for (let i = 0; i < allReActSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setReactSteps(prev => [...prev, allReActSteps[i]]);
      setCurrentStepIndex(i);

      if (planSteps[i]) {
        setExecutedSteps(prev => [...prev, {
          ...planSteps[i],
          status: 'completed' as const,
          result: mockStepObservations[planSteps[i].apiId]?.substring(0, 50) + '...' || '执行完成'
        }]);
      }

      if (i === 1 && Math.random() > 0.7) {
        setDynamicAdjustments(prev => [...prev, `步骤 ${i+1} 发现新线索，追加安全检测步骤`]);
      }
    }

    setIsTyping(false);
    setExecutionPhase('completed');
  };

  const handlePauseExecution = () => {
    setExecutionPhase('planning');
    setIsTyping(false);
  };

  const handleReset = () => {
    setPlanSteps([]);
    setOriginalSteps([]);
    setExecutedSteps([]);
    setReactSteps([]);
    setDynamicAdjustments([]);
    setExecutionPhase('planning');
    setCurrentStepIndex(-1);
    setIsTyping(false);
  };

  const handleUpdateSteps = (steps: Step[]) => {
    setPlanSteps(steps);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionTitle('新对话');
    setInputValue('');
    setPlanSteps([]);
    setOriginalSteps([]);
    setExecutedSteps([]);
    setReactSteps([]);
    setDynamicAdjustments([]);
    setExecutionPhase('planning');
    setCurrentStepIndex(-1);
    setIsTyping(false);
    setShowExpertGuidance(false);
  };

  const hasCompletedExecution = executionPhase === 'completed';
  const hasReactSteps = reactSteps.length > 0;

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
          {messages.length === 0 && planSteps.length === 0 && !showExpertGuidance ? (
            <div className="h-full flex flex-col items-center justify-center px-6">
              <Bot className="w-20 h-20 text-blue-600 mb-6" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">欢迎使用智能体</h2>
              <p className="text-gray-500 mb-6 text-center">请输入您的问题，智能体将为您解答</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['天气', '用户信息', '计算', '设备日志', '专家指导'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setInputValue(tag === '设备日志' ? '查看设备日志' : tag === '专家指导' ? '专家指导' : `查询${tag}`)}
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {planSteps.length > 0 && executionPhase === 'planning' && (
                <div className="max-w-3xl mx-auto">
                  <ExecutablePlanBoard
                    steps={planSteps}
                    phase={executionPhase}
                    currentStepIndex={currentStepIndex}
                    onUpdateSteps={handleUpdateSteps}
                    onStartExecution={handleStartExecution}
                    onPauseExecution={handlePauseExecution}
                    onReset={handleReset}
                  />
                </div>
              )}

              {executionPhase === 'executing' && hasReactSteps && (
                <div className="max-w-3xl mx-auto">
                  <ThoughtChain
                    steps={reactSteps}
                    status="RUNNING"
                  />
                </div>
              )}

              {executionPhase === 'completed' && hasReactSteps && (
                <>
                  <div className="max-w-3xl mx-auto">
                    <ThoughtChain
                      steps={reactSteps}
                      status="COMPLETED"
                    />
                  </div>

                  <div className="max-w-3xl mx-auto">
                    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-gray-800">故障处置方案</h4>
                      </div>
                      <p className="text-gray-700">
                        执行完成！综合分析所有步骤结果，已完成故障排查。
                        <ul className="mt-2 text-sm space-y-1">
                          {reactSteps.slice(0, -1).map((step, index) => (
                            <li key={step.id} className="flex items-start gap-2">
                              <span className="text-green-600">✓</span>
                              <span>{step.action}：{step.observation.substring(0, 50)}...</span>
                            </li>
                          ))}
                        </ul>
                      </p>
                    </div>
                  </div>

                  <div className="max-w-3xl mx-auto">
                    <ExecutionTrace
                      originalSteps={originalSteps}
                      executedSteps={executedSteps}
                      adjustments={dynamicAdjustments}
                    />
                  </div>

                  <div className="max-w-3xl mx-auto">
                    <SolutionReportCard steps={reactSteps} />
                  </div>
                </>
              )}

              {showExpertGuidance && (
                <div className="max-w-3xl mx-auto">
                  <ExpertGuidanceCard issueType="system" />
                </div>
              )}

              {isTyping && (
                <div className="flex justify-start max-w-3xl mx-auto">
                  <div className="bg-white px-4 py-3 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="text-sm text-gray-500">
                        正在执行第 {currentStepIndex + 1} / {planSteps.length} 步...
                      </span>
                    </div>
                  </div>
                </div>
              )}
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
              disabled={!inputValue.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              <span>发送</span>
            </button>
          </div>
          <div className="max-w-4xl mx-auto mt-3">
            <div className="flex flex-wrap gap-2">
              {['天气', '用户信息', '计算', '设备日志', '专家指导'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setInputValue(tag === '设备日志' ? '查看设备日志' : tag === '专家指导' ? '专家指导' : `查询${tag}`)}
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