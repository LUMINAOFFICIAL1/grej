import { useEffect, useState } from "react";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  className?: string;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  characters?: string;
}

const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

export function DecryptedText({
  text,
  speed = 40,
  maxIterations = 10,
  className = "",
  sequential = false,
  characters = DEFAULT_CHARS,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let iteration = 0;

    const runDecryption = () => {
      interval = setInterval(() => {
        setDisplayText((prev) =>
          text
            .split("")
            .map((char, index) => {
              if (char === " ") return " ";
              if (sequential) {
                if (index < iteration / maxIterations) return text[index];
              } else {
                if (iteration >= maxIterations) return text[index];
              }
              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join("")
        );

        iteration += 1;
        if (iteration > (sequential ? text.length * maxIterations : maxIterations)) {
          clearInterval(interval);
          setDisplayText(text);
        }
      }, speed);
    };

    if (isHovered) {
      runDecryption();
    } else {
      setDisplayText(text);
    }

    return () => clearInterval(interval);
  }, [isHovered, text, speed, maxIterations, sequential, characters]);

  return (
    <span
      className={`inline-block font-mono cursor-pointer transition-colors ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayText}
    </span>
  );
}
