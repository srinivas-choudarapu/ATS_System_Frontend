import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import * as api from "../utils/api";
import { useState } from "react";
import AuthDialog from "../pages/AuthDialog";

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
			// ignore toast host will handle
		}
	}

	return (
		<header className="card" style={{ borderRadius: 0 }}>
			<div className="main-container" style={{ padding: "14px 20px" }}>
				<div className="space-between">
					<Link to="/" className="row" style={{ textDecoration: "none" }}>
						<div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--primary)" }} />
						<div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
							<strong style={{ color: "var(--primary)" }}>ATS Analyzer</strong>
							<span className="muted" style={{ fontSize: 12 }}>Resume Insights</span>
						</div>
					</Link>
					<nav className="row">
						<Link to="/upload" className="btn btn-ghost btn-sm">Analyze</Link>
						{isAuthenticated && <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>}
						{isAuthenticated && <Link to="/profile" className="btn btn-ghost btn-sm">Profile</Link>}
						{!isAuthenticated ? (
							<button className="btn btn-primary btn-sm" onClick={() => setAuthOpen(true)}>Login / Signup</button>
						) : (
							<button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
						)}
					</nav>
				</div>
			</div>
			{authOpen && <AuthDialog onClose={() => setAuthOpen(false)} />}
		</header>
	);
}
