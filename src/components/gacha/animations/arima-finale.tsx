"use client";

import { motion } from "framer-motion";

export function ArimaFinaleAnimation() {
  return (
    <div className="relative h-48 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-gacha-premium/50 to-background p-4">
      <motion.div
        className="absolute inset-x-0 top-6 mx-auto h-1 w-3/4 bg-accent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        style={{ originX: 0 }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)" }}
      />
      <motion.div
        className="relative z-10 flex h-full items-center justify-center"
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className="rounded-full border border-accent/60 px-6 py-3 font-serif text-lg text-accent"
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          有馬記念フィナーレ
        </motion.div>
      </motion.div>
    </div>
  );
}
