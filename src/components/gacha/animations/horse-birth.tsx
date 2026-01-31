"use client";

import { motion } from "framer-motion";

export function HorseBirthAnimation() {
  return (
    <div className="relative h-48 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-gacha-epic/40 via-background to-background p-4">
      <motion.div
        className="absolute inset-0 bg-accent/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className="relative z-10 text-xs uppercase tracking-[0.4em] text-accent">
        BIRTH
      </div>
      <motion.div
        className="relative z-10 mt-6 h-24 w-full rounded-full border border-dashed border-accent/40"
        animate={{ scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20"
          animate={{ scale: [0.7, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </motion.div>
      <p className="relative z-10 mt-4 text-center text-sm text-text-muted">名馬の血統から新たな命が誕生</p>
    </div>
  );
}
