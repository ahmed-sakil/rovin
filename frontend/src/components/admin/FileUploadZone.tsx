import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface FileMetadata {
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  type: string;
  width?: number;
  height?: number;
  previewUrl: string;
  serverUrl?: string;
}

interface FileUploadZoneProps {
  onUploadSuccess: (url: string, metadata: FileMetadata) => void;
  label?: string;
  currentUrl?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onUploadSuccess,
  label = 'Upload Media Asset (Product Shot or Category Banner)',
  currentUrl,
}) => {
  const [selectedMeta, setSelectedMeta] = useState<FileMetadata | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid Asset Type', { description: 'Only image files (PNG, JPG, WEBP) are supported.' });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeFormatted = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

    // Measure dimensions using Image object
    const img = new Image();
    img.onload = () => {
      const meta: FileMetadata = {
        name: file.name,
        sizeBytes: file.size,
        sizeFormatted,
        type: file.type,
        width: img.naturalWidth,
        height: img.naturalHeight,
        previewUrl,
      };

      setSelectedMeta(meta);
      uploadToServer(file, meta);
    };

    img.onerror = () => {
      const meta: FileMetadata = {
        name: file.name,
        sizeBytes: file.size,
        sizeFormatted,
        type: file.type,
        previewUrl,
      };
      setSelectedMeta(meta);
      uploadToServer(file, meta);
    };

    img.src = previewUrl;
  };

  const uploadToServer = async (file: File, meta: FileMetadata) => {
    setUploading(true);
    const token = localStorage.getItem('rovin_token');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload/single', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Server upload failed');
      }

      const updatedMeta: FileMetadata = {
        ...meta,
        serverUrl: data.url,
      };

      setSelectedMeta(updatedMeta);
      onUploadSuccess(data.url, updatedMeta);
      toast.success('Media Calibration Complete', {
        description: `Uploaded: ${meta.name} (${meta.sizeFormatted} • ${meta.width || 0}×${meta.height || 0}px)`
      });
    } catch (err: any) {
      toast.error('Upload Error', { description: err.message || 'Could not upload file to server.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-mono text-machined-muted uppercase">
        {label}
      </label>

      {/* Dropzone Container */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-nitro-amber bg-carbon-elevated/70 shadow-nitro-sm'
            : 'border-fastener-border hover:border-nitro-amber/50 bg-carbon-slate/60 hover:bg-carbon-card'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        />

        <UploadCloud className="w-8 h-8 text-nitro-amber mx-auto mb-2 opacity-80" />
        <p className="font-orbitron text-xs font-bold text-machined-titanium uppercase">
          Drag & Drop or Click to Select File
        </p>
        <p className="text-[11px] text-machined-dim mt-1 font-mono">
          PNG, JPG, WEBP up to 10MB • WebP compression auto-applied
        </p>
      </div>

      {/* Selected File Telemetry & Live Metadata Display */}
      {selectedMeta && (
        <div className="bg-carbon-card border border-nitro-amber/40 rounded-lg p-4 shadow-chassis animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            {/* Thumbnail Preview */}
            <div className="w-20 h-20 rounded bg-carbon-slate border border-fastener-gunmetal overflow-hidden flex-shrink-0 flex items-center justify-center relative">
              <img
                src={selectedMeta.previewUrl}
                alt={selectedMeta.name}
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-pitch-obsidian/70 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-nitro-amber animate-spin" />
                </div>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="telemetry-tag border-nitro-amber/50 text-nitro-amber font-mono text-[10px]">
                  ASSET METADATA
                </span>
                {selectedMeta.serverUrl && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                    <CheckCircle className="w-3.5 h-3.5" /> SYNCED
                  </span>
                )}
              </div>

              <p className="text-xs font-bold text-machined-titanium truncate font-mono">
                {selectedMeta.name}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 font-mono text-[11px] text-machined-muted">
                <div>
                  <span className="text-machined-dim block text-[9px] uppercase">File Size</span>
                  <span className="text-machined-silver font-semibold">{selectedMeta.sizeFormatted}</span>
                </div>
                <div>
                  <span className="text-machined-dim block text-[9px] uppercase">Dimensions</span>
                  <span className="text-machined-silver font-semibold">
                    {selectedMeta.width ? `${selectedMeta.width} × ${selectedMeta.height} px` : 'Calculating...'}
                  </span>
                </div>
                <div>
                  <span className="text-machined-dim block text-[9px] uppercase">Format</span>
                  <span className="text-nitro-amber font-semibold uppercase">{selectedMeta.type.replace('image/', '')}</span>
                </div>
              </div>
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearSelection(); }}
              className="text-machined-dim hover:text-red-400 p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
