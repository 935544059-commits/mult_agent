import React, { useState, useCallback } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { ReActStep } from '@/types';

interface SolutionReportCardProps {
  steps: ReActStep[];
  content: string;
}

export const SolutionReportCard: React.FC<SolutionReportCardProps> = ({
  steps,
  content,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileName = '故障分析与处置建议书.docx';

  const handleDownload = useCallback(async () => {
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const analysisProcess = steps
      .filter(step => step.thought && step.action !== '总结回答')
      .map(step => `【${step.action}】\n分析：${step.thought}\n结果：${step.observation}`)
      .join('\n\n');

    const phenomena = steps
      .filter(step => step.action !== '总结回答')
      .map(step => step.observation)
      .join('\n');

    const now = new Date();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>故障分析与处置建议书</title>
        <style>
          body { font-family: 'Microsoft YaHei', sans-serif; margin: 40px; line-height: 1.8; }
          h1 { color: #1a1a1a; border-bottom: 3px solid #2563eb; padding-bottom: 12px; }
          h2 { color: #2563eb; margin-top: 30px; }
          .meta { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
          .meta p { margin: 5px 0; }
          .section { margin-bottom: 25px; }
          .content { background: #f9fafb; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>故障分析与处置建议书</h1>
        <div class="meta">
          <p><strong>生成时间：</strong>${now.toLocaleString('zh-CN')}</p>
          <p><strong>设备名称：</strong>IoT传感器设备 (device-001)</p>
          <p><strong>分析模式：</strong>ReAct智能体分析</p>
        </div>
        
        <div class="section">
          <h2>一、故障现象</h2>
          <div class="content">${phenomena || '详见下方处置内容'}</div>
        </div>
        
        <div class="section">
          <h2>二、分析过程</h2>
          <div class="content">${analysisProcess || '系统已完成自动分析'}</div>
        </div>
        
        <div class="section">
          <h2>三、处置建议</h2>
          <div class="content">${content}</div>
        </div>
        
        <div class="footer">
          <p>本报告由AI智能体自动生成，仅供参考。具体处置方案请结合实际情况执行。</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsLoading(false);
  }, [steps, content]);

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{fileName}</p>
            <p className="text-xs text-gray-500">包含现象分析、推理过程及处置建议</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              正在生成...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              下载方案
            </>
          )}
        </button>
      </div>
    </div>
  );
};