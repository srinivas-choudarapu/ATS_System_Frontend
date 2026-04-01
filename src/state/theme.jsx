import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(() => {
		// Persist preference in localStorage, default to dark
		return localStorage.getItem("ats_theme") || "dark";
	});

	useEffect(() => {
		// Apply to <html> so CSS [data-theme] selectors work
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("ats_theme", theme);
	}, [theme]);

	function toggle() {
		setTheme((t) => (t === "dark" ? "light" : "dark"));
	}

	return (
		<ThemeContext.Provider value={{ theme, toggle }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
