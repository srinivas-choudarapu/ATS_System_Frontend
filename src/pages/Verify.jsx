import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Verify() {
	const location = useLocation();
	const [status, setStatus] = useState("verifying");
	const [message, setMessage] = useState("We are verifying your email...");

	useEffect(() => {
		// Supabase redirects to /verify#access_token=...&refresh_token=... on success
		// or /verify?error=...&error_description=... on error
		const hash = location.hash;
		const query = new URLSearchParams(location.search);
		
		if (query.get("error")) {
			setStatus("error");
			setMessage(query.get("error_description")?.replace(/\+/g, " ") || "Verification failed.");
		} else if (hash && hash.includes("access_token")) {
			setStatus("success");
			setMessage("Your email has been successfully verified! You can now log in to your account.");
		} else {
			// Fallback if accessed without auth hash
			setStatus("success");
			setMessage("If you clicked the verification link, your account is now ready.");
		}
	}, [location]);

	return (
		<div className="stack" style={{ gap: 28, alignItems: "center", paddingTop: 80 }}>
			<div className="card" style={{ maxWidth: 460, width: "100%", padding: "40px 32px", textAlign: "center" }}>
				{status === "verifying" && (
					<div className="animate-fade-up">
						<div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
						<h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>Verifying Email</h2>
						<p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>{message}</p>
					</div>
				)}
				
				{status === "success" && (
					<div className="animate-fade-up">
						<div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
						<h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>Account Verified!</h2>
						<p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>{message}</p>
						<Link to="/" className="btn btn-primary btn-block btn-lg" style={{ fontSize: 15 }}>
							Go to Homepage to Login
						</Link>
					</div>
				)}

				{status === "error" && (
					<div className="animate-fade-up">
						<div style={{ fontSize: 48, marginBottom: 20 }}>❌</div>
						<h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: "var(--rose-light)" }}>Verification Failed</h2>
						<p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>{message}</p>
						<Link to="/" className="btn btn-secondary btn-block btn-lg" style={{ fontSize: 15 }}>
							Return to Homepage
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
