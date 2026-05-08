import { AgentConfig, ChatRequest, ChatResponse, TaskStatusResponse, ReActStep, APIConfig, TaskStatus } from '@/types';

const mockAgent: AgentConfig = {
  id: 'agent-001',
  name: '测试智能体',
  description: '用于演示双模式的测试智能体',
  mode: 'react',
  toolkits: [
    {
      id: 'toolkit-001',
      name: '天气查询',
      url: 'https://api.weather.example.com/query',
      method: 'GET',
      description: '查询指定城市的天气信息',
      authType: 'API_KEY',
      requiresConfirmation: false,
    },
    {
      id: 'toolkit-002',
      name: '用户信息查询',
      url: 'https://api.user.example.com/profile',
      method: 'GET',
      description: '查询用户详细信息（敏感接口）',
      authType: 'BEARER_TOKEN',
      requiresConfirmation: true,
    },
    {
      id: 'toolkit-003',
      name: '计算器',
      url: 'https://api.calculator.example.com/compute',
      method: 'POST',
      description: '执行数学计算',
      authType: 'NONE',
      requiresConfirmation: false,
    },
  ],
  systemPrompt: '你是一个智能助手，使用提供的工具来回答用户问题。按照以下格式输出：\n思考：你的思考过程\n行动：工具名称\n参数：{...}\n观察：工具返回结果',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockReActSteps: Record<string, { steps: ReActStep[]; status: TaskStatus; currentStep: number; finalAnswer?: string; requiresAction?: TaskStatusResponse['requiresAction'] }> = {};

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

function createReActSteps(message: string): ReActStep[] {
  const steps: ReActStep[] = [];
  
  if (message.includes('天气') || message.includes('温度')) {
    steps.push({
      id: 'step-1',
      thought: '用户想查询天气，我需要使用天气查询工具获取当前天气信息。',
      action: '天气查询',
      actionParams: { city: '北京' },
      observation: '北京当前天气：晴朗，温度25°C，湿度60%',
      timestamp: new Date().toISOString(),
    });
    steps.push({
      id: 'step-2',
      thought: '已经获取到天气信息，现在可以总结回答用户的问题了。',
      action: '总结回答',
      observation: '已完成天气查询任务',
      timestamp: new Date().toISOString(),
    });
  } else if (message.includes('用户信息') || message.includes('个人资料')) {
    steps.push({
      id: 'step-1',
      thought: '用户想查询用户信息，这是一个敏感接口，需要先获取用户确认。',
      action: '用户信息查询',
      actionParams: { userId: 'user123' },
      observation: '等待用户确认',
      timestamp: new Date().toISOString(),
    });
    steps.push({
      id: 'step-2',
      thought: '用户已确认，现在调用用户信息查询接口。',
      action: '用户信息查询',
      actionParams: { userId: 'user123' },
      observation: '用户信息：姓名张三，邮箱zhangsan@example.com，注册时间2023-01-15',
      timestamp: new Date().toISOString(),
    });
    steps.push({
      id: 'step-3',
      thought: '已经获取到用户信息，可以总结回答了。',
      action: '总结回答',
      observation: '已完成用户信息查询',
      timestamp: new Date().toISOString(),
    });
  } else if (message.includes('计算') || message.includes('+') || message.includes('-') || message.includes('*') || message.includes('/')) {
    steps.push({
      id: 'step-1',
      thought: '用户需要进行数学计算，使用计算器工具。',
      action: '计算器',
      actionParams: { expression: message },
      observation: '计算结果：42',
      timestamp: new Date().toISOString(),
    });
    steps.push({
      id: 'step-2',
      thought: '计算完成，可以给出最终答案。',
      action: '总结回答',
      observation: '已完成计算任务',
      timestamp: new Date().toISOString(),
    });
  } else if (message.includes('日志') || message.includes('设备') || message.includes('故障')) {
    steps.push({
      id: 'step-1',
      thought: '用户需要查看设备日志，我需要调用日志查询工具获取设备的运行日志。',
      action: '设备日志查询',
      actionParams: { deviceId: 'device-001', startTime: '2024-01-15 08:00:00', endTime: '2024-01-15 08:30:00' },
      observation: longDeviceLog,
      timestamp: new Date().toISOString(),
    });
    steps.push({
      id: 'step-2',
      thought: '日志已获取，现在分析日志内容并给出故障定位分析报告。',
      action: '日志分析',
      observation: '分析结果：1. 温度传感器曾出现异常(-100°C)，已自动恢复；2. 网络延迟在正常范围内；3. 设备整体状态良好。',
      timestamp: new Date().toISOString(),
    });
    steps.push({
      id: 'step-3',
      thought: '分析完成，可以总结回答用户的问题了。',
      action: '总结回答',
      observation: '已完成设备日志分析',
      timestamp: new Date().toISOString(),
    });
  } else {
    steps.push({
      id: 'step-1',
      thought: '用户提出了一个问题，我需要分析这个问题并决定是否需要调用工具。',
      action: '分析问题',
      observation: '问题分析完成',
      timestamp: new Date().toISOString(),
    });
    steps.push({
      id: 'step-2',
      thought: '经过分析，我可以直接回答这个问题，不需要调用工具。',
      action: '直接回答',
      observation: '回答生成完成',
      timestamp: new Date().toISOString(),
    });
  }
  
  return steps;
}

export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const agent = mockAgent;
  const taskId = generateTaskId();
  
  if (agent.mode === 'react') {
    const steps = createReActSteps(request.message);
    const requiresAction = agent.toolkits.find(t => t.name === steps[0]?.action && t.requiresConfirmation);
    
    mockReActSteps[taskId] = {
      steps,
      status: requiresAction ? 'WAITING_USER' : 'RUNNING',
      currentStep: 0,
      requiresAction: requiresAction ? {
        action: steps[0].action!,
        actionParams: steps[0].actionParams || {},
        apiConfig: requiresAction,
      } : undefined,
    };
    
    return {
      taskId,
      mode: 'react',
    };
  } else {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      mode: 'workflow',
      answer: '这是来自工作流模式的响应：' + request.message,
    };
  }
}

