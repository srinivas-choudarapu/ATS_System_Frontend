import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => {
		const cached = localStorage.getItem("ats_user");
		return cached ? JSON.parse(cached) : null;
	});
	const isAuthenticated = !!user;

	useEffect(() => {
		if (user) {
			localStorage.setItem("ats_user", JSON.stringify(user));
		} else {
			localStorage.removeItem("ats_user");
		}
	}, [user]);

	const value = useMemo(() => ({ user, setUser, isAuthenticated }), [user, isAuthenticated]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
