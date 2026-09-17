import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  from = 0,
  to,
  duration = 1.5,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const [currentValue, setCurrentValue] = useState(from);

  useEffect(() => {
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      // Ease out quad
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const val = Math.floor(from + (to - from) * easedProgress);

      setCurrentValue(val);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [from, to, duration]);

  return (
    <span className={`font-mono font-bold tracking-tight ${className}`}>
      {prefix}
      {currentValue.toLocaleString()}
      {suffix}
    </span>
  );
}
