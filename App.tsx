import React, { useState, useEffect } from 'react';
import { Plus, Search, Layers, Video, Mic, FileText, Twitter, BrainCircuit } from 'lucide-react';
import { Resource, ResourceType } from './types';
import { ResourceCard } from './components/ResourceCard';
import { AddResourceModal } from './components/AddResourceModal';

const SAMPLE_DATA: Resource[] = [
  {
    id: '1',
    title: '深入理解 React Server Components',
    url: 'https://react.dev',
    type: ResourceType.ARTICLE,
    platform: 'Official Docs',
    summary: '深入探讨 RSC 如何改变现代 Web 开发中的数据获取范式，重点在于服务器端渲染的优势。',
    userNotes: '关键点：通过在服务器上渲染来减小 Bundle 体积。',
    tags: ['React', '前端', '性能优化'],
    createdAt: Date.now(),
    contentRaw: 'React Server Components allow developers to write components that run exclusively on the server.'
  },
  {
    id: '2',
    title: 'AI 智能体的未来',
    url: 'https://twitter.com',
    type: ResourceType.TWEET,
    platform: 'X',
    summary: '讨论自主智能体（Autonomous Agents）将如何取代传统的 SaaS 工作流，成为新的应用形态。',
    userNotes: '',
    tags: ['AI', '未来科技', 'Agent'],
    createdAt: Date.now() - 100000,
    contentRaw: 'Agents are the new apps.'
  }
];

export default function App() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filterType, setFilterType] = useState<ResourceType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mindvault_resources');
    if (saved) {
      setResources(JSON.parse(saved));
    } else {
      setResources(SAMPLE_DATA);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('mindvault_resources', JSON.stringify(resources));
  }, [resources]);

  const handleAddResource = (data: Partial<Resource>) => {
    const newResource: Resource = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      title: data.title || '无标题',
      url: data.url || '#',
      type: data.type || ResourceType.ARTICLE,
      platform: data.platform || '未知',
      summary: data.summary || '',
      tags: data.tags || [],
      userNotes: data.userNotes || '',
      contentRaw: data.contentRaw || ''
    };
    setResources(prev => [newResource, ...prev]);
  };

  const handleDeleteResource = (id: string) => {
    if (confirm('您确定要删除此资源吗？')) {
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, userNotes: notes } : r));
  };

  const filteredResources = resources.filter(r => {
    const matchesType = filterType === 'ALL' || r.type === filterType;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-lg">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">思维金库</h1>
          </div>
          
          <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 border border-slate-200 focus-within:ring-2 focus-within:ring-brand-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text"
              placeholder="搜索标题或标签..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-slate-900/20"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">添加内容</span>
          </button>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden px-4 py-2 bg-white border-b border-slate-200">
        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text"
            placeholder="搜索..."
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">收藏分类</h2>
            
            {[
              { id: 'ALL', label: '全部内容', icon: Layers },
              { id: ResourceType.VIDEO, label: '视频', icon: Video },
              { id: ResourceType.ARTICLE, label: '文章', icon: FileText },
              { id: ResourceType.TWEET, label: '推文 / 短内容', icon: Twitter },
              { id: ResourceType.AUDIO, label: '音频 / 播客', icon: Mic },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = filterType === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setFilterType(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-brand-50 text-brand-700' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                  {item.label}
                </button>
              );
            })}

            <div className="pt-6 px-3">
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl p-4 text-white shadow-lg">
                <h3 className="font-bold mb-1">每周洞察</h3>
                <p className="text-xs text-brand-100 opacity-90 leading-relaxed">
                  "学而不思则罔，思而不学则殆。"
                </p>
                <div className="mt-3 text-xs font-medium bg-white/20 inline-block px-2 py-1 rounded">
                  已收录 {resources.length} 条内容
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid Content */}
        <div className="flex-grow">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">
              {filterType === 'ALL' ? '全部内容' : 
               filterType === 'VIDEO' ? '视频' :
               filterType === 'AUDIO' ? '音频' :
               filterType === 'TWEET' ? '微内容' : '文章'}
            </h2>
            <span className="text-sm text-slate-500">{filteredResources.length} 个结果</span>
          </div>

          {filteredResources.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="text-slate-300 w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">未找到内容</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                通过添加网络上的有趣文章、视频或想法来构建您的知识库。
              </p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 text-brand-600 font-medium hover:text-brand-700"
              >
                添加第一条内容 &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredResources.map(resource => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource} 
                  onDelete={handleDeleteResource}
                  onUpdateNotes={handleUpdateNotes}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddResourceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddResource}
      />
    </div>
  );
}