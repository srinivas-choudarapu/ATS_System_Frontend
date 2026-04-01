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
				window.__toast?.push({ type: "success", title: "Welcome back!", description: "You are now logged in." });
				onClose();
			} else if (mode === "signup") {
				await api.signup(email, password);
				window.__toast?.push({ type: "success", title: "Account created", description: "Check your email to confirm your account." });
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

	const titles = {
		login: "Welcome back",
		signup: "Create an account",
		forgot: "Reset password",
	};

	const subtitles = {
		login: "Sign in to your ATS Analyzer account",
		signup: "Start tracking your resume performance",
		forgot: "We'll send a temporary password to your email",
	};

	return (
		/* Backdrop */
		<div
			onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(0, 0, 0, 0.75)",
				backdropFilter: "blur(6px)",
				WebkitBackdropFilter: "blur(6px)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 1000,
				padding: 20,
			}}
		>
			{/* Modal Card */}
			<div
				style={{
					width: "100%",
					maxWidth: 440,
					background: "var(--bg-elevated)",
					border: "1px solid var(--border)",
					borderRadius: "var(--radius-lg)",
					boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15)",
					overflow: "hidden",
					animation: "fadeInUp 0.25s ease",
				}}
			>
				{/* Header */}
				<div style={{
					padding: "24px 28px 20px",
					borderBottom: "1px solid var(--border-subtle)",
					background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)",
					position: "relative",
				}}>
					{/* Close button */}
					<button
						onClick={onClose}
						style={{
							position: "absolute",
							top: 16,
							right: 16,
							background: "rgba(255,255,255,0.06)",
							border: "1px solid var(--border-subtle)",
							borderRadius: 8,
							width: 30,
							height: 30,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
							color: "var(--text-muted)",
							transition: "all 0.15s",
						}}
						onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--text)"; }}
						onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--text-muted)"; }}
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
							<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>

					{/* Logo icon */}
					<div style={{
						width: 44, height: 44,
						borderRadius: 12,
						background: "var(--gradient-primary)",
						display: "flex", alignItems: "center", justifyContent: "center",
						fontSize: 22, marginBottom: 14,
						boxShadow: "0 0 20px var(--primary-glow)",
					}}>⚡</div>

					<div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 4 }}>
						{titles[mode]}
					</div>
					<div style={{ fontSize: 13, color: "var(--text-muted)" }}>
						{subtitles[mode]}
					</div>
				</div>

				{/* Form Body */}
				<div style={{ padding: "24px 28px" }}>
					<form
						onSubmit={handleSubmit}
						style={{ display: "flex", flexDirection: "column", gap: 16 }}
					>
						{/* Email */}
						<div>
							<label
								htmlFor="auth-email"
								style={{
									display: "block",
									fontSize: 13,
									fontWeight: 600,
									color: "var(--text-secondary)",
									marginBottom: 6,
									letterSpacing: "0.2px",
								}}
							>
								Email address
							</label>
							<input
								id="auth-email"
								className="input"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								autoFocus
								autoComplete="email"
							/>
						</div>

						{/* Password (hidden for forgot mode) */}
						{mode !== "forgot" && (
							<div>
								<label
									htmlFor="auth-password"
									style={{
										display: "block",
										fontSize: 13,
										fontWeight: 600,
										color: "var(--text-secondary)",
										marginBottom: 6,
										letterSpacing: "0.2px",
									}}
								>
									Password
								</label>
								<input
									id="auth-password"
									className="input"
									type="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									autoComplete={mode === "login" ? "current-password" : "new-password"}
								/>
							</div>
						)}

						{/* Submit */}
						<button
							type="submit"
							className="btn btn-primary btn-block"
							disabled={loading}
							style={{ marginTop: 4, padding: "12px 20px", fontSize: 15 }}
						>
							{loading ? (
								<>
									<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
										style={{ animation: "spin 1s linear infinite" }}>
										<path d="M21 12a9 9 0 1 1-6.219-8.56" />
									</svg>
									Please wait...
								</>
							) : (
								<>
									{mode === "login" && "Sign in"}
									{mode === "signup" && "Create account"}
									{mode === "forgot" && "Send reset email"}
								</>
							)}
						</button>
					</form>
				</div>

				{/* Footer Links */}
				<div style={{
					padding: "16px 28px",
					borderTop: "1px solid var(--border-subtle)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					background: "rgba(0,0,0,0.15)",
				}}>
					<button
						className="btn btn-ghost btn-sm"
						onClick={() => setMode(mode === "login" ? "signup" : "login")}
						style={{ fontSize: 13, color: "var(--text-muted)" }}
					>
						{mode === "login" ? (
							<>Don't have an account? <span style={{ color: "var(--primary-light)", fontWeight: 600 }}>Sign up</span></>
						) : (
							<>Already have an account? <span style={{ color: "var(--primary-light)", fontWeight: 600 }}>Login</span></>
						)}
					</button>

					{mode === "login" && (
						<button
							className="btn btn-ghost btn-sm"
							onClick={() => setMode("forgot")}
							style={{ fontSize: 12, color: "var(--text-muted)" }}
						>
							Forgot password?
						</button>
					)}
					{mode === "forgot" && (
						<button
							className="btn btn-ghost btn-sm"
							onClick={() => setMode("login")}
							style={{ fontSize: 12, color: "var(--text-muted)" }}
						>
							← Back to login
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
