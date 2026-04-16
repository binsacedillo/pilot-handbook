"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle2, PenTool } from "lucide-react";
import SignaturePad from "@/components/common/SignaturePad";

interface InstructorVerificationProps {
  instructorName: string;
  signatureData: string | null;
  onInstructorNameChange: (value: string) => void;
  onSignatureChange: (data: string | null) => void;
}

export function InstructorVerification({
  instructorName,
  signatureData,
  onInstructorNameChange,
  onSignatureChange,
}: InstructorVerificationProps) {
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  return (
    <div className="border-t border-zinc-800/50 pt-6 mt-4 space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2 border-l-2 border-emerald-500 pl-2">
        <ShieldCheck className="w-4 h-4" /> Instructor Verification (Optional)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="instructorName" className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Instructor Name</Label>
          <Input
            id="instructorName"
            placeholder="e.g. T. Maverick"
            value={instructorName}
            onChange={(e) => onInstructorNameChange(e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 focus:border-emerald-500 text-emerald-400 font-mono text-sm h-11 placeholder:text-zinc-700"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          {signatureData ? (
            <div className="flex items-center gap-3 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 h-11">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Digital Signature Attached</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-[9px] font-bold uppercase tracking-widest ml-auto h-7 text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/20"
                onClick={() => onSignatureChange(null)}
              >
                Clear
              </Button>
            </div>
          ) : (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowSignaturePad(true)}
              className="w-full h-11 bg-transparent border-dashed border-zinc-700 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-[10px] font-black uppercase tracking-widest transition-colors duration-300"
            >
              <PenTool className="w-3.5 h-3.5 mr-2" />
              Authorize via Signature
            </Button>
          )}
        </div>
      </div>

      {showSignaturePad && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <SignaturePad 
            onSave={(data) => {
              onSignatureChange(data);
              setShowSignaturePad(false);
            }} 
            onCancel={() => setShowSignaturePad(false)} 
          />
        </div>
      )}
    </div>
  );
}
