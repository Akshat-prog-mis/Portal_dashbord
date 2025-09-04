'use client'
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="fixed top-4 right-4 p-2 bg-gray-200 dark:bg-gray-800 rounded"
    >
      {isDarkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
    </button>
  );
}