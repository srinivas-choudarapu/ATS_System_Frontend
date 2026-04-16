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
	const { isAuthenticated, user } = useAuth();
	const [authOpen, setAuthOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();



	const isActive = (path) => location.pathname === path;

	return (
		<header className="navbar">
			<div className="navbar-inner">
				{/* ── Logo ── */}
				<Link to="/" className="navbar-logo">
					<div className="navbar-logo-icon" style={{ background: "transparent", boxShadow: "none" }}>
						<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H14l5 5v12.5a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 19.5z" stroke="url(#brandGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(99,102,241,0.08)"/>
							<path d="M14 2v5h5M8 13l2 2 4-4" stroke="url(#brandGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							<defs>
								<linearGradient id="brandGrad" x1="4" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
									<stop stopColor="#6366f1" />
									<stop offset="1" stopColor="#06b6d4" />
								</linearGradient>
							</defs>
						</svg>
					</div>
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
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" y1="3" x2="12" y2="15" />
						</svg>
						<span className="hide-mobile-text">Upload</span>
					</Link>

					{isAuthenticated && (
						<Link
							to="/analysis"
							className={`nav-link${isActive("/analysis") ? " active" : ""}`}
						>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
							<span className="hide-mobile-text">Analysis</span>
						</Link>
					)}
					{isAuthenticated && (
						<Link
							to="/profile"
							title="View Profile"
							style={{
								width: 34,
								height: 34,
								borderRadius: "50%",
								background: "var(--gradient-primary)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#fff",
								fontWeight: 700,
								fontSize: 14,
								textDecoration: "none",
								boxShadow: isActive("/profile") ? "0 0 0 2px var(--bg), 0 0 0 4px var(--primary)" : "0 2px 8px rgba(0,0,0,0.2)",
								transition: "transform 0.2s, box-shadow 0.2s",
								marginLeft: 4,
								flexShrink: 0
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = "scale(1.05)";
								if (!isActive("/profile")) e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = "scale(1)";
								if (!isActive("/profile")) e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
							}}
						>
							{user?.email ? user.email.charAt(0).toUpperCase() : "U"}
						</Link>
					)}

					<div className="navbar-divider" />

					<ThemeToggle />

					{!isAuthenticated && (
						<button className="btn btn-primary btn-sm" onClick={() => setAuthOpen(true)}>
							Login / Signup
						</button>
					)}
				</nav>
			</div>

			{authOpen && <AuthDialog onClose={() => setAuthOpen(false)} />}
		</header>
	);
}
