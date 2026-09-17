import { motion } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  highlightWords?: string[];
  highlightClass?: string;
}

export function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.04,
  highlightWords = [],
  highlightClass = "text-gold font-semibold bg-gradient-to-r from-gold via-emerald-400 to-gold bg-clip-text text-transparent",
}: SplitTextProps) {
  const words = text.split(" ");

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.28em] ${className}`}>
      {words.map((word, wIdx) => {
        const isHighlight = highlightWords.some(
          (h) => h.toLowerCase() === word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
        );

        return (
          <motion.span
            key={`${word}-${wIdx}`}
            className={`inline-block overflow-hidden ${isHighlight ? highlightClass : ""}`}
            initial={{ opacity: 0, y: 24, rotateX: -45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              duration: 0.6,
              delay: delay + wIdx * stagger,
              ease: [0.215, 0.61, 0.355, 1.0],
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </span>
  );
}
