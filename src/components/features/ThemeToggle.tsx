"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const d = document.documentElement;
    if (next) {
      d.classList.add("dark");
      d.classList.remove("light");
    } else {
      d.classList.remove("dark");
      d.classList.add("light");
    }
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button onClick={toggle}
      className="p-2 rounded-lg hover:bg-primary-light/50 text-text-muted transition-colors"
      title={dark ? "Light mode" : "Dark mode"}>
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
