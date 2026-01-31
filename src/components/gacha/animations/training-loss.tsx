"use client";

import { motion } from "framer-motion";

export function TrainingLossAnimation() {
  return (
    <div className="relative h-48 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-gacha-free/30 to-background p-4">
      <div className="text-xs uppercase tracking-[0.4em] text-text-muted">STABLE</div>
      <motion.div
        className="absolute inset-x-6 bottom-6 flex items-end justify-between"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      >
        <motion.div
          className="h-16 w-14 rounded-2xl bg-white/15"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <motion.div
          className="h-12 w-12 rounded-2xl bg-white/8"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
        <motion.div
          className="h-20 w-14 rounded-2xl bg-white/15"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, delay: 0.2 }}
        />
      </motion.div>
      <p className="absolute bottom-3 w-full text-center text-sm text-text-muted">敗北... 再挑戦へ</p>
    </div>
  );
}
