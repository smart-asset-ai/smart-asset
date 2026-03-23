// components/StarRating.tsx
// Half-star support, 0.5 increments, read-only and interactive modes

interface StarRatingProps {
  rating: number;        // 0.0 – 5.0
  reviewCount?: number;
  size?: number;         // px, default 18
  interactive?: boolean;
  onChange?: (val: number) => void;
  showCount?: boolean;
  compact?: boolean;
}

export default function StarRating({
  rating,
  reviewCount,
  size = 18,
  interactive = false,
  onChange,
  showCount = true,
  compact = false,
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const getStarFill = (starIndex: number): "full" | "half" | "empty" => {
    const diff = rating - starIndex + 1;
    if (diff >= 1) return "full";
    if (diff >= 0.5) return "half";
    return "empty";
  };

  const handleClick = (starIndex: number, half: boolean) => {
    if (!interactive || !onChange) return;
    const val = half ? starIndex - 0.5 : starIndex;
    onChange(val);
  };

  const goldColor = "#f59e0b";
  const emptyColor = "#d1d5db";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: compact ? "0.25rem" : "0.375rem" }}>
      <div style={{ display: "flex", gap: "1px" }}>
        {stars.map(i => {
          const fill = getStarFill(i);
          return (
            <div key={i} style={{ position: "relative", width: size, height: size, cursor: interactive ? "pointer" : "default", flexShrink: 0 }}>
              {/* Background star (empty) */}
              <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "absolute", top: 0, left: 0 }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={emptyColor} stroke={emptyColor} strokeWidth="0.5" />
              </svg>
              {/* Filled portion */}
              {fill !== "empty" && (
                <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "absolute", top: 0, left: 0 }}>
                  <defs>
                    <clipPath id={`clip-${i}`}>
                      <rect x="0" y="0" width={fill === "half" ? "12" : "24"} height="24" />
                    </clipPath>
                  </defs>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={goldColor} clipPath={`url(#clip-${i})`} />
                </svg>
              )}
              {/* Interactive hit areas */}
              {interactive && (
                <>
                  <div style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "100%" }}
                    onClick={() => handleClick(i, true)} />
                  <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "100%" }}
                    onClick={() => handleClick(i, false)} />
                </>
              )}
            </div>
          );
        })}
      </div>
      {!compact && (
        <span style={{ fontSize: size * 0.8, fontWeight: 700, color: "#374151" }}>
          {rating > 0 ? rating.toFixed(1) : "—"}
        </span>
      )}
      {showCount && reviewCount !== undefined && !compact && (
        <span style={{ fontSize: size * 0.75, color: "#9ca3af" }}>
          ({reviewCount}件)
        </span>
      )}
    </div>
  );
}
