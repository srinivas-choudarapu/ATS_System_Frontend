import { useEffect, useRef, useState } from "react";

const ICONS = {
	success: (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
			<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
		</svg>
	),
	error: (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
		</svg>
	),
	info: (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
		</svg>
	),
};

const COLORS = {
	success: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", icon: "#10b981", bar: "#10b981" },
	error:   { bg: "rgba(244,63,94,0.12)",  border: "rgba(244,63,94,0.3)",  icon: "#f43f5e", bar: "#f43f5e" },
	info:    { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.3)", icon: "#6366f1", bar: "#6366f1" },
};

export default function ToastHost() {
	const [toasts, setToasts] = useState([]);
	const apiRef = useRef(null);

	useEffect(() => {
		apiRef.current = {
			push(toast) {
				const id = Math.random().toString(36).slice(2);
				setToasts((t) => [...t, { id, ...toast }]);
				setTimeout(() => {
					setToasts((t) => t.filter((x) => x.id !== id));
				}, toast.duration ?? 4000);
			},
		};
		window.__toast = apiRef.current;
	}, []);

	return (
		<div className="toast-container">
			{toasts.map((t) => {
				const c = COLORS[t.type] || COLORS.info;
				return (
					<div
						key={t.id}
						className="toast"
						style={{
							background: `linear-gradient(145deg, var(--bg-elevated), var(--bg-card))`,
							border: `1px solid ${c.border}`,
							boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${c.border}`,
							position: "relative",
							overflow: "hidden",
						}}
					>
						{/* color bar */}
						<div style={{
							position: "absolute", left: 0, top: 0, bottom: 0,
							width: 3, background: c.bar, borderRadius: "4px 0 0 4px"
						}} />

						{/* icon */}
						<div style={{
							width: 32, height: 32, borderRadius: 8, flexShrink: 0,
							background: c.bg,
							border: `1px solid ${c.border}`,
							display: "flex", alignItems: "center", justifyContent: "center",
							color: c.icon, marginLeft: 8
						}}>
							{ICONS[t.type] || ICONS.info}
						</div>

						{/* content */}
						<div style={{ flex: 1, minWidth: 0 }}>
							<div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>
								{t.title}
							</div>
							{t.description && (
								<div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
									{t.description}
								</div>
							)}
						</div>

						{/* dismiss */}
						<button
							onClick={() => setToasts((tt) => tt.filter((x) => x.id !== t.id))}
							style={{
								background: "none", border: "none", cursor: "pointer",
								color: "var(--text-muted)", padding: 4, borderRadius: 4,
								display: "flex", alignItems: "center", flexShrink: 0
							}}
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
								<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
							</svg>
						</button>
					</div>
				);
			})}
		</div>
	);
}
