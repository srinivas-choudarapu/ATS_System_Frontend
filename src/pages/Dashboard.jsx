import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../utils/api";
import { useAuth } from "../state/auth";

/* ── Mini icon components ── */
const Icon = ({ d, size = 16 }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
		stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d={d} />
	</svg>
);

const ScoreBadge = ({ score }) => {
	const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f43f5e";
	const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";
	return (
		<span style={{
			display: "inline-flex",
			alignItems: "center",
			gap: 5,
			padding: "3px 10px",
			borderRadius: 100,
			fontSize: 11,
			fontWeight: 700,
			background: `${color}18`,
			color,
			border: `1px solid ${color}30`,
			letterSpacing: "0.3px"
		}}>
			<span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
			{label}
		</span>
	);
};

const CircleProgress = ({ score, size = 64, strokeWidth = 6 }) => {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (score / 100) * circumference;
	const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f43f5e";

	return (
		<div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
			<svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
				<circle cx={size / 2} cy={size / 2} r={radius}
					fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
				<circle cx={size / 2} cy={size / 2} r={radius}
					fill="none" stroke={color} strokeWidth={strokeWidth}
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					style={{ transition: "stroke-dashoffset 1s ease, stroke 0.3s ease" }}
				/>
			</svg>
			<div style={{
				position: "absolute", inset: 0,
				display: "flex", alignItems: "center", justifyContent: "center",
				flexDirection: "column"
			}}>
				<span style={{ fontSize: 13, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
				<span style={{ fontSize: 8, color: "var(--text-muted)", fontWeight: 600 }}>/ 100</span>
			</div>
		</div>
	);
};

const SkeletonCard = () => (
	<div className="card" style={{ padding: 24, gap: 14, display: "flex", flexDirection: "column" }}>
		<div className="skeleton" style={{ height: 16, width: "60%", borderRadius: 6 }} />
		<div className="skeleton" style={{ height: 12, width: "40%", borderRadius: 6 }} />
		<div style={{ display: "flex", gap: 12, marginTop: 8 }}>
			<div className="skeleton" style={{ height: 36, width: 90, borderRadius: 8 }} />
			<div className="skeleton" style={{ height: 36, width: 90, borderRadius: 8 }} />
		</div>
	</div>
);

export default function Dashboard() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [items, setItems] = useState([]);
	const [analyses, setAnalyses] = useState({});
	const [expandedId, setExpandedId] = useState(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState(null);
	const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				const data = await api.getResumeHistory();
				setItems(data || []);
				if (data && data.length > 0) {
					const analysesData = {};
					for (const resume of data) {
						try {
							const list = await api.getAnalysisByResumeId(resume.id);
							analysesData[resume.id] = list || [];
						} catch {
							analysesData[resume.id] = [];
						}
					}
					setAnalyses(analysesData);
				}
			} catch (e) {
				window.__toast?.push({ type: "error", title: "Failed to load", description: e.message });
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	async function handleDelete(id) {
		try {
			await api.deleteResume(id);
			setItems((l) => l.filter((x) => x.id !== id));
			setAnalyses((p) => { const u = { ...p }; delete u[id]; return u; });
			setConfirmDeleteId(null);
			window.__toast?.push({ type: "success", title: "Deleted", description: "Resume removed." });
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Delete failed", description: e.message });
		}
	}

	async function handleDeleteAll() {
		try {
			await api.deleteAllResumes();
			setItems([]);
			setAnalyses({});
			setConfirmDeleteAll(false);
			window.__toast?.push({ type: "success", title: "Cleared", description: "All resumes deleted." });
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Action failed", description: e.message });
		}
	}

	/* ── Stats ── */
	const totalResumes = items.length;
	const allAnalyses = Object.values(analyses).flat();
	const totalAnalyses = allAnalyses.length;
	const scoredAnalyses = allAnalyses.filter((a) => a.score != null);
	const averageScore = scoredAnalyses.length
		? Math.round(scoredAnalyses.reduce((s, a) => s + a.score, 0) / scoredAnalyses.length)
		: 0;
	const bestScore = scoredAnalyses.length ? Math.max(...scoredAnalyses.map((a) => a.score)) : 0;
	const lastUpload = items.length > 0 ? new Date(items[0].created_at) : null;

	function formatDate(d) {
		return new Date(d).toLocaleDateString("en-US", {
			year: "numeric", month: "short", day: "numeric",
			hour: "2-digit", minute: "2-digit"
		});
	}

	function shortDate(d) {
		return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
	}

	/* ── Stat cards config ── */
	const stats = [
		{
			icon: (
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
				</svg>
			),
			label: "Total Resumes",
			value: totalResumes,
			sub: "Documents uploaded",
			color: "#6366f1",
			glow: "rgba(99,102,241,0.25)"
		},
		{
			icon: (
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
				</svg>
			),
			label: "Total Analyses",
			value: totalAnalyses,
			sub: "Analysis runs completed",
			color: "#8b5cf6",
			glow: "rgba(139,92,246,0.25)"
		},
		{
			icon: (
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
				</svg>
			),
			label: "Average Score",
			value: averageScore ? `${averageScore}%` : "—",
			sub: "Across all analyses",
			color: "#f59e0b",
			glow: "rgba(245,158,11,0.25)"
		},
		{
			icon: (
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
				</svg>
			),
			label: "Best Score",
			value: bestScore ? `${bestScore}%` : "—",
			sub: "Highest achieved score",
			color: "#10b981",
			glow: "rgba(16,185,129,0.25)"
		}
	];

	return (
		<div style={{ maxWidth: 1200, animation: "fadeInUp 0.5s ease" }}>

			{/* ── Header ── */}
			<div style={{ marginBottom: 36 }}>
				<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
					<div>
						<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
							<div style={{
								width: 40, height: 40, borderRadius: 12,
								background: "var(--gradient-primary)",
								display: "flex", alignItems: "center", justifyContent: "center",
								fontSize: 18, boxShadow: "0 0 20px var(--primary-glow)"
							}}>📊</div>
							<div>
								<h1 style={{
									fontSize: 26, fontWeight: 800, margin: 0,
									letterSpacing: "-0.8px", color: "var(--text)"
								}}>
									Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
								</h1>
							</div>
						</div>
						<p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0, maxWidth: 480 }}>
							Track your resume analyses, monitor ATS compatibility scores, and improve your job application performance.
						</p>
					</div>

					<div style={{ display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
						{items.length > 0 && (
							<button className="btn btn-warning btn-sm" onClick={() => setConfirmDeleteAll(true)}>
								<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
									<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
								</svg>
								Clear All
							</button>
						)}
						<button className="btn btn-primary btn-sm" onClick={() => navigate("/upload")}>
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
							</svg>
							New Analysis
						</button>
					</div>
				</div>
			</div>

			{/* ── Stat Cards ── */}
			<div className="grid grid-4" style={{ marginBottom: 36 }}>
				{stats.map((s, i) => (
					<div key={i} className="stat-card" style={{ "--stat-color": s.color }}>
						{/* glow blob */}
						<div style={{
							position: "absolute", top: -20, right: -20,
							width: 80, height: 80,
							borderRadius: "50%",
							background: s.glow,
							filter: "blur(24px)",
							pointerEvents: "none"
						}} />

						<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
							<div style={{
								width: 42, height: 42,
								borderRadius: 12,
								background: `${s.color}18`,
								border: `1px solid ${s.color}28`,
								display: "flex", alignItems: "center", justifyContent: "center",
								color: s.color
							}}>
								{s.icon}
							</div>
							<span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.5px" }}>
								{s.label.toUpperCase()}
							</span>
						</div>

						<div style={{ fontSize: 34, fontWeight: 800, color: "var(--text)", letterSpacing: "-1px", lineHeight: 1, marginBottom: 6 }}>
							{s.value}
						</div>
						<div style={{ fontSize: 12, color: "var(--text-muted)" }}>
							{s.sub}
						</div>

						{s.label === "Last Upload" && lastUpload && (
							<div style={{ fontSize: 11, color: s.color, marginTop: 6, fontWeight: 600 }}>
								{shortDate(lastUpload)}
							</div>
						)}
					</div>
				))}
			</div>

			{/* ── Resumes Section ── */}
			<div>
				<div style={{
					display: "flex", alignItems: "center", justifyContent: "space-between",
					marginBottom: 20, gap: 12, flexWrap: "wrap"
				}}>
					<div>
						<h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--text)", letterSpacing: "-0.4px" }}>
							Resume Library
						</h2>
						<p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
							{loading ? "Loading…" : `${totalResumes} document${totalResumes !== 1 ? "s" : ""} · ${totalAnalyses} analysis${totalAnalyses !== 1 ? "es" : ""}`}
						</p>
					</div>
					{/* line decoration */}
					<div style={{ flex: 1, height: 1, background: "var(--border-subtle)", minWidth: 40 }} />
				</div>

				{/* Loading State */}
				{loading && (
					<div className="stack" style={{ gap: 16 }}>
						{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
					</div>
				)}

				{/* Empty State */}
				{!loading && items.length === 0 && (
					<div className="card" style={{
						padding: "72px 32px",
						textAlign: "center",
						background: "linear-gradient(145deg, var(--bg-card), var(--bg-secondary))"
					}}>
						<div style={{
							width: 80, height: 80,
							borderRadius: "50%",
							background: "rgba(99,102,241,0.1)",
							border: "1px solid var(--border)",
							display: "flex", alignItems: "center", justifyContent: "center",
							fontSize: 36,
							margin: "0 auto 24px",
							animation: "float 3s ease-in-out infinite"
						}}>📋</div>
						<h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 10px" }}>
							No resumes yet
						</h3>
						<p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 28px", maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
							Upload your resume to start getting ATS compatibility analysis and actionable improvement suggestions.
						</p>
						<button className="btn btn-primary" onClick={() => navigate("/upload")} style={{ margin: "0 auto" }}>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
							</svg>
							Upload Your First Resume
						</button>
					</div>
				)}

				{/* Resume Cards */}
				{!loading && items.length > 0 && (
					<div className="stack" style={{ gap: 16 }}>
						{items.map((resume, idx) => {
							const resumeAnalyses = analyses[resume.id] || [];
							const bestS = resumeAnalyses.length ? Math.max(...resumeAnalyses.map((a) => a.score || 0)) : 0;
							const avgS = resumeAnalyses.length
								? Math.round(resumeAnalyses.reduce((s, a) => s + (a.score || 0), 0) / resumeAnalyses.length)
								: 0;
							const isExpanded = expandedId === resume.id;

							return (
								<div
									key={resume.id}
									className="card"
									style={{
										overflow: "visible",
										animation: `fadeInUp ${0.3 + idx * 0.07}s ease forwards`,
										border: isExpanded ? "1px solid var(--border-bright)" : undefined,
										boxShadow: isExpanded ? "0 0 0 1px var(--border-bright), var(--shadow-lg)" : undefined,
									}}
								>
									{/* Card Header Banner */}
									<div style={{
										padding: "18px 24px",
										background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 50%, rgba(6,182,212,0.05) 100%)",
										borderBottom: "1px solid var(--border-subtle)",
										display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap"
									}}>
										{/* Left: file info */}
										<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
											<div style={{
												width: 46, height: 46,
												borderRadius: 12,
												background: "rgba(99,102,241,0.15)",
												border: "1px solid rgba(99,102,241,0.25)",
												display: "flex", alignItems: "center", justifyContent: "center",
												fontSize: 22, flexShrink: 0
											}}>📄</div>
											<div>
												<div style={{
													fontSize: 15, fontWeight: 700, color: "var(--text)",
													letterSpacing: "-0.3px", marginBottom: 3
												}}>
													Resume <span style={{ color: "var(--primary-light)", fontFamily: "monospace", fontSize: 13 }}>#{resume.id.slice(0, 8)}</span>
												</div>
												<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
													<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
														<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
													</svg>
													<span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(resume.created_at)}</span>
												</div>
											</div>
										</div>

										{/* Right: quick stats + actions */}
										<div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
											{resumeAnalyses.length > 0 && (
												<>
													<CircleProgress score={bestS} size={56} strokeWidth={5} />
													<div style={{ textAlign: "right" }}>
														<div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>ANALYSES</div>
														<div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{resumeAnalyses.length}</div>
													</div>
													<ScoreBadge score={bestS} />
												</>
											)}
											{resumeAnalyses.length === 0 && (
												<span className="badge" style={{ background: "rgba(100,116,139,0.12)", color: "var(--text-muted)", border: "1px solid rgba(100,116,139,0.15)" }}>
													No analyses yet
												</span>
											)}
										</div>
									</div>

									{/* Card Body */}
									<div style={{ padding: "18px 24px" }}>
										<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
											{/* Score summary */}
											{resumeAnalyses.length > 0 ? (
												<div style={{ display: "flex", gap: 28 }}>
													<div>
														<div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>BEST SCORE</div>
														<div style={{ fontSize: 26, fontWeight: 800, color: bestS >= 80 ? "#10b981" : bestS >= 60 ? "#f59e0b" : "#f43f5e", letterSpacing: "-0.8px" }}>
															{bestS}<span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>/100</span>
														</div>
													</div>
													<div>
														<div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>AVG SCORE</div>
														<div style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.8px" }}>
															{avgS}<span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>/100</span>
														</div>
													</div>
												</div>
											) : (
												<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
													<div style={{
														width: 36, height: 36, borderRadius: 10,
														background: "rgba(99,102,241,0.1)",
														display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
													}}>✨</div>
													<div>
														<div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>Ready to analyze</div>
														<div style={{ fontSize: 12, color: "var(--text-muted)" }}>Run your first ATS analysis on this resume</div>
													</div>
												</div>
											)}

											{/* Actions */}
											<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
												<button
													className="btn btn-primary btn-sm"
													onClick={() => window.open(resume.file_url, "_blank")}
												>
													<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
														<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
														<circle cx="12" cy="12" r="3"/>
													</svg>
													View PDF
												</button>
												<button
													className="btn btn-secondary btn-sm"
													onClick={() => navigate("/upload")}
												>
													<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
														<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
													</svg>
													Analyze
												</button>
												{resumeAnalyses.length > 0 && (
													<button
														className="btn btn-sm"
														style={{
															background: "rgba(99,102,241,0.08)",
															color: "var(--primary-light)",
															border: "1px solid var(--border)",
														}}
														onClick={() => setExpandedId(isExpanded ? null : resume.id)}
													>
														<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
															style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }}>
															<polyline points="6 9 12 15 18 9"/>
														</svg>
														History
													</button>
												)}
												<button
													className="btn btn-danger btn-sm"
													onClick={() => setConfirmDeleteId(resume.id)}
												>
													<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
														<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
													</svg>
													Delete
												</button>
											</div>
										</div>

										{/* Score bar (if analyses) */}
										{resumeAnalyses.length > 0 && (
											<div style={{ marginTop: 16 }}>
												<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
													<span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>ATS COMPATIBILITY</span>
													<span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{bestS}%</span>
												</div>
												<div className="progress-bar-wrap">
													<div className="progress-bar" style={{ width: `${bestS}%`, background: bestS >= 80 ? "linear-gradient(90deg, #10b981, #34d399)" : bestS >= 60 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #f43f5e, #fb7185)" }} />
												</div>
											</div>
										)}
									</div>

									{/* Expanded: Analysis History */}
									{isExpanded && resumeAnalyses.length > 0 && (
										<div style={{
											borderTop: "1px solid var(--border-subtle)",
											padding: "16px 24px",
											background: "rgba(0,0,0,0.2)",
											borderRadius: "0 0 14px 14px"
										}}>
											<div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.5px", marginBottom: 14 }}>
												ANALYSIS HISTORY · {resumeAnalyses.length} run{resumeAnalyses.length !== 1 ? "s" : ""}
											</div>
											<div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
												{resumeAnalyses.map((analysis, idx) => (
													<div
														key={idx}
														style={{
															flex: "0 0 auto",
															minWidth: 130,
															padding: "14px 16px",
															borderRadius: 12,
															background: "var(--bg-elevated)",
															border: "1px solid var(--border-subtle)",
															cursor: "pointer",
															transition: "all 0.2s ease",
															textAlign: "center"
														}}
														onClick={() => navigate("/results", { state: { analysis } })}
														onMouseEnter={(e) => {
															e.currentTarget.style.borderColor = "var(--border-bright)";
															e.currentTarget.style.transform = "translateY(-2px)";
															e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.2)";
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.borderColor = "var(--border-subtle)";
															e.currentTarget.style.transform = "translateY(0)";
															e.currentTarget.style.boxShadow = "none";
														}}
													>
														<div style={{
															fontSize: 22, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 2,
															color: analysis.score >= 80 ? "#10b981" : analysis.score >= 60 ? "#f59e0b" : "#f43f5e"
														}}>{analysis.score}<span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>%</span></div>
														<div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>
															{shortDate(analysis.created_at)}
														</div>
														<div style={{ fontSize: 10, color: "var(--primary-light)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
															View →
														</div>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* ── Confirm Delete Modal ── */}
			{(confirmDeleteId || confirmDeleteAll) && (
				<div style={{
					position: "fixed", inset: 0, zIndex: 1000,
					background: "rgba(0,0,0,0.7)",
					backdropFilter: "blur(8px)",
					display: "flex", alignItems: "center", justifyContent: "center",
					padding: 24, animation: "fadeIn 0.2s ease"
				}}>
					<div className="card" style={{
						width: "100%", maxWidth: 420,
						padding: 32, textAlign: "center",
						background: "var(--bg-elevated)"
					}}>
						<div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
						<h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 10px" }}>
							{confirmDeleteAll ? "Delete All Resumes?" : "Delete Resume?"}
						</h3>
						<p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 28px", lineHeight: 1.6 }}>
							{confirmDeleteAll
								? "This will permanently delete all your resumes and analyses. This action cannot be undone."
								: "This will permanently delete this resume and all its analyses. This action cannot be undone."}
						</p>
						<div style={{ display: "flex", gap: 12 }}>
							<button className="btn btn-ghost btn-block" onClick={() => { setConfirmDeleteId(null); setConfirmDeleteAll(false); }}>
								Cancel
							</button>
							<button
								className="btn btn-danger btn-block"
								onClick={() => confirmDeleteAll ? handleDeleteAll() : handleDelete(confirmDeleteId)}
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
									<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
								</svg>
								{confirmDeleteAll ? "Delete All" : "Delete"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
