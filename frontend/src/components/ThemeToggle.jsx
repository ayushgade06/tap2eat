import { useState, useCallback, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tap2eat-theme");
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    return "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tap2eat-theme", theme);
  }, [theme]);

  const handleToggle = useCallback((e) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    const shouldUseNativeTransition =
      typeof document.startViewTransition === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!shouldUseNativeTransition) {
      setTheme(nextTheme);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    root.classList.add("theme-switching");

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 520,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)"
        }
      );
    }).catch(() => {
      setTheme(nextTheme);
    });

    transition.finished.finally(() => {
      root.classList.remove("theme-switching");
    });
  }, [theme]);

  return (
    <button
      className="theme-toggle-btn"
      onClick={handleToggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span className="theme-toggle-icon">
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  );
}
