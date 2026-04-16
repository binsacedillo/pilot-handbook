import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
  onConfirm: () => Promise<void> | void;
  /** Require user to type this text to confirm deletion (e.g., "DELETE") */
  requireConfirmText?: string;
  /** Custom label for the confirm button */
  confirmLabel?: string;
  /** Button variant for the confirm action */
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  /** Optional class for the title */
  titleClassName?: string;
}

export const DeleteDialog = React.forwardRef<HTMLDivElement, DeleteDialogProps>(
  (
    {
      open,
      onOpenChange,
      title,
      description,
      itemName,
      isLoading = false,
      onConfirm,
      requireConfirmText,
      confirmLabel = "Confirm Action",
      confirmVariant = "destructive",
      titleClassName,
    },
    ref
  ) => {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [confirmText, setConfirmText] = React.useState("");

    // Reset confirmation text when dialog opens/closes
    React.useEffect(() => {
      if (!open) {
        setConfirmText("");
      }
    }, [open]);

    const isConfirmTextValid = !requireConfirmText || confirmText === requireConfirmText;

    const handleDelete = async () => {
      try {
        setIsDeleting(true);
        await onConfirm();
        onOpenChange(false);
      } catch (error) {
        console.error("Action error:", error);
      } finally {
        setIsDeleting(false);
      }
    };

    const isDestructive = confirmVariant === "destructive";

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          ref={ref}
          className="sm:max-w-[425px] overflow-hidden bg-zinc-950/90 backdrop-blur-3xl border border-zinc-800 shadow-2xl p-0"
        >
          {/* Decorative Top Accent */}
          <div className={cn(
            "h-1 w-full",
            isDestructive ? "bg-gradient-to-r from-transparent via-rose-500 to-transparent" : "bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
          )} />

          <div className="p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg border",
                  isDestructive ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                )}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <DialogTitle className={cn(
                  "text-lg font-black tracking-tighter uppercase",
                  titleClassName || (isDestructive ? "text-rose-500" : "text-emerald-500")
                )}>
                  {title}
                </DialogTitle>
              </div>
            </DialogHeader>

            <DialogDescription className="py-2 mb-4 text-zinc-400 text-sm">
              {description}
              {itemName && (
                <span className="font-semibold text-zinc-200"> &quot;{itemName}&quot;</span>
              )}
              {itemName && <span>?</span>}
            </DialogDescription>

            {requireConfirmText && (
              <div className="space-y-3 pb-4">
                <Label htmlFor="confirm-text" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Type <span className="text-rose-500">{requireConfirmText}</span> to confirm authorization:
                </Label>
                <Input
                  id="confirm-text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={requireConfirmText}
                  className="font-mono text-center tracking-widest text-sm bg-zinc-900/50 border-zinc-800 focus:border-rose-500 transition-colors placeholder:text-zinc-700 h-11"
                  autoComplete="off"
                />
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-4 border-t border-zinc-800/50 pt-5 mt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isDeleting || isLoading}
                className="flex-1 bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 uppercase text-xs font-bold tracking-widest h-11"
              >
                Cancel
              </Button>
              <Button
                variant={confirmVariant}
                onClick={handleDelete}
                disabled={isDeleting || isLoading || !isConfirmTextValid}
                className={cn(
                  "flex-1 uppercase text-xs font-bold tracking-widest h-11 shadow-lg",
                  isDestructive && "bg-rose-600 hover:bg-rose-700 shadow-rose-900/20",
                  !isDestructive && "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20"
                )}
              >
                {isDeleting ? "Processing..." : confirmLabel}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

DeleteDialog.displayName = "DeleteDialog";
