export default function LockedSection({ onLogin }) {
	return (
		<div className="card" style={{ padding: 20, position: "relative" }}>
			<div className="locked" aria-hidden="true">
				<div className="grid grid-2">
					<div className="stack">
						<div className="label">Detailed Suggestions</div>
						<div className="row muted">
							<span>• Tailored bullet improvements</span>
						</div>
						<div className="row muted">
							<span>• Formatting recommendations</span>
						</div>
						<div className="row muted">
							<span>• Impact verbs and quantified metrics</span>
						</div>
					</div>
					<div className="stack">
						<div className="label">Keyword Gaps</div>
						<div className="row muted">
							<span>• Missing hard skills</span>
						</div>
						<div className="row muted">
							<span>• Domain terminology</span>
						</div>
						<div className="row muted">
							<span>• Role-specific tools</span>
						</div>
					</div>
				</div>
			</div>
			<div className="locked-overlay">
				<div className="stack" style={{ alignItems: "center" }}>
					<div className="row" style={{ gap: 8 }}>
						<span style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>Unlock full insights</span>
						<span className="muted">Login to view and save history</span>
					</div>
					<button className="btn btn-primary" onClick={onLogin}>
						<span>Login to unlock</span>
					</button>
				</div>
			</div>
		</div>
	);
}
