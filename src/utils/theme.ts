export const initSysTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    document.documentElement.style.setProperty("color-scheme", "dark");
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.style.setProperty("color-scheme", "light");
    document.documentElement.setAttribute("data-theme", "light");
  }
};
