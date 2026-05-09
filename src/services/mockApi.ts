import { AgentConfig, ChatRequest, ChatResponse, TaskStatusResponse, ReActStep, APIConfig, TaskStatus } from '@/types';

const mockAgent: AgentConfig = {
  id: 'agent-001',
  name: '智能分析服务',
  description: '统一 API 代理模式的智能分析服务',
  mode: 'react',
  apiConfig: {
    id: 'api-gateway-001',
    name: '智能分析服务',
    url: 'https://api.example.com/agent',
    method: 'POST',
    authType: 'BEARER_TOKEN',
    requiresConfirmation: false,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

interface TaskContext {
  taskId: string;
  status: TaskStatus;
  currentStep: number;
  steps: ReActStep[];
  finalAnswer?: string;
  requiresAction?: {
    action: string;
    actionParams: Record<string, unknown>;
    reason: string;
  };
}

const taskStore: Record<string, TaskContext> = {};

function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

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

function generateBackendResponse(message: string): { steps: ReActStep[]; needConfirmation?: { action: string; reason: string } } {
  if (message.includes('天气') || message.includes('温度')) {
    return {
      steps: [
        {
          id: 'step-1',
          thought: '用户想查询天气，调用天气查询工具获取当前天气信息。',
          action: 'weather_query',
          actionParams: { city: '北京' },
          observation: '北京当前天气：晴朗，温度25°C，湿度60%',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'step-2',
          thought: '天气信息已获取，总结回答用户。',
          action: '总结回答',
          observation: '北京今日天气晴朗，温度25°C，适合外出。',
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  if (message.includes('用户信息') || message.includes('个人资料')) {
    return {
      steps: [
        {
          id: 'step-1',
          thought: '用户需要查询用户信息，这是一个敏感操作。',
          action: 'user_info_query',
          actionParams: { userId: 'user123' },
          observation: '需要用户确认后才能执行此操作',
          timestamp: new Date().toISOString(),
        },
      ],
      needConfirmation: {
        action: 'user_info_query',
        reason: '该操作涉及用户隐私数据，需要人工确认是否继续执行',
      },
    };
  }

  if (message.includes('计算') || message.includes('+') || message.includes('-') || message.includes('*') || message.includes('/')) {
    return {
      steps: [
        {
          id: 'step-1',
          thought: '用户需要进行数学计算，调用计算器工具。',
          action: 'calculator',
          actionParams: { expression: message },
          observation: '计算完成，结果：42',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'step-2',
          thought: '计算完成，给出最终答案。',
          action: '总结回答',
          observation: '计算结果为 42',
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  if (message.includes('日志') || message.includes('设备') || message.includes('故障')) {
    return {
      steps: [
        {
          id: 'step-1',
          thought: '用户需要查看设备日志，调用日志查询工具。',
          action: 'log_query',
          actionParams: { deviceId: 'device-001', startTime: '2024-01-15 08:00:00', endTime: '2024-01-15 08:30:00' },
          observation: longDeviceLog,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'step-2',
          thought: '日志已获取，分析日志内容。',
          action: 'log_analysis',
          actionParams: { deviceId: 'device-001' },
          observation: '分析结果：1. 温度传感器曾出现异常(-100°C)，已自动恢复；2. 网络延迟在正常范围内；3. 设备整体状态良好。',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'step-3',
          thought: '分析完成，生成故障处置建议。',
          action: '总结回答',
          observation: '故障已定位：温度传感器偶发性故障，已自动恢复。建议持续监控。',
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  return {
    steps: [
      {
        id: 'step-1',
        thought: '用户提出了问题，开始分析。',
        action: 'analyze',
        actionParams: { query: message },
        observation: '问题分析完成',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'step-2',
        thought: '分析完成，生成回答。',
        action: '总结回答',
        observation: `已收到您的问题：${message}，正在处理中...`,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const agent = mockAgent;
  const taskId = generateTaskId();

  if (agent.mode === 'react') {
    const { steps, needConfirmation } = generateBackendResponse(request.message);

    const context: TaskContext = {
      taskId,
      status: needConfirmation ? 'WAITING_USER' : 'RUNNING',
      currentStep: 0,
      steps: [],
      requiresAction: needConfirmation ? {
        action: needConfirmation.action,
        actionParams: steps[0]?.actionParams || {},
        reason: needConfirmation.reason,
      } : undefined,
    };

    taskStore[taskId] = context;

    return {
      taskId,
      mode: 'react',
      status: needConfirmation ? 'need_confirmation' : 'running',
    };
  } else {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      mode: 'workflow',
      answer: `工作流模式响应：已收到消息"${request.message}"`,
    };
  }
}

export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const task = taskStore[taskId];
  if (!task) {
    return {
      taskId,
      status: 'FAILED',
      mode: 'react',
      steps: [],
      error: '任务不存在',
    };
  }

  if (task.status === 'WAITING_USER') {
    return {
      taskId,
      status: 'WAITING_USER',
      mode: 'react',
      steps: task.steps,
      requiresAction: task.requiresAction,
    };
  }

  if (task.status === 'RUNNING' && task.currentStep < task.steps.length) {
    task.currentStep += 1;
    return {
      taskId,
      status: task.currentStep >= task.steps.length ? 'COMPLETED' : 'RUNNING',
      mode: 'react',
      steps: task.steps.slice(0, task.currentStep),
    };
  }

  return {
    taskId,
    status: 'COMPLETED',
    mode: 'react',
    steps: task.steps,
    finalAnswer: task.finalAnswer || task.steps.map(s => s.observation).join('\n'),
  };
}

export async function confirmAction(taskId: string, confirmed: boolean): Promise<TaskStatusResponse> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const task = taskStore[taskId];
  if (!task) {
    return {
      taskId,
      status: 'FAILED',
      mode: 'react',
      steps: [],
      error: '任务不存在',
    };
  }

  if (!confirmed) {
    task.status = 'FAILED';
    return {
      taskId,
      status: 'FAILED',
      mode: 'react',
      steps: task.steps,
      error: '用户拒绝执行此操作',
    };
  }

  task.status = 'RUNNING';
  task.requiresAction = undefined;

  const { steps } = generateBackendResponse('continuation');
  task.steps = steps;
  task.currentStep = 0;

  return {
    taskId,
    status: 'RUNNING',
    mode: 'react',
    steps: [],
  };
}

export async function getAgentConfig(agentId: string): Promise<AgentConfig | null> {
  await new Promise(resolve => setTimeout(resolve => {}, 300));
  return { ...mockAgent };
}

export async function updateAgentConfig(config: Partial<AgentConfig>): Promise<AgentConfig> {
  await new Promise(resolve => setTimeout(resolve => {}, 500));
  Object.assign(mockAgent, config);
  mockAgent.updatedAt = new Date().toISOString();
  return { ...mockAgent };
}