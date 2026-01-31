"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative mx-4 w-full max-w-md rounded-3xl border border-border bg-background/95 p-6 text-text shadow-[0_25px_60px_rgba(0,0,0,0.65)]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
          >
            {(title || onClose) && (
              <div className="mb-4 flex items-center justify-between">
                <p className="font-serif text-xl font-semibold">{title}</p>
                {onClose && (
                  <button
                    aria-label="閉じる"
                    className="rounded-full border border-border/80 p-2 text-text hover:border-accent/60 hover:text-accent"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
