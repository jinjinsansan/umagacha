"use client";

import { motion } from "framer-motion";

export function G1RaceAnimation() {
  return (
    <div className="relative h-48 overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/80 via-background to-background p-4">
      <motion.div
        className="text-xs uppercase tracking-[0.5em] text-accent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
      >
        FANFARE
      </motion.div>
      <motion.div
        className="absolute bottom-6 left-0 h-2 w-full rounded-full bg-white/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 5 }}
        style={{ originX: 0 }}
      />
      <motion.div
        className="absolute bottom-8 left-4 flex gap-3"
        initial={{ x: 0 }}
        animate={{ x: "70%" }}
        transition={{ duration: 5, ease: "easeInOut" }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="h-8 w-12 rounded-xl bg-accent/80 shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.15 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
