import React, { useState, useRef } from 'react';
import { Upload, FileVideo, Sparkles, Hash, Copy, Check } from 'lucide-react';
import { analyzeUploadedMedia } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { Button } from './Button';
import { GLASS_PANEL } from '../constants';

export const MediaAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null); // Reset results on new file
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await analyzeUploadedMedia(file);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze media. Please try a smaller file or image.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      
      {/* Upload Zone */}
      <div 
        className={`p-8 rounded-2xl ${GLASS_PANEL} border-dashed border-2 border-white/20 flex flex-col items-center justify-center text-center space-y-4 hover:border-pink-500/50 transition-colors cursor-pointer group`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,video/mp4,video/quicktime"
        />
        
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            {file ? <FileVideo className="text-white w-8 h-8" /> : <Upload className="text-white w-8 h-8" />}
        </div>
        
        <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">
                {file ? file.name : "Upload Media to Analyze"}
            </h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
                {file 
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.type}` 
                  : "Drag & drop or click to upload MP4, JPG, PNG. AI will generate captions and hashtags."
                }
            </p>
        </div>

        {file && !result && (
            <Button 
                onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} 
                isLoading={loading}
                className="mt-4"
                icon={<Sparkles size={18} />}
            >
                Generate Insights
            </Button>
        )}
      </div>

      {/* Analysis Results */}
      {result && (
        <div className={`space-y-6 animate-fade-in`}>
             <div className={`p-6 rounded-2xl ${GLASS_PANEL}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-yellow-400" size={20} />
                    <h3 className="text-lg font-bold text-white">AI Analysis</h3>
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full border ${
                        result.sentiment === 'Positive' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        result.sentiment === 'Negative' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                        {result.sentiment} Sentiment
                    </span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                    {result.summary}
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Viral Hashtags */}
                 <div className={`p-6 rounded-2xl ${GLASS_PANEL}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Hash className="text-pink-400" size={20} />
                            <h3 className="text-lg font-bold text-white">Viral Hashtags</h3>
                        </div>
                        <button 
                            onClick={() => copyToClipboard(result.suggestedHashtags.join(' '), 'hashtags')}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            {copied === 'hashtags' ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {result.suggestedHashtags.map((tag, i) => (
                            <span key={i} className="text-sm text-pink-300 bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/20">
                                {tag}
                            </span>
                        ))}
                    </div>
                 </div>

                 {/* Content Ideas */}
                 <div className={`p-6 rounded-2xl ${GLASS_PANEL}`}>
                    <h3 className="text-lg font-bold text-white mb-4">Content Ideas</h3>
                    <ul className="space-y-3">
                        {result.contentIdeas.map((idea, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-300">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs border border-purple-500/30">
                                    {i + 1}
                                </span>
                                {idea}
                            </li>
                        ))}
                    </ul>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};
