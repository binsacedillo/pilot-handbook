"use client";

import { useState, useCallback } from "react";
import { useUploadThing } from "@/lib/uploadthing-helpers";
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { useDropzone } from "@uploadthing/react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  className?: string;
}

export function ImageUpload({ value, onChange, onRemove, className }: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || "");

  const { startUpload, routeConfig } = useUploadThing("aircraftImage", {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res && res[0]) {
        onChange(res[0].url);
      }
    },
    onUploadError: (error) => {
      setIsUploading(false);
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    },
    onUploadProgress: (p) => {
      // Progress handling could be added here
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
      if (acceptedFiles.length > 0) {
        setIsUploading(true);
        startUpload(acceptedFiles);
      }
    },
    [startUpload]
  );

  const fileTypes = routeConfig ? Object.keys(routeConfig) : [];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
    maxFiles: 1,
  });

  if (isUrlMode && !value) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-(--glass-border) bg-zinc-900/5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Link2 className="w-3 h-3" /> Manual Asset Link
            </span>
            <Button 
              type="button" 
              variant="ghost" 
              className="h-7 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600"
              onClick={() => setIsUrlMode(false)}
            >
              Back to Upload
            </Button>
          </div>
          <Input 
            placeholder="https://images.unsplash.com/photo-..."
            className="h-11 bg-zinc-900/5 dark:bg-white/5 border-(--glass-border) focus:border-blue-500/50 transition-all text-xs"
            value={manualUrl}
            onChange={(e) => {
              setManualUrl(e.target.value);
              onChange(e.target.value);
            }}
          />
          <p className="text-[8px] text-zinc-500 font-bold uppercase italic px-1">
            Ensure the link points directly to a valid image file.
          </p>
        </div>
      </div>
    );
  }

  if (value) {
    return (
      <div className={cn("relative group", className)}>
        <div className="relative aspect-video rounded-xl overflow-hidden border border-(--glass-border) bg-zinc-900/50 backdrop-blur-sm">
          {/* HUD Scanline Effect on Preview */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 opacity-20">
            <div className="w-full h-[1px] bg-blue-500/30 blur-[1px] animate-hud-scanline" />
          </div>
          
          <img src={value} alt="Uploaded aircraft" className="w-full h-full object-cover" />
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-30">
            <Button 
              type="button" 
              variant="destructive" 
              size="sm" 
              className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl"
              onClick={onRemove}
            >
              <X className="w-4 h-4 mr-2" /> Remove Image
            </Button>
          </div>
          
          <div className="absolute top-3 left-3 z-30 pointer-events-none">
            <span className="text-[8px] px-2 py-0.5 rounded-sm uppercase font-black tracking-widest bg-emerald-500/90 text-white shadow-lg flex items-center gap-1 border border-white/20">
              <CheckCircle2 className="w-2.5 h-2.5" /> [ SYSTEM_LINK_OK ]
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative aspect-video rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden",
        isDragActive 
          ? "border-blue-500 bg-blue-500/10 scale-[0.99] shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
          : "border-(--glass-border) hover:border-blue-500/50 bg-zinc-900/5 hover:bg-blue-500/5",
        isUploading && "pointer-events-none opacity-80",
        className
      )}
    >
      <input {...getInputProps()} />
      
      {/* Decorative Cockpit Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07] z-0">
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 py-8">
        {isUploading ? (
          <>
            <div className="relative">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <div className="absolute inset-0 blur-lg bg-blue-500/30 animate-pulse rounded-full" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500 animate-pulse">Uploading Telemetry...</p>
              <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1 italic">Initializing Image Buffer</p>
            </div>
          </>
        ) : (
          <>
            <div className={cn(
              "p-4 rounded-2xl bg-zinc-900/5 dark:bg-white/5 border border-(--glass-border) transition-all duration-500",
              isDragActive ? "scale-110 border-blue-500/50 bg-blue-500/5" : ""
            )}>
              {isDragActive ? (
                <ImageIcon className="w-10 h-10 text-blue-500 animate-bounce" />
              ) : (
                <Upload className="w-10 h-10 text-zinc-400 group-hover:text-blue-500 transition-colors" />
              )}
            </div>
            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                {isDragActive ? "Release to Pilot" : "Select Aircraft Visual"}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <p className="text-[9px] text-zinc-500 font-bold uppercase italic tracking-widest">
                  Drag & Drop
                </p>
                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                <button 
                  type="button"
                  className="text-[9px] text-blue-500 font-bold uppercase italic tracking-widest hover:text-blue-600 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUrlMode(true);
                  }}
                >
                  Or Use Remote URL
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ISO Status Annunciator (Bottom) */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center z-10">
        <div className={cn(
          "px-3 py-1 rounded-sm border text-[8px] font-black uppercase tracking-widest transition-all",
          isDragActive ? "bg-blue-600 text-white border-blue-400" : "bg-zinc-900/10 dark:bg-black/40 border-(--glass-border) text-zinc-500"
        )}>
          {isDragActive ? "[[ READY_FOR_TRANSFER ]]" : "[ STANDBY_MODE ]"}
        </div>
      </div>
    </div>
  );
}
