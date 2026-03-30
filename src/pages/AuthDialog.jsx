import { useState } from "react";
import * as api from "../utils/api";
import { useAuth } from "../state/auth";

export default function AuthDialog({ onClose }) {
	const [mode, setMode] = useState("login"); // login | signup | forgot
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const { setUser } = useAuth();

	async function handleSubmit(e) {
		e?.preventDefault?.();
		try {
			setLoading(true);
			if (mode === "login") {
				const res = await api.login(email, password);
				setUser(res?.user ?? { email });
				window.__toast?.push({ type: "success", title: "Welcome", description: "Logged in." });
				onClose();
			} else if (mode === "signup") {
				await api.signup(email, password);
				window.__toast?.push({ type: "success", title: "Account created", description: "Check your email to confirm." });
				setMode("login");
			} else if (mode === "forgot") {
				await api.forgot(email);
				window.__toast?.push({ type: "success", title: "Email sent", description: "Check your inbox for a temporary password." });
				setMode("login");
			}
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Action failed", description: e.message });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
			<div className="card" style={{ width: 440, maxWidth: "90vw", padding: 20 }}>
				<div className="space-between" style={{ marginBottom: 8 }}>
					<strong style={{ color: "var(--primary)" }}>
						{mode === "login" ? "Login" : mode === "signup" ? "Create account" : "Reset password"}
					</strong>
					<button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
				</div>
				<form className="stack" onSubmit={handleSubmit}>
					<label className="label">Email</label>
					<input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
					{mode !== "forgot" && (
						<>
							<label className="label">Password</label>
							<input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
						</>
					)}
					<button className="btn btn-primary" type="submit" disabled={loading}>
						{loading ? "Please wait..." : (mode === "login" ? "Login" : mode === "signup" ? "Sign up" : "Send reset email")}
					</button>
				</form>
				<div className="divider" />
				<div className="row" style={{ justifyContent: "space-between" }}>
					<button className="btn btn-ghost btn-sm" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
						{mode === "login" ? "Create account" : "Have an account? Login"}
					</button>
					{mode !== "forgot" ? (
						<button className="btn btn-ghost btn-sm" onClick={() => setMode("forgot")}>Forgot password</button>
					) : (
						<button className="btn btn-ghost btn-sm" onClick={() => setMode("login")}>Back to login</button>
					)}
				</div>
			</div>
		</div>
	);
}
