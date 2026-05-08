import React, { useState } from 'react';
import { HelpCircle, Terminal, BookOpen, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

type IssueType = 'network' | 'system' | 'security';

interface ExpertGuidanceCardProps {
  issueType: IssueType;
}

export default function ExpertGuidanceCard({ issueType }: ExpertGuidanceCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const guidanceData = {
    'network': {
      manualSteps: [
        '检查网络连接状态：ping 目标主机',
        '查看防火墙规则：iptables -L',
        '检查路由表：route -n',
        '验证 DNS 解析：nslookup example.com'
      ],
      commands: [
        { cmd: 'ping -c 4 192.168.1.1', desc: '测试网关连通性' },
        { cmd: 'traceroute example.com', desc: '追踪路由路径' },
        { cmd: 'netstat -tuln', desc: '查看监听端口' },
        { cmd: 'curl -I http://example.com', desc: '测试 HTTP 服务' }
      ],
      cases: [
        '案例1：端口未开放导致连接失败',
        '案例2：DNS 解析错误导致域名无法访问',
        '案例3：防火墙规则阻止了特定端口'
      ]
    },
    'system': {
      manualSteps: [
        '检查系统资源：top / htop',
        '查看系统日志：tail -f /var/log/syslog',
        '检查磁盘空间：df -h',
        '验证服务状态：systemctl status service-name'
      ],
      commands: [
        { cmd: 'top -n 1', desc: '查看进程资源占用' },
        { cmd: 'free -h', desc: '查看内存使用情况' },
        { cmd: 'df -h', desc: '查看磁盘空间' },
        { cmd: 'journalctl -u nginx', desc: '查看服务日志' }
      ],
      cases: [
        '案例1：内存不足导致服务崩溃',
        '案例2：磁盘满导致写入失败',
        '案例3：进程占用过高 CPU'
      ]
    },
    'security': {
      manualSteps: [
        '检查用户权限：id username',
        '查看 sudo 配置：visudo',
        '检查 SELinux 状态：getenforce',
        '验证证书有效性：openssl x509 -in cert.crt -text'
      ],
      commands: [
        { cmd: 'ls -la /path/to/file', desc: '查看文件权限' },
        { cmd: 'getsebool -a | grep httpd', desc: '查看 SELinux 布尔值' },
        { cmd: 'openssl s_client -connect example.com:443', desc: '测试 SSL 连接' },
        { cmd: 'last -10', desc: '查看最近登录记录' }
      ],
      cases: [
        '案例1：权限不足导致无法访问文件',
        '案例2：SELinux 阻止了服务访问',
        '案例3：证书过期导致 HTTPS 失败'
      ]
    }
  };

  const data = guidanceData[issueType] || guidanceData.system;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg">
          <HelpCircle className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h4 className="font-semibold text-gray-800">专家指导建议</h4>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            当前问题类型未匹配到可用 API，以下是人工排查建议
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="border border-amber-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('steps')}
            className="w-full px-4 py-3 bg-white hover:bg-amber-50 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-gray-700">人工排查步骤</span>
            </div>
            {expandedSection === 'steps' ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSection === 'steps' && (
            <div className="p-4 bg-amber-50/50 space-y-2">
              {data.manualSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-amber-200 text-amber-700 rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-amber-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('commands')}
            className="w-full px-4 py-3 bg-white hover:bg-amber-50 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-gray-700">常用查询命令</span>
            </div>
            {expandedSection === 'commands' ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSection === 'commands' && (
            <div className="p-4 space-y-3">
              {data.commands.map((item, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-3">
                  <code className="text-green-400 text-sm font-mono">{item.cmd}</code>
                  <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-amber-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('cases')}
            className="w-full px-4 py-3 bg-white hover:bg-amber-50 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-gray-700">相似案例参考</span>
            </div>
            {expandedSection === 'cases' ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSection === 'cases' && (
            <div className="p-4 bg-amber-50/50 space-y-2">
              {data.cases.map((caseItem, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-amber-600">📌</span>
                  <span className="text-sm text-gray-700">{caseItem}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}