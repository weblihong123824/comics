import React, { useState } from 'react';
import { Search, Grid, List, MoreVertical } from 'lucide-react';
import { FileItem, ViewMode } from '@fun-box/shared-types';
import { formatFileSize, formatDate } from '@fun-box/utils';

export const Files: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - 在实际应用中这将来自API
  const files: FileItem[] = [
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      modified: new Date('2024-01-15'),
      modifiedAt: new Date('2024-01-15'),
      created: new Date('2024-01-01'),
      owner: 'John Doe',
    },
    {
      id: '2',
      name: 'presentation.pdf',
      type: 'file',
      size: 2048576,
      modified: new Date('2024-01-14'),
      modifiedAt: new Date('2024-01-14'),
      mimeType: 'application/pdf',
    },
    {
      id: '3',
      name: 'vacation-photo.jpg',
      type: 'file',
      size: 1536000,
      modified: new Date('2024-01-13'),
      modifiedAt: new Date('2024-01-13'),
      mimeType: 'image/jpeg',
    },
  ];

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return '📁';
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      case 'mp4': return '🎥';
      case 'mp3': return '🎵';
      default: return '📄';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">我的文件</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="搜索文件..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 文件列表 */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${
              viewMode === 'grid' ? 'p-4 text-center' : 'p-3 flex items-center justify-between'
            }`}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="text-4xl mb-2">{getFileIcon(file)}</div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{file.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {file.type === 'file' && file.size ? formatFileSize(file.size) : '文件夹'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(file.modified)}</p>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-2xl">{getFileIcon(file)}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{file.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {file.type === 'file' && file.size ? formatFileSize(file.size) : '文件夹'} • {formatDate(file.modified)}
                    </p>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreVertical size={16} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无文件</h3>
          <p className="text-gray-500 dark:text-gray-400">开始上传您的第一个文件吧</p>
        </div>
      )}
    </div>
  );
};
