// src/components/logo.tsx
// Shared FinHealth AI logo — use everywhere instead of the "F" letter placeholder

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  textClass?: string;
  /** "light" = emerald mark (default), "dark" = white mark on dark backgrounds */
  variant?: "light" | "dark";
}

const sizes = {
  sm: { wrap: "w-6 h-6",   text: "text-sm",   sub: "text-[10px]" },
  md: { wrap: "w-8 h-8",   text: "text-base",  sub: "text-xs"    },
  lg: { wrap: "w-14 h-14 rounded-2xl", text: "text-2xl", sub: "text-sm" },
};

export function Logo({ size = "md", showText = true, textClass, variant = "light" }: LogoProps) {
  const s      = sizes[size];
  const isDark = variant === "dark";
  const markBg = isDark
    ? "bg-white/10 border border-white/20"
    : "bg-emerald-600";

  return (
    <div className="flex items-center gap-2.5">
      {/* Mark */}
      <div
        className={`${s.wrap} ${markBg} rounded-xl flex items-center justify-center shrink-0`}
      >
        {/* Stylised FH monogram */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-[60%] h-[60%] text-white"
          aria-hidden="true"
        >
          {/* F stroke */}
          <path
            d="M4 4h7M4 4v16M4 12h5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* H stroke */}
          <path
            d="M13 4v16M13 12h7M20 4v16"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {showText && (
        <div>
          <p
            className={`font-bold leading-none ${s.text} ${
              textClass ?? (isDark ? "text-white" : "text-gray-900")
            }`}
          >
            FinHealth{" "}
            <span className={isDark ? "text-emerald-300" : "text-emerald-600"}>
              AI
            </span>
          </p>
          {size === "lg" && (
            <p
              className={`${s.sub} mt-1 ${
                isDark ? "text-emerald-300" : "text-emerald-600"
              }`}
            >
              Finance &amp; health advisor
            </p>
          )}
        </div>
      )}
    </div>
  );
}
