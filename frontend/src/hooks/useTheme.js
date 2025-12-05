import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('tl_theme') || 'light';
  });

  const [compactLayout, setCompactLayoutState] = useState(() => {
    return localStorage.getItem('tl_compact') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('bg-slate-950', 'text-slate-100');
      document.body.classList.remove('bg-gray-50', 'text-gray-900');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('bg-slate-950', 'text-slate-100');
      document.body.classList.add('bg-gray-50', 'text-gray-900');
    }
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem('tl_theme') || 'light';
      setThemeState(newTheme);
    };

    const handleLayoutChange = () => {
      const newLayout = localStorage.getItem('tl_compact') === 'true';
      setCompactLayoutState(newLayout);
    };

    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('layoutChange', handleLayoutChange);

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('layoutChange', handleLayoutChange);
    };
  }, []);

  const isDark = theme === 'dark';

  return {
    theme,
    isDark,
    compactLayout,
  };
}