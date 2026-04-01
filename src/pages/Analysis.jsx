import { useEffect, useRef, useState } from "react";
import * as api from "../utils/api";
import { isExpiredS3SignedUrl } from "../utils/s3Url";

/* ─── Strip the numeric timestamp prefix the backend prepends, e.g.
       "1775062184788-varshitha resume.pdf" → "varshitha resume.pdf" ─── */
function cleanName(raw) {
	if (!raw) return "resume.pdf";
	// Remove a leading block of digits followed by a hyphen
	return raw.replace(/^\d+-/, "");
}

/* ─── Score colour helper ─── */
function scoreColor(n) {
	if (n >= 75) return { bg: "#10b981", glow: "rgba(16,185,129,0.35)" };
	if (n >= 50) return { bg: "#f59e0b", glow: "rgba(245,158,11,0.35)" };
	return { bg: "#f43f5e", glow: "rgba(244,63,94,0.35)" };
}

/* ─── Mini circular score badge ─── */
function ScoreBadge({ score }) {
	const { bg } = scoreColor(score);
	return (
		<span style={{
			display: "inline-flex", alignItems: "center", justifyContent: "center",
			minWidth: 52, height: 28, borderRadius: 100,
			background: bg, color: "#fff",
			fontSize: 13, fontWeight: 700, letterSpacing: "-0.3px",
			flexShrink: 0,
			boxShadow: `0 0 12px ${scoreColor(score).glow}`,
		}}>
			{score}%
		</span>
	);
}

/* ─── Animated progress bar ─── */
function Bar({ value, color }) {
	return (
		<div style={{ height: 5, background: "var(--bg-elevated)", borderRadius: 100, overflow: "hidden" }}>
			<div style={{
				height: "100%", width: `${value}%`, borderRadius: 100,
				background: color, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
			}} />
		</div>
	);
}

/* ─── Score row inside detail panel ─── */
function ScoreRow({ label, value, color }) {
	return (
		<div style={{ marginBottom: 12 }}>
			<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
				<span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
				<span style={{ fontSize: 13, color, fontWeight: 700 }}>{value}%</span>
			</div>
			<Bar value={value} color={color} />
		</div>
	);
}

/* ─── Chip ─── */
function Chip({ children, variant = "default" }) {
	const styles = {
		default: { bg: "var(--bg-elevated)", color: "var(--text-secondary)", border: "var(--border-subtle)" },
		danger:  { bg: "rgba(244,63,94,0.12)", color: "#fb7185", border: "rgba(244,63,94,0.25)" },
		success: { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.25)" },
	}[variant];
	return (
		<span style={{
			display: "inline-block",
			padding: "4px 12px", borderRadius: 100,
			fontSize: 12, fontWeight: 500,
			background: styles.bg, color: styles.color,
			border: `1px solid ${styles.border}`,
		}}>
			{children}
		</span>
	);
}

