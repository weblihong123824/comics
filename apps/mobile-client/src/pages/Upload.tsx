import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, Camera, Image, FileText } from 'lucide-react';
import { Button } from '@comic/ui-components';
import { validateFile, formatFileSize } from '@comic/utils';
import type { UploadProgress } from '@comic/shared-types';

export const Upload: React.FC = () => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert('以下文件上传失败:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setUploading(true);
      await simulateUpload(validFiles);
      setUploading(false);
    }
  };

  const simulateUpload = async (files: File[]) => {
    const progressItems: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
      id: Math.random().toString(36).substr(2, 9)
    }));

    setUploadProgress(progressItems);

    for (const item of progressItems) {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => 
          prev.map(p => 
            p.id === item.id 
              ? { ...p, progress, status: progress === 100 ? 'completed' : 'uploading' }
              : p
          )
        );
      }
    }

    setTimeout(() => {
      setUploadProgress([]);
    }, 2000);
  };

  return (
    <div className="p-4 space-y-6">
      {/* 头部 */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">上传文件</h1>
        <p className="text-gray-500 dark:text-gray-400">选择文件或拖拽到下方区域</p>
      </div>

      {/* 主上传区域 */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx,.xls,.xlsx"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500">
            <UploadIcon className="w-full h-full" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {dragOver ? '释放文件开始上传' : '拖拽文件到此处'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              支持图片、视频、音频、文档等格式
            </p>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              选择文件
            </Button>
          </div>
        </div>
      </div>

      {/* 快速上传选项 */}
      <div className="grid grid-cols-3 gap-3">
        <button className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">拍照</span>
        </button>
        <button className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <Image className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">相册</span>
        </button>
        <button className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">文档</span>
        </button>
      </div>

      {/* 上传进度 */}
      {uploadProgress.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">上传进度</h3>
          {uploadProgress.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(item.file.size)}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white ml-4">
                  {item.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    item.status === 'completed' 
                      ? 'bg-green-500' 
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">上传说明</h4>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>• 单个文件最大支持 100MB</li>
          <li>• 支持图片、视频、音频、文档格式</li>
          <li>• 可同时上传多个文件</li>
        </ul>
      </div>
    </div>
  );
};
