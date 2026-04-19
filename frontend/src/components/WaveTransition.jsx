import { useEffect, useRef } from "react";

export default function WaveTransition({ x, y, targetTheme, onComplete }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.setProperty("--wave-x", `${x}%`);
    el.style.setProperty("--wave-y", `${y}%`);

    requestAnimationFrame(() => {
      el.classList.add("wave-animate");
    });

    const handleEnd = () => {
      if (onComplete) onComplete();
    };

    el.addEventListener("animationend", handleEnd);
    return () => el.removeEventListener("animationend", handleEnd);
  }, [x, y, onComplete]);

  return (
    <div
      ref={ref}
      className={`wave-transition-overlay wave-${targetTheme}`}
    />
  );
}
