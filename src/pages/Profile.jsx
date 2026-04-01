import { useState, useEffect } from "react";
import { useAuth } from "../state/auth";
import { useNavigate } from "react-router-dom";
import * as api from "../utils/api";

export default function Profile() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [passwordLoading, setPasswordLoading] = useState(false);
	const [resumes, setResumes] = useState([]);
	const [resumesLoading, setResumesLoading] = useState(true);
	const [expandedResumeId, setExpandedResumeId] = useState(null);
	const [analyses, setAnalyses] = useState({});

	useEffect(() => {
		fetchResumeHistory();
	}, []);

	async function fetchResumeHistory() {
		try {
			setResumesLoading(true);
			const data = await api.getResumeHistory();
			setResumes(data || []);
			
			// Fetch analyses for all resumes
			if (data && data.length > 0) {
				const analysesData = {};
				for (const resume of data) {
					try {
						const analysesList = await api.getAnalysisByResumeId(resume.id);
						analysesData[resume.id] = analysesList || [];
					} catch (e) {
						analysesData[resume.id] = [];
					}
				}
				setAnalyses(analysesData);
			}
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed", description: e.message });
		} finally {
			setResumesLoading(false);
		}
	}

	async function fetchAnalyses(resumeId) {
		if (analyses[resumeId]) {
			setExpandedResumeId(expandedResumeId === resumeId ? null : resumeId);
			return;
		}
		try {
			const data = await api.getAnalysisByResumeId(resumeId);
			setAnalyses(prev => ({ ...prev, [resumeId]: data || [] }));
			setExpandedResumeId(resumeId);
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed", description: e.message });
		}
	}

	async function handleChange() {
		if (!oldPassword || !newPassword) {
			window.__toast?.push({ type: "error", title: "Missing", description: "Enter both old and new passwords." });
			return;
		}
		try {
			setPasswordLoading(true);
			await api.changePassword(oldPassword, newPassword);
			window.__toast?.push({ type: "success", title: "Updated", description: "Password changed." });
			setOldPassword("");
			setNewPassword("");
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed", description: e.message });
		} finally {
			setPasswordLoading(false);
		}
	}

	async function handleDeleteResume(resumeId) {
		if (!confirm("Are you sure you want to delete this resume?")) return;
		try {
			await api.deleteResume(resumeId);
			setResumes(resumes.filter(r => r.id !== resumeId));
			setAnalyses(prev => {
				const updated = { ...prev };
				delete updated[resumeId];
				return updated;
			});
			window.__toast?.push({ type: "success", title: "Deleted", description: "Resume deleted successfully." });
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed", description: e.message });
		}
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	}

	const memberSince = user ? new Date(user.created_at || new Date()).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "—";
	const totalAnalyses = Object.values(analyses).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
	const bestScore = totalAnalyses > 0 
		? Math.max(...Object.values(analyses).flat().filter(a => a.score).map(a => a.score || 0))
		: 0;

	const StatBadge = ({ icon, label, value, color }) => (
		<div style={{
			padding: 16,
			background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
			borderLeft: `3px solid ${color}`,
			borderRadius: 8,
			marginBottom: 12
		}}>
			<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
				<div style={{ fontSize: 18 }}>{icon}</div>
				<div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{label}</div>
			</div>
			<div style={{ fontSize: 22, fontWeight: 700, color, marginLeft: 26 }}>{value}</div>
		</div>
	);

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto" }}>
			{/* Page Header */}
			<div style={{ marginBottom: 40 }}>
				<h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px", color: "var(--primary)" }}>Account Settings</h1>
				<p style={{ fontSize: 15, color: "var(--muted)", margin: 0 }}>Manage your profile, security, and documents</p>
			</div>

			{/* Two Column Layout */}
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 32 }}>
				{/* LEFT COLUMN - ACCOUNT INFORMATION */}
				<div>
					{/* Account Profile Card */}
					<div className="card" style={{
						padding: 24,
						marginBottom: 24,
						background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
						color: "white"
					}}>
						<div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
						<div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Account Profile</div>
						<div style={{ fontSize: 13, opacity: 0.9, marginBottom: 20 }}>Member since {memberSince}</div>
						<div style={{
							background: "rgba(255,255,255,0.15)",
							padding: 12,
							borderRadius: 8,
							fontSize: 13,
							wordBreak: "break-all"
						}}>
							{user?.email}
						</div>
					</div>

					{/* Account Stats */}
					<div style={{ marginBottom: 32 }}>
						<h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid var(--border)" }}>Account Stats</h3>
						<StatBadge icon="📄" label="Total Resumes" value={resumes.length} color="#667eea" />
						<StatBadge icon="📊" label="Total Analyses" value={totalAnalyses} color="#f093fb" />
						<StatBadge icon="⭐" label="Best Score" value={`${bestScore}%`} color="#f5576c" />
					</div>

					{/* Security Section */}
					<div className="card" style={{ padding: 24 }}>
						<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
							<div style={{
								width: 40,
								height: 40,
								borderRadius: 10,
								background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 20
							}}>🔐</div>
							<div>
								<div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Security</div>
								<div style={{ fontSize: 12, color: "var(--muted)" }}>Update your password</div>
							</div>
						</div>
						<div style={{
							padding: 12,
							background: "#f8f9fa",
							borderRadius: 8,
							marginBottom: 16,
							fontSize: 13,
							color: "var(--muted)",
							display: "flex",
							alignItems: "center",
							gap: 8
						}}>
							<span style={{ fontSize: 16 }}>✅</span>
							Password protected account
						</div>
						<div className="stack" style={{ gap: 12 }}>
							<input
								className="input"
								type="password"
								placeholder="Current password"
								value={oldPassword}
								onChange={(e) => setOldPassword(e.target.value)}
								style={{ fontSize: 14 }}
							/>
							<input
								className="input"
								type="password"
								placeholder="New password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								style={{ fontSize: 14 }}
							/>
							<button
								className="btn btn-primary"
								onClick={handleChange}
								disabled={passwordLoading}
								style={{ width: "100%", fontSize: 14 }}
							>
								{passwordLoading ? "Updating..." : "Update Password"}
							</button>
						</div>
					</div>

					{/* Quick Links */}
					<div style={{ marginTop: 24 }}>
						<h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Quick Actions</h3>
						<button
							className="btn"
							onClick={() => navigate("/upload")}
							style={{
								width: "100%",
								background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
								color: "white",
								border: "none",
								fontSize: 14,
								marginBottom: 10
							}}
						>
							⬆️ Upload New Resume
						</button>
						<button
							className="btn"
							onClick={() => navigate("/analyze")}
							style={{
								width: "100%",
								background: "#f8f9fa",
								color: "var(--primary)",
								border: "1px solid var(--border)",
								fontSize: 14
							}}
						>
							📊 Run Analysis
						</button>
					</div>
				</div>

				{/* RIGHT COLUMN - YOUR RESUMES */}
				<div>
					<div style={{ marginBottom: 24 }}>
						<h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>Your Resumes</h2>
						<p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Manage your uploaded documents and view analysis history</p>
					</div>

					{resumesLoading ? (
						<div className="card" style={{
							textAlign: "center",
							padding: "60px 20px",
							color: "var(--muted)"
						}}>
							<div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
							<p style={{ fontSize: 15 }}>Loading your resumes...</p>
						</div>
					) : resumes.length === 0 ? (
						<div className="card" style={{
							textAlign: "center",
							padding: "60px 20px"
						}}>
							<div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
							<p style={{ fontSize: 16, fontWeight: 500, color: "var(--text)", margin: "0 0 8px" }}>No resumes yet</p>
							<p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 24px" }}>Upload your resume to start getting instant ATS feedback</p>
							<button
								className="btn btn-primary"
								onClick={() => navigate("/upload")}
								style={{ fontSize: 14 }}
							>
								⬆️ Upload Your Resume
							</button>
						</div>
					) : (
						<div className="stack" style={{ gap: 16 }}>
							{resumes.map((resume) => {
								const resumeAnalyses = analyses[resume.id] || [];
								const bestResumeScore = resumeAnalyses.length > 0 
									? Math.max(...resumeAnalyses.map(a => a.score || 0))
									: 0;

								return (
									<div
										key={resume.id}
										className="card"
										style={{
											overflow: "hidden",
											transition: "all 0.3s ease"
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.12)";
											e.currentTarget.style.transform = "translateY(-2px)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.boxShadow = "var(--shadow)";
											e.currentTarget.style.transform = "translateY(0)";
										}}
									>
										{/* Resume Header */}
										<div
											style={{
												padding: 20,
												background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												cursor: "pointer",
												color: "white"
											}}
											onClick={() => fetchAnalyses(resume.id)}
										>
											<div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
												<div style={{ fontSize: 28 }}>📄</div>
												<div>
													<div style={{ fontWeight: 600, marginBottom: 4, fontSize: 16 }}>
														Resume #{resume.id.slice(0, 8)}
													</div>
													<div style={{ fontSize: 13, opacity: 0.9 }}>
														Uploaded {formatDate(resume.created_at)}
													</div>
												</div>
											</div>
											<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
												{resumeAnalyses.length > 0 && (
													<div style={{ textAlign: "right" }}>
														<div style={{ fontSize: 12, opacity: 0.8 }}>Best Score</div>
														<div style={{ fontSize: 20, fontWeight: 700 }}>{bestResumeScore}%</div>
													</div>
												)}
												<div style={{ fontSize: 16 }}>{expandedResumeId === resume.id ? "▼" : "▶"}</div>
											</div>
										</div>

										{/* Resume Info & Actions */}
										<div style={{
											padding: 20,
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
											borderBottom: "1px solid var(--border)"
										}}>
											<div>
												<div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Analyses</div>
												<div style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>{resumeAnalyses.length}</div>
											</div>
											<div style={{ display: "flex", gap: 8 }}>
												<button
													className="btn btn-primary"
													onClick={(e) => {
														e.stopPropagation();
														window.open(resume.file_url, "_blank");
													}}
													style={{ fontSize: 13, padding: "8px 14px", whiteSpace: "nowrap" }}
												>
													👁️ View PDF
												</button>
												<button
													className="btn btn-secondary"
													onClick={() => navigate("/upload")}
													style={{ fontSize: 13, padding: "8px 14px", whiteSpace: "nowrap" }}
												>
													📊 Analyze
												</button>
												<button
													className="btn"
													style={{
														background: "#ffe5e5",
														color: "#d32f2f",
														border: "1px solid #ffb3b3",
														fontSize: 13,
														padding: "8px 14px",
														whiteSpace: "nowrap"
													}}
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteResume(resume.id);
													}}
												>
													🗑️
												</button>
											</div>
										</div>

										{/* Analyses List */}
										{expandedResumeId === resume.id && resumeAnalyses && (
											<div style={{
												padding: 20,
												background: "#f8f9fa"
											}}>
												{resumeAnalyses.length === 0 ? (
													<div style={{
														textAlign: "center",
														padding: 20,
														fontSize: 14,
														color: "var(--muted)"
													}}>
														<div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
														<p style={{ margin: 0 }}>No analyses yet</p>
													</div>
												) : (
													<div className="stack" style={{ gap: 12 }}>
														{resumeAnalyses.map((analysis) => (
															<div
																key={analysis.id}
																style={{
																	padding: 14,
																	border: "1px solid var(--border)",
																	borderRadius: 8,
																	background: "white",
																	display: "flex",
																	justifyContent: "space-between",
																	alignItems: "center",
																	transition: "all 0.2s ease",
																	cursor: "pointer"
																}}
																onClick={() => navigate("/results", { state: { analysis } })}
																onMouseEnter={(e) => {
																	e.currentTarget.style.borderColor = "var(--primary)";
																	e.currentTarget.style.background = "#f8faff";
																}}
																onMouseLeave={(e) => {
																	e.currentTarget.style.borderColor = "var(--border)";
																	e.currentTarget.style.background = "white";
																}}
															>
																<div style={{ flex: 1 }}>
																	<div style={{
																		fontSize: 13,
																		fontWeight: 600,
																		color: "var(--text)",
																		marginBottom: 4,
																		display: "flex",
																		alignItems: "center",
																		gap: 8
																	}}>
																		<div style={{
																			width: 32,
																			height: 32,
																			borderRadius: 6,
																			background: `hsl(${analysis.score * 1.2}, 80%, 50%)`,
																			display: "flex",
																			alignItems: "center",
																			justifyContent: "center",
																			fontWeight: 700,
																			color: "white",
																			fontSize: 12
																		}}>
																			{analysis.score}%
																		</div>
																		<div>
																			<div>Score: {analysis.score}</div>
																			<div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>
																				{formatDate(analysis.created_at)}
																			</div>
																		</div>
																	</div>
																</div>
																<div style={{ fontSize: 18 }}>→</div>
															</div>
														))}
													</div>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* Responsive Breakpoint */}
			<style>{`
				@media (max-width: 1024px) {
					[style*="display: grid"][style*="gridTemplateColumns"] {
						grid-template-columns: 1fr !important;
					}
				}
			`}</style>
		</div>
	);
}
