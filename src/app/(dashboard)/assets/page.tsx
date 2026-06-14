'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  HardDrive,
  Upload,
  Search,
  FileText,
  FileImage,
  Video,
  Download,
  Trash2,
  Tag,
  AlertCircle
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'doc';
  size: string;
  tag: string;
  uploadedAt: string;
}

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: 'asset-1',
      name: 'brandavox_logo_vector.svg',
      type: 'image',
      size: '24 KB',
      tag: 'Identity',
      uploadedAt: '2026-06-11'
    },
    {
      id: 'asset-2',
      name: 'launch_video_promo_draft.mp4',
      type: 'video',
      size: '18.4 MB',
      tag: 'Campaign',
      uploadedAt: '2026-06-10'
    },
    {
      id: 'asset-3',
      name: 'terms_of_service_draft.pdf',
      type: 'pdf',
      size: '124 KB',
      tag: 'Legal',
      uploadedAt: '2026-06-09'
    },
    {
      id: 'asset-4',
      name: 'positioning_briefing.docx',
      type: 'doc',
      size: '48 KB',
      tag: 'Strategy',
      uploadedAt: '2026-06-08'
    }
  ]);

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpload = () => {
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name: `user_upload_asset_${Math.floor(Math.random() * 1000)}.png`,
      type: 'image',
      size: '412 KB',
      tag: 'Marketing',
      uploadedAt: new Date().toISOString().substring(0, 10)
    };
    setAssets((prev) => [newAsset, ...prev]);
    alert('Mock file uploaded successfully to AWS S3 storage.');
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || asset.tag.toLowerCase() === selectedTag.toLowerCase();
    return matchesSearch && matchesTag;
  });

  const renderIcon = (type: string) => {
    if (type === 'image') return <FileImage className="w-8 h-8 text-accent shrink-0" />;
    if (type === 'video') return <Video className="w-8 h-8 text-blue-400 shrink-0" />;
    return <FileText className="w-8 h-8 text-zinc-500 shrink-0" />;
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader
          title="File & Asset Vault"
          description="Access organization cloud drives. Catalog, search, and audit media content deliverables isolated by client accounts."
        />

        <button
          onClick={handleUpload}
          className="self-start sm:self-center bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider py-2 px-4 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Storage stats header bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border-custom p-4 rounded-card flex items-center gap-3">
          <HardDrive className="w-8 h-8 text-accent shrink-0" />
          <div>
            <span className="text-[9px] text-text-muted font-mono block uppercase">Drive Storage Capacity</span>
            <span className="text-sm font-bold text-text-primary">18.6 MB / 10.0 GB</span>
          </div>
        </div>

        <div className="bg-surface border border-border-custom p-4 rounded-card flex items-center gap-3">
          <Tag className="w-8 h-8 text-zinc-500 shrink-0" />
          <div>
            <span className="text-[9px] text-text-muted font-mono block uppercase">Total Document Assets</span>
            <span className="text-sm font-bold text-text-primary">{assets.length} Files cataloged</span>
          </div>
        </div>

        <div className="bg-surface border border-border-custom p-4 rounded-card flex items-center gap-3">
          <Upload className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[9px] text-text-muted font-mono block uppercase">Active Sync Status</span>
            <span className="text-sm font-bold text-text-primary uppercase">AWS S3 NOMINAL</span>
          </div>
        </div>
      </div>

      {/* Filter controls row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface border border-border-custom p-4 rounded-card">
        {/* Search */}
        <div className="relative w-full sm:w-80 flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm"
            placeholder="Search filenames..."
          />
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'identity', 'campaign', 'strategy', 'legal'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`py-1.5 px-3 border font-mono text-[9px] uppercase rounded-sm cursor-pointer transition-colors ${
                selectedTag === t
                  ? 'border-accent text-accent bg-accent/5 font-bold'
                  : 'border-border-custom text-text-muted hover:text-text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-surface border border-border-custom rounded-card p-5 space-y-4 hover:border-accent/40 transition-colors flex flex-col justify-between"
          >
            {/* Header info */}
            <div className="flex items-start gap-3">
              {renderIcon(asset.type)}
              <div className="min-w-0 space-y-1">
                <span className="font-sans font-bold text-xs text-text-primary block truncate" title={asset.name}>
                  {asset.name}
                </span>
                <span className="font-mono text-[9px] text-text-muted uppercase">Size: {asset.size}</span>
              </div>
            </div>

            {/* Tags and upload date */}
            <div className="flex justify-between items-center border-t border-border-custom/40 pt-3">
              <span className="font-mono text-[9px] bg-background border border-border-custom/50 px-2 py-0.5 rounded text-text-muted font-semibold uppercase">
                {asset.tag}
              </span>
              <span className="font-mono text-[9px] text-zinc-500">{asset.uploadedAt}</span>
            </div>

            {/* Action options */}
            <div className="border-t border-border-custom/40 pt-3 flex items-center justify-between">
              <button
                onClick={() => alert(`Downloading file: ${asset.name}`)}
                className="py-1 px-2.5 bg-zinc-900 border border-border-custom hover:border-accent text-[9px] font-mono font-bold uppercase rounded-sm flex items-center gap-1 cursor-pointer transition-all"
              >
                <Download className="w-3 h-3" />
                <span>Fetch</span>
              </button>

              <button
                onClick={() => handleDelete(asset.id)}
                className="p-1 text-red-400 hover:text-red-500 cursor-pointer"
                title="Remove Asset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
