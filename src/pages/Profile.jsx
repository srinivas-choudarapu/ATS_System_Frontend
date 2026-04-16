import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../state/auth";
import { useNavigate } from "react-router-dom";
import * as api from "../utils/api";
import { isExpiredS3SignedUrl } from "../utils/s3Url";

function cleanName(raw) {
	if (!raw) return "resume.pdf";
	return raw.replace(/^\d+-/, "");
}

export default function Profile() {
	const { user, setUser } = useAuth();
	const navigate = useNavigate();

	// Tabs: "overview", "resumes", "security"
	const [activeTab, setActiveTab] = useState("overview");

	// Data states
	const [resumes, setResumes] = useState([]);
	const [analyses, setAnalyses] = useState({});
	const [resumesLoading, setResumesLoading] = useState(true);
	
	// Resume tab states
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedResumeId, setExpandedResumeId] = useState(null);

	// Security tab states
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [passwordLoading, setPasswordLoading] = useState(false);

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

	async function handleChangePassword() {
		if (!oldPassword || !newPassword) {
			window.__toast?.push({ type: "error", title: "Missing", description: "Enter both old and new passwords." });
			return;
		}
		try {
			setPasswordLoading(true);
			await api.changePassword(oldPassword, newPassword);
			window.__toast?.push({ type: "success", title: "Updated", description: "Password changed successfully." });
			setOldPassword("");
			setNewPassword("");
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed", description: e.message });
		} finally {
			setPasswordLoading(false);
		}
	}

	async function handleDeleteResume(resumeId) {
		if (!confirm("Are you sure you want to delete this resume? This cannot be undone.")) return;
		try {
			await api.deleteResume(resumeId);
			setResumes(resumes.filter(r => r.id !== resumeId));
			setAnalyses(prev => {
				const updated = { ...prev };
				delete updated[resumeId];
				return updated;
			});
			if (expandedResumeId === resumeId) setExpandedResumeId(null);
			window.__toast?.push({ type: "success", title: "Deleted", description: "Resume deleted successfully." });
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed", description: e.message });
		}
	}

	async function handleLogout() {
		try {
			await api.logout();
			setUser(null);
			navigate("/");
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed", description: "Could not log out." });
		}
	}

	function handleOpenPdf(url) {
		if (!url) { window.__toast?.push({ type: "error", title: "File unavailable", description: "PDF URL is missing." }); return; }
		if (isExpiredS3SignedUrl(url)) {
			window.__toast?.push({ type: "error", title: "Link expired", description: "Re-upload the resume to get a fresh link." });
			return;
		}
		window.open(url, "_blank", "noopener,noreferrer");
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric", month: "short", day: "numeric",
			hour: "2-digit", minute: "2-digit"
		});
	}

	const memberSince = user ? new Date(user.created_at || new Date()).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "—";
	const totalAnalyses = Object.values(analyses).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
	const bestScore = totalAnalyses > 0 
		? Math.max(...Object.values(analyses).flat().filter(a => a.score).map(a => a.score || 0))
		: 0;

	// Filtered resumes
	const filteredResumes = useMemo(() => {
		if (!searchQuery) return resumes;
		const query = searchQuery.toLowerCase();
		return resumes.filter(r => {
			const name = cleanName(r.file_url?.split("/").pop()).toLowerCase();
			return name.includes(query);
		});
	}, [resumes, searchQuery]);

	// Shared Tab Button Component
	const TabButton = ({ id, icon, label }) => {
		const isActive = activeTab === id;
		return (
			<button
				onClick={() => setActiveTab(id)}
				style={{
					display: "flex", alignItems: "center", gap: 12, width: "100%",
					padding: "12px 16px", borderRadius: "10px",
					background: isActive ? "var(--primary)" : "transparent",
					color: isActive ? "#fff" : "var(--text-secondary)",
					border: "none", cursor: "pointer",
					fontSize: 14, fontWeight: isActive ? 600 : 500,
					transition: "all 0.2s ease", textAlign: "left"
				}}
				onMouseEnter={e => {
					if (!isActive) e.currentTarget.style.background = "var(--bg-elevated)";
				}}
				onMouseLeave={e => {
					if (!isActive) e.currentTarget.style.background = "transparent";
				}}
			>
				<span style={{ fontSize: 18, opacity: isActive ? 1 : 0.7 }}>{icon}</span>
				{label}
			</button>
		);
	};

	return (
		<div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 0", animation: "fadeInUp 0.4s ease" }}>
			
			<div style={{ marginBottom: 32 }}>
				<h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
					Account Settings
				</h1>
				<p style={{ fontSize: 15, color: "var(--text-muted)", margin: 0 }}>
					Manage your profile, security, and view your resume history.
				</p>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 32, alignItems: "start" }}>
				
				{/* === LEFT SIDEBAR === */}
				<aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
					
					{/* User Card */}
					<div style={{
						background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(99,102,241,0.05) 100%)",
						border: "1px solid var(--border-subtle)",
						borderRadius: "16px", padding: 20,
						display: "flex", flexDirection: "column", alignItems: "center", textCenter: "center"
					}}>
						<div style={{
							width: 64, height: 64, borderRadius: "50%",
							background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
							display: "flex", alignItems: "center", justifyContent: "center",
							fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 12,
							boxShadow: "0 8px 16px rgba(99,102,241,0.25)"
						}}>
							{user?.email?.charAt(0).toUpperCase() || "U"}
						</div>
						<div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", wordBreak: "break-all", textAlign: "center", lineHeight: 1.4 }}>
							{user?.email}
						</div>
						<div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>
							Member since {memberSince}
						</div>
					</div>

					{/* Navigation */}
					<nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
						<TabButton id="overview" icon="📊" label="Overview" />
						<TabButton id="resumes" icon="📄" label="My Resumes" />
						<TabButton id="security" icon="🔐" label="Security" />
						
						<div style={{ height: 1, background: "var(--border-subtle)", margin: "12px 0" }} />
						
						<button
							onClick={handleLogout}
							style={{
								display: "flex", alignItems: "center", gap: 12, width: "100%",
								padding: "12px 16px", borderRadius: "10px",
								background: "rgba(244,63,94,0.08)", color: "#fb7185",
								border: "1px solid rgba(244,63,94,0.2)", cursor: "pointer",
								fontSize: 14, fontWeight: 600, transition: "all 0.2s ease", textAlign: "left"
							}}
							onMouseEnter={e => e.currentTarget.style.background = "rgba(244,63,94,0.15)"}
							onMouseLeave={e => e.currentTarget.style.background = "rgba(244,63,94,0.08)"}
						>
							<span style={{ fontSize: 18, opacity: 0.9 }}>🚪</span>
							Log Out
						</button>
					</nav>
				</aside>

				{/* === RIGHT CONTENT === */}
				<main style={{ minHeight: 500 }}>
					
					{/* OVERVIEW TAB */}
					{activeTab === "overview" && (
						<div style={{ animation: "fadeIn 0.3s ease" }}>
							<h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 24px", color: "var(--text)" }}>Account Overview</h2>
							
							<div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
								<div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
									<div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(99,102,241,0.1)", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📄</div>
									<div style={{ minWidth: 0 }}>
										<div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{resumes.length}</div>
										<div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Total Resumes</div>
									</div>
								</div>
								<div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
									<div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(16,185,129,0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🔍</div>
									<div style={{ minWidth: 0 }}>
										<div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{totalAnalyses}</div>
										<div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Total Analyses</div>
									</div>
								</div>
								<div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
									<div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(245,158,11,0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>⭐</div>
									<div style={{ minWidth: 0 }}>
										<div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{bestScore}%</div>
										<div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Top Score</div>
									</div>
								</div>
							</div>

							<h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: "var(--text)" }}>Quick Actions</h3>
							<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
								<button className="btn btn-primary" onClick={() => navigate("/upload")} style={{ flex: "1 1 auto" }}>
									<span style={{ fontSize: 16 }}>⬆️</span> Upload New Resume
								</button>
								<button className="btn btn-secondary" onClick={() => navigate("/analysis")} style={{ flex: "1 1 auto" }}>
									<span style={{ fontSize: 16 }}>📊</span> Run Detailed Analysis
								</button>
							</div>
						</div>
					)}

					{/* MY RESUMES TAB */}
					{activeTab === "resumes" && (
						<div style={{ animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", height: "100%" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
								<div>
									<h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 6px", color: "var(--text)" }}>My Resumes</h2>
									<p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>View, manage, and analyze your uploaded resumes.</p>
								</div>
								
								<div style={{ position: "relative", width: 260 }}>
									<span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--text-muted)" }}>🔍</span>
									<input
										type="text"
										placeholder="Search resumes..."
										value={searchQuery}
										onChange={e => setSearchQuery(e.target.value)}
										style={{
											width: "100%", padding: "10px 10px 10px 36px",
											background: "var(--bg-elevated)", border: "1px solid var(--border)",
											borderRadius: 8, color: "var(--text)", fontSize: 13,
											outline: "none"
										}}
									/>
								</div>
							</div>

							{resumesLoading ? (
								<div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
									<div style={{ fontSize: 32, marginBottom: 12, animation: "spin 2s linear infinite" }}>⏳</div>
									<p>Loading your documents...</p>
								</div>
							) : filteredResumes.length === 0 ? (
								<div className="card" style={{ padding: 60, textAlign: "center", border: "1px dashed var(--border)" }}>
									<div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
									<h3 style={{ margin: "0 0 8px", color: "var(--text)" }}>{searchQuery ? "No matches found" : "No resumes uploaded"}</h3>
									<p style={{ margin: "0 0 24px", color: "var(--text-muted)", fontSize: 14 }}>
										{searchQuery ? "Try a different search term." : "Upload your first resume to start getting AI insights."}
									</p>
									{!searchQuery && (
										<button className="btn btn-primary" onClick={() => navigate("/upload")}>Upload Resume</button>
									)}
								</div>
							) : (
								<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
									{filteredResumes.map((resume) => {
										const filename = cleanName(resume.file_url?.split("/").pop());
										const resumeAnalyses = analyses[resume.id] || [];
										const isExpanded = expandedResumeId === resume.id;
										
										return (
											<div key={resume.id} style={{
												background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
												borderRadius: 12, overflow: "hidden", transition: "all 0.2s ease",
												boxShadow: isExpanded ? "0 8px 24px rgba(0,0,0,0.15)" : "none"
											}}>
												{/* Row Header */}
												<div
													style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: isExpanded ? "var(--bg-elevated)" : "transparent" }}
													onClick={() => fetchAnalyses(resume.id)}
												>
													<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
														<div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(99,102,241,0.1)", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
															📄
														</div>
														<div>
															<div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14, marginBottom: 2 }}>{filename}</div>
															<div style={{ fontSize: 12, color: "var(--text-muted)" }}>Uploaded {formatDate(resume.created_at)}</div>
														</div>
													</div>
													
													<div style={{ display: "flex", alignItems: "center", gap: 24 }}>
														{resumeAnalyses.length > 0 && (
															<div style={{ textAlign: "right" }}>
																<div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Best Score</div>
																<div style={{ fontSize: 15, fontWeight: 700, color: "var(--primary-light)" }}>
																	{Math.max(...resumeAnalyses.map(a => a.score || 0))}%
																</div>
															</div>
														)}
														<div style={{ color: "var(--text-muted)", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
															▼
														</div>
													</div>
												</div>

												{/* Expanded Detail Panel */}
												{isExpanded && (
													<div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
														
														<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px dashed var(--border-subtle)", marginBottom: 16 }}>
															<div>
																<div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>Analysis Runs</div>
																<div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{resumeAnalyses.length}</div>
															</div>
															<div style={{ display: "flex", gap: 8 }}>
																<button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenPdf(resume.file_url); }} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
																	👁️ View PDF
																</button>
																<button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); navigate("/analysis"); }}>
																	📊 Analyze
																</button>
																<button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); handleDeleteResume(resume.id); }} style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>
																	🗑️ Delete
																</button>
															</div>
														</div>

														{resumeAnalyses.length === 0 ? (
															<div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
																No analyses have been run for this resume yet.
															</div>
														) : (
															<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
																<div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>History</div>
																{resumeAnalyses.map(analysis => (
																	<div key={analysis.id} onClick={() => navigate("/results", { state: { analysis } })} style={{
																		display: "flex", alignItems: "center", justifyContent: "space-between",
																		padding: "12px 16px", borderRadius: 8, background: "var(--bg-elevated)",
																		border: "1px solid var(--border-subtle)", cursor: "pointer", transition: "border 0.2s"
																	}} onMouseEnter={e => e.currentTarget.style.borderColor="var(--primary)"} onMouseLeave={e => e.currentTarget.style.borderColor="var(--border-subtle)"}>
																		<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
																			<div style={{ background: `hsl(${analysis.score * 1.2}, 70%, 50%)`, color: "#fff", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, boxShadow: `0 0 10px rgba(0,0,0,0.2)` }}>
																				{analysis.score}%
																			</div>
																			<div>
																				<div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>Analysis Result</div>
																				<div style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatDate(analysis.created_at)}</div>
																			</div>
																		</div>
																		<div style={{ color: "var(--text-muted)", fontSize: 14 }}>➔</div>
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
					)}

					{/* SECURITY TAB */}
					{activeTab === "security" && (
						<div style={{ animation: "fadeIn 0.3s ease", maxWidth: 480 }}>
							<h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 24px", color: "var(--text)" }}>Security Update</h2>
							
							<div className="card" style={{ padding: 24 }}>
								<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
									<div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(244,63,94,0.1)", color: "#f43f5e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
										🔐
									</div>
									<div>
										<div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Change Password</div>
										<div style={{ fontSize: 13, color: "var(--text-muted)" }}>Ensure your account stays secure</div>
									</div>
								</div>
								
								<div style={{ padding: "12px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 20, fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 10 }}>
									<span style={{ color: "#10b981", fontSize: 16 }}>✓</span> Password protected account
								</div>
								
								<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
									<div>
										<label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Current Password</label>
										<input
											className="input" type="password" placeholder="Enter current password"
											value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
										/>
									</div>
									<div>
										<label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>New Password</label>
										<input
											className="input" type="password" placeholder="Enter new password"
											value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
										/>
									</div>
									<button
										className="btn btn-primary" onClick={handleChangePassword} disabled={passwordLoading}
										style={{ marginTop: 8 }}
									>
										{passwordLoading ? "Updating..." : "Update Password"}
									</button>
								</div>
							</div>
						</div>
					)}
				</main>
			</div>

			<style>{`
				@media (max-width: 820px) {
					[style*="grid-template-columns: 260px"] {
						grid-template-columns: 1fr !important;
					}
					aside {
						margin-bottom: 24px;
					}
				}
			`}</style>
		</div>
	);
}
