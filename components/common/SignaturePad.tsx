"use client";

import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, Check, X } from "lucide-react";

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onCancel: () => void;
}

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigCanvas.current?.clear();
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("Please provide a signature first.");
      return;
    }
    const dataURL = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    if (dataURL) {
      onSave(dataURL);
    }
  };

  return (
    <Card className="p-4 space-y-4 bg-background border-2 border-primary/20 shadow-xl max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Instructor Signature</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-white dark:bg-slate-50 overflow-hidden">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: 400,
            height: 200,
            className: "signature-canvas w-full h-[200px]"
          }}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={clear} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Clear
        </Button>
        <Button size="sm" onClick={save} className="gap-2">
          <Check className="w-4 h-4" /> Save Signature
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        By signing here, the instructor verifies the accuracy of this flight log entry.
      </p>
    </Card>
  );
}
