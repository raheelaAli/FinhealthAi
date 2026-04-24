// src/components/logo.tsx
// FinHealth AI Logo — uses the actual uploaded logo image with SVG fallback

import Image from "next/image";

interface LogoProps {
  size?:      "sm" | "md" | "lg" | "xl";
  showText?:  boolean;
  textClass?: string;
  variant?:   "light" | "dark";
  className?: string;
}

const sizes = {
  sm: { img: 24,  text: "text-sm",   gap: "gap-2"   },
  md: { img: 32,  text: "text-base", gap: "gap-2.5" },
  lg: { img: 48,  text: "text-xl",   gap: "gap-3"   },
  xl: { img: 64,  text: "text-2xl",  gap: "gap-4"   },
};

export function Logo({
  size = "md",
  showText = true,
  textClass,
  variant = "light",
  className = "",
}: LogoProps) {
  const s      = sizes[size];
  const isDark = variant === "dark";

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Logo image — uses the uploaded FinHealth logo */}
      <div className="relative shrink-0" style={{ width: s.img, height: s.img }}>
        <Image
          src="/logo.png"
          alt="FinHealth AI logo — shield with heart and growth chart"
          width={s.img}
          height={s.img}
          className="object-contain"
          priority
        />
      </div>

      {showText && (
        <span
          className={`font-bold leading-none ${s.text} ${
            textClass ?? (isDark ? "text-white" : "text-brand-800")
          }`}
        >
          Fin<span className={isDark ? "text-green-300" : "text-brand-600"}>Health</span>
          {" "}
          <span className={isDark ? "text-teal-300" : "text-teal-600"}>AI</span>
        </span>
      )}
    </div>
  );
}
