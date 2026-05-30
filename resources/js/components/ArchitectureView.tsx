/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import { BLUEPRINTS } from '../blueprints';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Database, 
  Terminal, 
  Server, 
  Layers,
  ChevronRight,
  Sparkles,
  Search
} from 'lucide-react';

export default function ArchitectureView() {
  const [activeCategoryId, setActiveCategoryId] = useState(BLUEPRINTS[0].id);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedState, setCopiedState] = useState(false);
  const [codeQuery, setCodeQuery] = useState('');

  const activeCategory = BLUEPRINTS.find(cat => cat.id === activeCategoryId) || BLUEPRINTS[0];
  const activeFile = activeCategory.files[selectedFileIndex] || activeCategory.files[0] || { title: 'Untitled', filename: 'file', language: 'txt', code: '' };

  // Copy code to clipboard handler
  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'supabase-db': return <Database className="w-4 h-4 shrink-0 text-[#C8102E]" />;
      case 'laravel-core': return <Server className="w-4 h-4 shrink-0 text-[#C8102E]" />;
      case 'laravel-modules': return <Layers className="w-4 h-4 shrink-0 text-[#C8102E]" />;
      case 'nextjs-client': return <Terminal className="w-4 h-4 shrink-0 text-[#C8102E]" />;
      default: return <FileCode2 className="w-4 h-4 shrink-0 text-[#C8102E]" />;
    }
  };

  // Filter categories or search within code blueprints if user wishes
  const filteredCategoryFiles = activeCategory.files.filter(f => 
    codeQuery === '' || 
    f.title.toLowerCase().includes(codeQuery.toLowerCase()) || 
    f.filename.toLowerCase().includes(codeQuery.toLowerCase()) ||
    f.code.toLowerCase().includes(codeQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex overflow-hidden bg-neutral-900 text-gray-100 font-sans">
      
      {/* LEFT PANEL: Categories Navigation & Files Selector */}
      <div className="w-72 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0">
        
        {/* Panel Title banner */}
        <div className="p-4 border-b border-white/10 bg-neutral-950 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C8102E]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Full Stack Blueprints Hub</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono leading-tight">Copy-paste production codebases ready for NextJS 14 and Laravel 11.</p>
        </div>

        {/* Categories Scroller list */}
        <div className="p-3 border-b border-white/5 bg-neutral-950/40">
          <span className="text-[9px] font-mono font-bold text-gray-500 uppercase px-2 py-1 block">Architecture Layer</span>
          <div className="space-y-1">
            {BLUEPRINTS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategoryId(cat.id);
                  setSelectedFileIndex(0);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[11px] rounded-[4px] font-semibold transition-all ${
                  activeCategoryId === cat.id 
                    ? 'bg-neutral-800 text-[#C8102E]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Files Browser search inside active category */}
        <div className="p-3 border-b border-white/5 flex items-center gap-2 bg-neutral-950/80">
          <Search className="w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search code assets..."
            value={codeQuery}
            onChange={(e) => setCodeQuery(e.target.value)}
            className="w-full text-[10px] bg-neutral-900 text-gray-200 outline-none border border-neutral-800 rounded-[4px] p-2 font-mono focus:border-[#C8102E]"
          />
        </div>

        {/* Files Browser List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="text-[9px] font-mono font-bold text-gray-500 uppercase px-1.5 py-1 block">Repository File Tree</span>
          
          {filteredCategoryFiles.length === 0 ? (
            <div className="p-4 text-center text-gray-500 font-mono text-[10px]">No files matching search.</div>
          ) : (
            filteredCategoryFiles.map((file, i) => {
              const fileRealIdx = activeCategory.files.indexOf(file);
              const isSelected = fileRealIdx === selectedFileIndex;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedFileIndex(fileRealIdx)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-[11px] rounded-[4px] transition-all font-mono text-left ${
                    isSelected 
                      ? 'bg-neutral-850 text-white font-bold border-l-2 border-[#C8102E]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#C8102E]' : 'text-neutral-700'}`} />
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-neutral-600 font-bold" />
                </button>
              );
            })
          )}
        </div>

        {/* System parameters code indicators */}
        <div className="p-3.5 border-t border-white/5 bg-neutral-950 font-mono text-[9px] text-gray-500 space-y-1 shrink-0">
          <div>PHP TARGET: PHP 8.3 Strict Types</div>
          <div>REACT TARGET: Next.js 14 App (App Router)</div>
          <div>SWAGGER SPECS: OpenAPI 3.0</div>
        </div>

      </div>

      {/* RIGHT PANEL: Code Editor & Markdown Viewer */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-950">
        
        {/* Editor Info Topbar */}
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between bg-neutral-950 shrink-0">
          <div className="space-y-1 truncate">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono">{activeFile.filename}</span>
              <span className="bg-neutral-800 text-[#C8102E] font-mono text-[9px] px-1.5 py-0.5 rounded-[4px] uppercase font-bold">
                {activeFile.language}
              </span>
            </div>
            <p className="text-[10px] text-neutral-450 truncate font-sans">{activeFile.title}</p>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3.5 py-1.5 bg-[#C8102E] hover:bg-[#b00d25] border border-transparent text-xs font-bold rounded-[4px] flex items-center gap-2 cursor-pointer text-white transition-all uppercase tracking-wider font-mono"
          >
            {copiedState ? (
              <>
                <Check className="w-3.5 h-3.5 text-white animate-scale" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-white" />
                <span>Copy Blueprint</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content Editor Area */}
        <div className="flex-1 overflow-auto p-6 bg-[#0B0B0C] shadow-inner select-text">
          <pre className="font-mono text-xs text-stone-300 leading-relaxed whitespace-pre font-light">
            <code>
              {activeFile.code}
            </code>
          </pre>
        </div>

        {/* Category Description Footer */}
        <div className="p-4 bg-neutral-950 text-xs text-neutral-400 border-t border-white/5 font-sans shrink-0">
          <p className="font-bold text-neutral-200 text-[10px] mb-1 font-mono tracking-wider">SECTION BREAKDOWN:</p>
          <p className="text-[11px] leading-relaxed text-gray-500">{activeCategory.description}</p>
        </div>

      </div>

    </div>
  );
}