export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const task = mockReActSteps[taskId];
  if (!task) {
    return {
      taskId,
      status: 'FAILED',
      mode: 'react',
      steps: [],
      error: '任务不存在',
    };
  }
  
  const { steps, status, currentStep, finalAnswer } = task;
  
  if (status === 'WAITING_USER') {
    return {
      taskId,
      status: 'WAITING_USER',
      mode: 'react',
      steps: steps.slice(0, currentStep),
      requiresAction: task.requiresAction,
    };
  }
  
  if (currentStep < steps.length) {
    task.currentStep += 1;
    return {
      taskId,
      status: currentStep >= steps.length ? 'COMPLETED' : 'RUNNING',
      mode: 'react',
      steps: steps.slice(0, task.currentStep),
    };
  }
  
  return {
    taskId,
    status: 'COMPLETED',
    mode: 'react',
    steps,
    finalAnswer: finalAnswer || '根据分析，我为您整理了以下答案：\n\n' + steps.map(s => s.observation).join('\n'),
  };
}

export async function confirmAction(taskId: string, confirmed: boolean): Promise<TaskStatusResponse> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const task = mockReActSteps[taskId];
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
      steps: task.steps.slice(0, task.currentStep),
      error: '用户拒绝执行此操作',
    };
  }
  
  task.status = 'RUNNING';
  task.requiresAction = undefined;
  return {
    taskId,
    status: 'RUNNING',
    mode: 'react',
    steps: task.steps.slice(0, task.currentStep),
  };
}

export async function getAgentConfig(agentId: string): Promise<AgentConfig | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockAgent;
}

export async function updateAgentConfig(config: Partial<AgentConfig>): Promise<AgentConfig> {
  await new Promise(resolve => setTimeout(resolve, 500));
  Object.assign(mockAgent, config);
  mockAgent.updatedAt = new Date().toISOString();
  return mockAgent;
}

export async function createToolkit(agentId: string, config: Omit<APIConfig, 'id'>): Promise<APIConfig> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newToolkit: APIConfig = {
    ...config,
    id: `toolkit-${Date.now()}`,
  };
  mockAgent.toolkits.push(newToolkit);
  return newToolkit;
}

export async function deleteToolkit(agentId: string, toolkitId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  mockAgent.toolkits = mockAgent.toolkits.filter(t => t.id !== toolkitId);
}