/* ─── Analysis Detail Panel ─── */
function DetailPanel({ analysis, onClose, onPdf }) {
	const sc = scoreColor(analysis.score);
	const panelRef = useRef(null);

	// Close on Escape
	useEffect(() => {
		function onKey(e) { if (e.key === "Escape") onClose(); }
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		<div style={{
			position: "fixed", inset: 0, zIndex: 500,
			display: "flex", alignItems: "stretch",
		}}>
			{/* Scrim */}
			<div
				onClick={onClose}
				style={{
					position: "absolute", inset: 0,
					background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
					animation: "fadeIn 0.2s ease",
				}}
			/>

			{/* Slide-in panel from right */}
			<div
				ref={panelRef}
				style={{
					position: "absolute", top: 0, right: 0, bottom: 0,
					width: "min(560px, 96vw)",
					background: "var(--bg-card)",
					borderLeft: "1px solid var(--border)",
					display: "flex", flexDirection: "column",
					overflowY: "auto",
					animation: "slideInRight 0.28s cubic-bezier(0.4,0,0.2,1)",
					boxShadow: "-8px 0 48px rgba(0,0,0,0.5)",
				}}
			>
				{/* Panel header */}
				<div style={{
					padding: "20px 24px 16px",
					borderBottom: "1px solid var(--border-subtle)",
					background: `linear-gradient(135deg, ${sc.bg}18 0%, transparent 100%)`,
					display: "flex", alignItems: "center", gap: 12,
					position: "sticky", top: 0, zIndex: 10,
					backdropFilter: "blur(12px)",
				}}>
					<div style={{
						width: 40, height: 40, borderRadius: 12,
						background: sc.bg, display: "flex", alignItems: "center",
						justifyContent: "center", fontSize: 18, flexShrink: 0,
						boxShadow: `0 0 20px ${sc.glow}`,
					}}>📊</div>
					<div style={{ flex: 1, minWidth: 0 }}>
						<div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 2 }}>
							Analysis Details
						</div>
						<div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
							{cleanName(analysis.resume_name)}
						</div>
					</div>
					<button
						onClick={onClose}
						style={{
							width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-subtle)",
							background: "rgba(255,255,255,0.05)", cursor: "pointer", color: "var(--text-muted)",
							display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
							transition: "all 0.15s", fontSize: 14,
						}}
						onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,63,94,0.15)"; e.currentTarget.style.color = "#fb7185"; }}
						onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-muted)"; }}
						title="Close (Esc)"
					>
						✕
					</button>
				</div>

				{/* Panel body */}
				<div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>

					{/* Overall score hero */}
					<div style={{
						background: `linear-gradient(135deg, ${sc.bg} 0%, ${sc.bg}cc 100%)`,
						borderRadius: 16, padding: "24px 28px",
						display: "flex", alignItems: "center", gap: 20,
						boxShadow: `0 8px 32px ${sc.glow}`,
					}}>
						<div style={{ fontSize: 52, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
							{analysis.score}<span style={{ fontSize: 24, fontWeight: 600, opacity: 0.8 }}>%</span>
						</div>
						<div>
							<div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Overall ATS Score</div>
							<div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
								{analysis.score >= 75 ? "Strong match — well done!" : analysis.score >= 50 ? "Moderate match — room to improve" : "Weak match — see suggestions below"}
							</div>
						</div>
					</div>

					{/* Score breakdown */}
					<div style={{ background: "var(--bg-elevated)", borderRadius: 14, padding: "18px 20px" }}>
						<div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16, letterSpacing: "0.3px", textTransform: "uppercase" }}>
							Score Breakdown
						</div>
						<ScoreRow label="Skills Match"       value={analysis.skill_score       ?? 0} color="#6366f1" />
						<ScoreRow label="Experience Match"   value={analysis.experience_score  ?? 0} color="#f093fb" />
						<ScoreRow label="Education Match"    value={analysis.education_score   ?? 0} color="#06b6d4" />
						<ScoreRow label="Keyword Relevance"  value={analysis.keyword_score     ?? 0} color="#f59e0b" />
						{analysis.project_score != null && (
							<ScoreRow label="Project Match"  value={analysis.project_score}          color="#10b981" />
						)}
					</div>

					{/* Missing skills */}
					{analysis.missing_skills?.length > 0 && (
						<div>
							<div style={{ fontSize: 13, fontWeight: 600, color: "#fb7185", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
								<span>⚠️</span> Missing Skills
							</div>
							<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
								{analysis.missing_skills.map((s, i) => <Chip key={i} variant="danger">{s}</Chip>)}
							</div>
						</div>
					)}

					{/* Suggestions */}
					{analysis.suggestions?.length > 0 && (
						<div>
							<div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary-light)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
								<span>💡</span> Improvement Suggestions
							</div>
							<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
								{analysis.suggestions.map((s, i) => (
									<div key={i} style={{
										background: "rgba(99,102,241,0.07)", borderRadius: 10,
										padding: "10px 14px", fontSize: 13, lineHeight: 1.65,
										color: "var(--text-secondary)", borderLeft: "3px solid var(--primary)",
									}}>
										{s}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Job description preview */}
					{analysis.jd_text && (
						<div>
							<div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
								<span>📋</span> Job Description
							</div>
							<div style={{
								background: "var(--bg-secondary)", borderRadius: 10, padding: "14px 16px",
								fontSize: 12, lineHeight: 1.7, color: "var(--text-muted)",
								whiteSpace: "pre-wrap", maxHeight: 260, overflowY: "auto",
								border: "1px solid var(--border-subtle)",
							}}>
								{analysis.jd_text}
							</div>
						</div>
					)}

					{/* Date */}
					<div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
						<span>🕒</span>
						{new Date(analysis.created_at).toLocaleString("en-US", {
							year: "numeric", month: "short", day: "numeric",
							hour: "2-digit", minute: "2-digit",
						})}
					</div>

					{/* Actions footer */}
					{analysis.resume_file_url && (
						<button
							className="btn btn-primary btn-block"
							onClick={() => onPdf(analysis)}
							style={{ marginTop: "auto" }}
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
							</svg>
							View Resume PDF
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

/* ─── Run Analysis Modal ─── */
function RunAnalysisModal({ resume, jd, setJd, loading, onRun, onClose }) {
	const filename = cleanName(resume?.file_url?.split("/").pop()) || "Resume";
	return (
		<div style={{
			position: "fixed", inset: 0, zIndex: 600,
			display: "flex", alignItems: "center", justifyContent: "center",
			padding: 20,
		}}>
			<div
				onClick={onClose}
				style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", animation: "fadeIn 0.2s ease" }}
			/>
			<div style={{
				position: "relative", width: "100%", maxWidth: 520,
				background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)",
				border: "1px solid var(--border)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
				animation: "fadeInUp 0.25s ease", overflow: "hidden",
			}}>
				{/* Header */}
				<div style={{
					padding: "20px 24px 16px",
					background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)",
					borderBottom: "1px solid var(--border-subtle)",
					display: "flex", alignItems: "center", justifyContent: "space-between",
				}}>
					<div>
						<div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>▶ Run New Analysis</div>
						<div style={{ fontSize: 12, color: "var(--text-muted)" }}>{filename}</div>
					</div>
					<button
						onClick={onClose}
						style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.05)", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}
					>✕</button>
				</div>

				{/* Body */}
				<div style={{ padding: "20px 24px 24px" }}>
					<label className="label" htmlFor="modal-jd">Paste Job Description</label>
					<textarea
						id="modal-jd"
						className="textarea"
						placeholder="Paste the full job description here to compare against your resume..."
						value={jd}
						onChange={e => setJd(e.target.value)}
						style={{ minHeight: 180, marginBottom: 16 }}
						autoFocus
					/>
					<div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
						<button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
						<button className="btn btn-primary" onClick={onRun} disabled={loading || !jd.trim()}>
							{loading ? (
								<>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
										<path d="M21 12a9 9 0 1 1-6.219-8.56" />
									</svg>
									Analyzing...
								</>
							) : "▶ Run Analysis"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ─── Resume card (left panel) ─── */
const GRADIENTS = [
	"linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
	"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
	"linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)",
	"linear-gradient(135deg, #f59e0b 0%, #f5576c 100%)",
	"linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
];

function ResumeCard({ resume, idx, onPdf, onAnalyze }) {
	const gradient = GRADIENTS[idx % GRADIENTS.length];
	const filename = cleanName(resume.file_url?.split("/").pop()) || "resume.pdf";
	const date = new Date(resume.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

	return (
		<div className="card" style={{ padding: 0, overflow: "hidden" }}>
			{/* Colorful top strip */}
			<div style={{ background: gradient, padding: "14px 16px", color: "#fff" }}>
				<div style={{ fontSize: 11, opacity: 0.85, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
					<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
					{date}
				</div>
				<div style={{ fontSize: 13, fontWeight: 600, wordBreak: "break-word", lineHeight: 1.4 }}>{filename}</div>
			</div>

			{/* Actions */}
			<div style={{ padding: "10px 14px", display: "flex", gap: 8 }}>
				<button
					className="btn btn-sm"
					onClick={() => onPdf(resume)}
					style={{ flex: 1, background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border-subtle)", fontSize: 12 }}
				>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
					Preview
				</button>
				<button
					className="btn btn-sm btn-primary"
					onClick={() => onAnalyze(resume)}
					style={{ flex: 1, fontSize: 12 }}
				>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
					Analyze
				</button>
			</div>
		</div>
	);
}

/* ─── Analysis History card (right panel) ─── */
function AnalysisCard({ analysis, isActive, onClick, onPdf, onDelete }) {
	const { bg } = scoreColor(analysis.score);
	const filename = cleanName(analysis.resume_name) || "Resume";
	const date = new Date(analysis.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

	return (
		<div
			onClick={onClick}
			style={{
				background: isActive ? "rgba(99,102,241,0.1)" : "var(--bg-card)",
				border: `1px solid ${isActive ? "var(--border-bright)" : "var(--border-subtle)"}`,
				borderRadius: "var(--radius)",
				padding: "14px 16px",
				cursor: "pointer",
				transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
				borderLeft: `4px solid ${bg}`,
				transform: isActive ? "translateX(2px)" : "translateX(0)",
				boxShadow: isActive ? `0 4px 20px rgba(99,102,241,0.2)` : "none",
			}}
			onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.transform = "translateX(3px)"; } }}
			onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.transform = "translateX(0)"; } }}
		>
			{/* Top row */}
			<div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
						{filename}
					</div>
					<div style={{ fontSize: 11, color: "var(--text-muted)" }}>🕒 {date}</div>
				</div>
				<ScoreBadge score={analysis.score} />
			</div>

			{/* Mini score bars */}
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginBottom: 10 }}>
				{[
					{ label: "Skills",     value: analysis.skill_score,      color: "#6366f1" },
					{ label: "Experience", value: analysis.experience_score,   color: "#f093fb" },
					{ label: "Education",  value: analysis.education_score,    color: "#06b6d4" },
					{ label: "Keywords",   value: analysis.keyword_score,      color: "#f59e0b" },
				].map(({ label, value, color }) => (
					<div key={label}>
						<div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>
							<span>{label}</span><span style={{ color, fontWeight: 600 }}>{value}%</span>
						</div>
						<Bar value={value} color={color} />
					</div>
				))}
			</div>

			{/* Action row */}
			<div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
				<button
					className="btn btn-sm"
					onClick={onClick}
					style={{ flex: 1, fontSize: 11, background: "var(--bg-elevated)", color: "var(--primary-light)", border: "1px solid var(--border)", gap: 4 }}
				>
					<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
					Details
				</button>
				<button
					className="btn btn-sm"
					onClick={() => onPdf(analysis)}
					style={{ fontSize: 11, background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)", gap: 4, padding: "6px 10px" }}
					title="View PDF"
				>
					<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
				</button>
				<button
					className="btn btn-sm"
					onClick={() => onDelete(analysis.id)}
					style={{ fontSize: 11, background: "rgba(244,63,94,0.08)", color: "#fb7185", border: "1px solid rgba(244,63,94,0.2)", gap: 4, padding: "6px 10px" }}
					title="Delete"
				>
					<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
				</button>
			</div>
		</div>
	);
}

/* ─── Skeleton loader ─── */
function Skeleton({ height = 140, style = {} }) {
	return <div className="skeleton" style={{ height, borderRadius: "var(--radius)", ...style }} />;
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */
export default function Analysis() {
	const [loading, setLoading] = useState(true);
	const [resumes, setResumes] = useState([]);
	const [analyses, setAnalyses] = useState([]);
	const [selectedAnalysis, setSelectedAnalysis] = useState(null);
	const [runningAnalysis, setRunningAnalysis] = useState(false);
	const [analyzeResume, setAnalyzeResume] = useState(null); // resume chosen for modal
	const [jdForAnalysis, setJdForAnalysis] = useState("");

	// Load on mount
	useEffect(() => {
		(async () => {
			try {
				const allResumes = await api.getAllResumes();
				setResumes(allResumes || []);
				let all = [];
				for (const resume of allResumes || []) {
					try {
						const rows = await api.getAnalysisByResumeId(resume.id);
						if (rows?.length) {
							all = all.concat(rows.map(a => ({
								...a,
								resume_id: resume.id,
								resume_name: cleanName(resume.file_url?.split("/").pop()) || "Unknown",
								resume_file_url: resume.file_url,
							})));
						}
					} catch { /* skip */ }
				}
				all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
				setAnalyses(all);
			} catch (e) {
				window.__toast?.push({ type: "error", title: "Failed to load", description: e.message });
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	function handleOpenPdf(item) {
		const url = item?.resume_file_url || item?.file_url;
		if (!url) { window.__toast?.push({ type: "error", title: "File unavailable", description: "PDF URL is missing." }); return; }
		if (isExpiredS3SignedUrl(url)) {
			window.__toast?.push({ type: "error", title: "Link expired", description: "Re-upload the resume to get a fresh link." });
			return;
		}
		window.open(url, "_blank", "noopener,noreferrer");
	}

	async function handleRunAnalysis() {
		if (!analyzeResume || !jdForAnalysis.trim()) return;
		try {
			setRunningAnalysis(true);
			const res = await api.runAnalysis(analyzeResume.id, jdForAnalysis);
			const newEntry = {
				...res.analysis,
				resume_id: analyzeResume.id,
				resume_name: cleanName(analyzeResume.file_url?.split("/").pop()) || "Unknown",
				resume_file_url: analyzeResume.file_url,
			};
			setAnalyses(prev => [newEntry, ...prev]);
			window.__toast?.push({ type: "success", title: "Analysis complete", description: "New result added to your history." });
			setAnalyzeResume(null);
			setJdForAnalysis("");
			// Auto-select the fresh result
			setSelectedAnalysis(newEntry);
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Analysis failed", description: e.message });
		} finally {
			setRunningAnalysis(false);
		}
	}

	async function handleDelete(id) {
		try {
			await api.deleteAnalysis(id);
			setAnalyses(prev => prev.filter(a => a.id !== id));
			if (selectedAnalysis?.id === id) setSelectedAnalysis(null);
			window.__toast?.push({ type: "success", title: "Deleted", description: "Analysis removed." });
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Delete failed", description: e.message });
		}
	}

	return (
		<>
			{/* Keyframe injections for animations */}
			<style>{`
				@keyframes slideInRight {
					from { transform: translateX(100%); opacity: 0; }
					to   { transform: translateX(0);    opacity: 1; }
				}
			`}</style>

			<div style={{ maxWidth: 1400, margin: "0 auto", animation: "fadeInUp 0.4s ease" }}>

				{/* === Page Header === */}
				<div style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
					<div>
						<h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, letterSpacing: "-0.8px" }} className="text-gradient">
							Resume Analysis
						</h1>
						<p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
							Select a resume, run analysis against a job description, and view detailed results.
						</p>
					</div>
					{/* Stats summary */}
					{!loading && (
						<div style={{ display: "flex", gap: 12 }}>
							{[
								{ label: "Resumes", value: resumes.length, color: "#6366f1" },
								{ label: "Analyses", value: analyses.length, color: "#10b981" },
								{ label: "Avg Score", value: analyses.length ? Math.round(analyses.reduce((s,a)=>s+(a.score||0),0)/analyses.length)+"%" : "—", color: "#f59e0b" },
							].map(({ label, value, color }) => (
								<div key={label} style={{
									background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
									borderRadius: "var(--radius)", padding: "10px 16px", textAlign: "center",
								}}>
									<div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
									<div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{label}</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* === Two-column layout === */}
				<div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" }}>

					{/* LEFT: Saved Resumes */}
					<div>
						<div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 12 }}>
							Saved Resumes · {loading ? "…" : resumes.length}
						</div>

						<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
							{loading ? (
								<><Skeleton height={120} /><Skeleton height={120} /></>
							) : resumes.length === 0 ? (
								<div style={{
									background: "var(--bg-card)", border: "1px dashed var(--border)",
									borderRadius: "var(--radius-lg)", padding: "40px 24px", textAlign: "center",
								}}>
									<div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
									<div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>No resumes yet</div>
									<div style={{ fontSize: 13, color: "var(--text-muted)" }}>Upload a resume to get started</div>
								</div>
							) : resumes.map((r, i) => (
								<ResumeCard
									key={r.id}
									resume={r}
									idx={i}
									onPdf={handleOpenPdf}
									onAnalyze={r => { setAnalyzeResume(r); setJdForAnalysis(""); }}
								/>
							))}
						</div>
					</div>

					{/* RIGHT: Analysis History */}
					<div>
						<div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 12 }}>
							Analysis History · {loading ? "…" : analyses.length}
						</div>

						<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
							{loading ? (
								<><Skeleton height={160} /><Skeleton height={160} /><Skeleton height={160} /></>
							) : analyses.length === 0 ? (
								<div style={{
									background: "var(--bg-card)", border: "1px dashed var(--border)",
									borderRadius: "var(--radius-lg)", padding: "60px 32px", textAlign: "center",
								}}>
									<div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
									<div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>No analyses yet</div>
									<div style={{ fontSize: 13, color: "var(--text-muted)" }}>Click "Analyze" on any resume above to get started</div>
								</div>
							) : (
								analyses.map(a => (
									<AnalysisCard
										key={a.id}
										analysis={a}
										isActive={selectedAnalysis?.id === a.id}
										onClick={() => setSelectedAnalysis(prev => prev?.id === a.id ? null : a)}
										onPdf={handleOpenPdf}
										onDelete={handleDelete}
									/>
								))
							)}
						</div>
					</div>
				</div>
			</div>

			{/* === Slide-in Detail Panel === */}
			{selectedAnalysis && (
				<DetailPanel
					analysis={selectedAnalysis}
					onClose={() => setSelectedAnalysis(null)}
					onPdf={handleOpenPdf}
				/>
			)}

			{/* === Run Analysis Modal === */}
			{analyzeResume && (
				<RunAnalysisModal
					resume={analyzeResume}
					jd={jdForAnalysis}
					setJd={setJdForAnalysis}
					loading={runningAnalysis}
					onRun={handleRunAnalysis}
					onClose={() => { setAnalyzeResume(null); setJdForAnalysis(""); }}
				/>
			)}
		</>
	);
}
