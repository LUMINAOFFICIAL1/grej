import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ShinyTextProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function ShinyText({ children, className = "", speed = 4 }: ShinyTextProps) {
  return (
    <motion.span
      className={`inline-block bg-gradient-to-r from-emerald-400 via-amber-200 to-emerald-400 bg-[length:250%_100%] bg-clip-text text-transparent font-medium ${className}`}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}
