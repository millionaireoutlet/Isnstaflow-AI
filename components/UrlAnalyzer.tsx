import React, { useState } from 'react';
import { Search, Download, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { extractPostInfo } from '../services/geminiService';
import { PostMetadata } from '../types';
import { Button } from './Button';
import { GLASS_PANEL, MOCK_THUMBNAIL } from '../constants';

export const UrlAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PostMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.includes('instagram.com/')) {
      setError("Please enter a valid Instagram URL");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await extractPostInfo(url);
      setData(result);
    } catch (err) {
      setError("Failed to analyze URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      // Fallback
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Input Section */}
      <div className={`p-6 rounded-2xl ${GLASS_PANEL} space-y-4`}>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
            Instagram Link Inspector
          </h2>
          <p className="text-gray-400 text-sm">
            Paste a link to extract captions, hashtags, and hidden metadata using Gemini AI.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            {!url && (
              <button 
                onClick={handlePaste}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-gray-300 transition-colors"
              >
                Paste
              </button>
            )}
          </div>
          <Button onClick={handleAnalyze} isLoading={loading} className="w-full sm:w-auto">
            Analyze
          </Button>
        </div>
        
        {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle size={16} />
                {error}
            </div>
        )}
      </div>

      {/* Results Section */}
      {data && (
        <div className={`p-6 rounded-2xl ${GLASS_PANEL} animate-fade-in`}>
            <div className="flex flex-col md:flex-row gap-6">
                {/* Visual Preview (Mock since we can't fetch real image due to CORS without backend) */}
                <div className="w-full md:w-1/3 space-y-3">
                    <div className="aspect-square rounded-xl overflow-hidden bg-black/50 border border-white/10 relative group">
                         <img 
                            src={data.thumbnailUrl || MOCK_THUMBNAIL} 
                            alt="Preview" 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/60 p-3 rounded-full backdrop-blur-sm">
                                <ExternalLink className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                    <Button 
                        variant="secondary" 
                        className="w-full text-sm"
                        onClick={() => window.open(url, '_blank')}
                    >
                        View Original Post
                    </Button>
                </div>

                {/* Metadata */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Author</p>
                            <p className="text-xl font-bold text-white">@{data.author || 'Unknown'}</p>
                        </div>
                        <Button variant="ghost" className="!p-2">
                           <Download size={20} />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">AI Summary</p>
                        <p className="text-gray-300 leading-relaxed text-sm">
                            {data.description || "No description available."}
                        </p>
                    </div>

                    {data.caption && (
                         <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Original Caption</p>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(data.caption || '')}
                                    className="text-pink-400 hover:text-pink-300 text-xs flex items-center gap-1"
                                >
                                    <Copy size={12} /> Copy
                                </button>
                            </div>
                            <div className="bg-black/30 p-3 rounded-lg border border-white/5 max-h-32 overflow-y-auto">
                                <p className="text-gray-300 text-xs font-mono">{data.caption}</p>
                            </div>
                        </div>
                    )}

                    {data.hashtags && data.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {data.hashtags.map((tag, i) => (
                                <span key={i} className="text-blue-400 text-xs bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
                                    {tag.startsWith('#') ? tag : `#${tag}`}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
                 <p className="text-xs text-gray-500">
                    <span className="text-yellow-500 font-bold">Note:</span> Direct video downloading is restricted by browser security policies. 
                    This tool uses Gemini Search Grounding to extract public metadata and insights.
                 </p>
            </div>
        </div>
      )}
    </div>
  );
};
