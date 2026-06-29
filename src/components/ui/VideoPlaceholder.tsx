"use client";

interface VideoPlaceholderProps {
  label: string;
  aspectRatio?: "9/16" | "16/9" | "1/1" | "4/3";
  duration?: string;
  className?: string;
  style?: React.CSSProperties;
  src?: string; // si fourni → vraie vidéo (lazy), sinon placeholder
  poster?: string;
}

export function VideoPlaceholder({
  label,
  aspectRatio = "9/16",
  duration,
  className,
  style,
  src,
  poster,
}: VideoPlaceholderProps) {
  const paddingMap: Record<string, string> = {
    "9/16": "177.78%",
    "16/9": "56.25%",
    "1/1": "100%",
    "4/3": "75%",
  };

  // ── Vraie vidéo (lazy : preload=none, muted/loop/inline) ──
  if (src) {
    return (
      <div
        className={className}
        style={{
          position: "relative",
          paddingBottom: paddingMap[aspectRatio],
          background: "#15100B",
          borderRadius: "var(--r-lg)",
          overflow: "hidden",
          ...style,
        }}
      >
        <video
          src={src}
          poster={poster}
          preload="metadata"
          autoPlay
          muted
          loop
          playsInline
          aria-label={label}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
        />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: "relative",
        paddingBottom: paddingMap[aspectRatio],
        background: "repeating-linear-gradient(45deg, #1a1208 0px, #1a1208 10px, #1f160a 10px, #1f160a 20px)",
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
        border: "1.5px dashed rgba(200,144,30,0.45)",
        ...style,
      }}
    >
      {/* Play icon */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "2px solid rgba(200,144,30,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <polygon points="6,3 17,10 6,17" fill="rgba(200,144,30,0.7)" />
          </svg>
        </div>

        {/* Label */}
        <div style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.65rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(200,144,30,0.8)",
          textAlign: "center",
          padding: "0 12px",
          lineHeight: 1.5,
        }}>
          {label}
        </div>

        {duration && (
          <div style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.58rem",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.06em",
          }}>
            {duration}
          </div>
        )}
      </div>

      {/* Dev badge — top-left */}
      <div style={{
        position: "absolute",
        top: 8,
        left: 8,
        background: "rgba(200,144,30,0.15)",
        border: "1px solid rgba(200,144,30,0.35)",
        borderRadius: 4,
        padding: "2px 7px",
        fontFamily: "monospace",
        fontSize: "0.58rem",
        color: "rgba(200,144,30,0.75)",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}>
        VIDEO {aspectRatio}
      </div>
    </div>
  );
}
