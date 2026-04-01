import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useTheme } from "../state/theme";
import * as api from "../utils/api";
import { useState } from "react";
import AuthDialog from "../pages/AuthDialog";

/* ── Animated Moon/Sun toggle ── */
function ThemeToggle() {
	const { theme, toggle } = useTheme();
	const isDark = theme === "dark";

	return (
		<button
			onClick={toggle}
			title={isDark ? "Switch to light mode" : "Switch to dark mode"}
			style={{
				position: "relative",
				width: 52,
				height: 28,
				borderRadius: 100,
				border: "1px solid var(--border)",
				background: isDark
					? "rgba(99,102,241,0.15)"
					: "rgba(245,158,11,0.12)",
				cursor: "pointer",
				padding: 0,
				flexShrink: 0,
				transition: "background 0.3s ease, border-color 0.3s ease",
				display: "flex",
				alignItems: "center",
				overflow: "hidden",
			}}
		>
			{/* Track icons */}
			<span style={{
				position: "absolute",
				left: 5,
				fontSize: 11,
				opacity: isDark ? 0.5 : 0,
				transition: "opacity 0.3s ease",
			}}>🌙</span>
			<span style={{
				position: "absolute",
				right: 5,
				fontSize: 11,
				opacity: isDark ? 0 : 0.7,
				transition: "opacity 0.3s ease",
			}}>☀️</span>

			{/* Knob */}
			<span style={{
				position: "absolute",
				top: 3,
				left: isDark ? 3 : 25,
				width: 20,
				height: 20,
				borderRadius: "50%",
				background: isDark
					? "linear-gradient(135deg, #818cf8, #6366f1)"
					: "linear-gradient(135deg, #fbbf24, #f59e0b)",
				boxShadow: isDark
					? "0 0 8px rgba(99,102,241,0.6)"
					: "0 0 8px rgba(245,158,11,0.5)",
				transition: "left 0.25s cubic-bezier(0.4,0,0.2,1), background 0.3s ease, box-shadow 0.3s ease",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: 10,
			}}>
				{isDark ? "🌙" : "☀️"}
			</span>
		</button>
	);
}

export default function Navbar() {
	const { isAuthenticated, user, setUser } = useAuth();
	const [authOpen, setAuthOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	async function handleLogout() {
		try {
			await api.logout();
			setUser(null);
			if (location.pathname !== "/") navigate("/");
		} catch (e) {
			// handled by toast
		}
	}

	const isActive = (path) => location.pathname === path;

	return (
		<header className="navbar">
			<div className="navbar-inner">
				{/* ── Logo ── */}
				<Link to="/" className="navbar-logo">
					<div className="navbar-logo-icon">⚡</div>
					<div className="navbar-logo-text">
						<strong>ATS Analyzer</strong>
						<span>Resume Intelligence</span>
					</div>
				</Link>

				{/* ── Nav Links ── */}
				<nav className="navbar-nav">
					<Link
						to="/upload"
						className={`nav-link${isActive("/upload") ? " active" : ""}`}
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
							<polyline points="17 8 12 3 7 8"/>
							<line x1="12" y1="3" x2="12" y2="15"/>
						</svg>
						Analyze
					</Link>

					{isAuthenticated && (
						<Link
							to="/dashboard"
							className={`nav-link${isActive("/dashboard") ? " active" : ""}`}
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
								<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
								<rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
							</svg>
							Dashboard
						</Link>
					)}

					{isAuthenticated && (
						<Link
							to="/profile"
							className={`nav-link${isActive("/profile") ? " active" : ""}`}
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
								<circle cx="12" cy="7" r="4"/>
							</svg>
							Profile
						</Link>
					)}

					{/* ── Separator ── */}
					<div style={{ width: 1, height: 20, background: "var(--border-subtle)", margin: "0 6px" }} />

					{/* ── Theme Toggle ── */}
					<ThemeToggle />

					{/* ── Separator ── */}
					<div style={{ width: 1, height: 20, background: "var(--border-subtle)", margin: "0 6px" }} />

					{/* ── Auth ── */}
					{!isAuthenticated ? (
						<button className="btn btn-primary btn-sm" onClick={() => setAuthOpen(true)}>
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
								<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
								<polyline points="10 17 15 12 10 7"/>
								<line x1="15" y1="12" x2="3" y2="12"/>
							</svg>
							Login / Sign Up
						</button>
					) : (
						<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
							<div style={{
								width: 32,
								height: 32,
								borderRadius: "50%",
								background: "var(--gradient-primary)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 13,
								fontWeight: 700,
								color: "white",
								flexShrink: 0,
								boxShadow: "0 0 12px var(--primary-glow)",
							}}>
								{user?.email?.[0]?.toUpperCase() || "U"}
							</div>
							<button className="btn btn-ghost btn-sm" onClick={handleLogout}
								style={{ color: "var(--text-muted)", fontSize: 13 }}>
								Logout
							</button>
						</div>
					)}
				</nav>
			</div>

			{authOpen && <AuthDialog onClose={() => setAuthOpen(false)} />}
		</header>
	);
}
