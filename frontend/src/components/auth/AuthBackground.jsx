import { useMemo } from "react";

const EMOJIS = [
  "🛒", "🛍️", "💳", "🏷️", "📦", "🎁", "💰", "🛒", "🛍️", "💳",
  "🏷️", "📦", "🎁", "💰", "🛒", "🛍️", "💳", "🏷️", "📦", "🎁",
  "💰", "🛒", "🛍️", "💳", "🏷️", "📦", "🎁", "💰", "🛒", "🛍️",
  "💳", "🏷️", "📦", "🎁", "💰",
];

const rand = (min, max) => Math.random() * (max - min) + min;

const AuthBackground = () => {
  const items = useMemo(() => {
    return EMOJIS.map((emoji, index) => ({
      emoji,
      key: index,
      top: rand(0, 100),
      left: rand(0, 100),
      size: rand(1.3, 3.2),
      twinkleDuration: rand(2.5, 6),
      bobDuration: rand(3, 8),
      twinkleDelay: rand(0, 5),
      bobDelay: rand(0, 5),
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-custom-gradient2">
      {items.map((it) => (
        <span
          key={it.key}
          className="novu-star-emoji"
          style={{
            top: `${it.top}%`,
            left: `${it.left}%`,
            fontSize: `${it.size}rem`,
            animationDuration: `${it.twinkleDuration}s, ${it.bobDuration}s`,
            animationDelay: `${it.twinkleDelay}s, ${it.bobDelay}s`,
          }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  );
};

export default AuthBackground;
