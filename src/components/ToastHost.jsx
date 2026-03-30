import { useEffect, useRef, useState } from "react";

export default function ToastHost() {
	const [toasts, setToasts] = useState([]);
	const apiRef = useRef(null);
	useEffect(() => {
		apiRef.current = {
			push(toast) {
				const id = Math.random().toString(36).slice(2);
				const item = { id, ...toast };
				setToasts((t) => [...t, item]);
				setTimeout(() => {
					setToasts((t) => t.filter((x) => x.id !== id));
				}, toast.duration ?? 3000);
			}
		};
		window.__toast = apiRef.current;
	}, []);
	return (
		<div style={{ position: "fixed", top: 16, right: 16, display: "flex", flexDirection: "column", gap: 8, zIndex: 50 }}>
			{toasts.map((t) => (
				<div key={t.id} className="card" style={{ padding: "10px 12px", minWidth: 260, borderLeft: `4px solid ${t.type === "error" ? "var(--danger)" : "var(--success)"}` }}>
					<div style={{ fontWeight: 600, marginBottom: 4 }}>{t.title}</div>
					<div className="muted" style={{ fontSize: 13 }}>{t.description}</div>
				</div>
			))}
		</div>
	);
}
