import { useEffect, useState } from "react";
import * as api from "../utils/api";
import { isExpiredS3SignedUrl } from "../utils/s3Url";

export default function Analysis() {
	const [loading, setLoading] = useState(true);
	const [resumes, setResumes] = useState([]);
	const [analyses, setAnalyses] = useState([]);
	const [selectedAnalysis, setSelectedAnalysis] = useState(null);
	const [runningAnalysis, setRunningAnalysis] = useState(false);
	const [selectedResumeForAnalysis, setSelectedResumeForAnalysis] = useState(null);
	const [jdForAnalysis, setJdForAnalysis] = useState("");

	useEffect(() => {
		(async () => {
			try {
				// Step 1: Get all resumes
				const allResumes = await api.getAllResumes();
				setResumes(allResumes || []);
				let allAnalyses = [];

				// Step 2: For each resume, get all analyses
				for (const resume of allResumes) {
					try {
						const analysisResults = await api.getAnalysisByResumeId(resume.id);
						if (analysisResults && analysisResults.length > 0) {
							allAnalyses = allAnalyses.concat(
								analysisResults.map((a) => ({
									...a,
									resume_id: resume.id,
									resume_name: resume.file_url?.split("/").pop() || "Unknown Resume",
									resume_file_url: resume.file_url
								}))
							);
						}
					} catch (e) {
						console.error(`Failed to fetch analysis for resume ${resume.id}:`, e);
					}
				}

				// Sort by created_at descending
				allAnalyses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
				setAnalyses(allAnalyses);
			} catch (e) {
				window.__toast?.push({ type: "error", title: "Failed to load", description: e.message });
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	function handleOpenPdf(item) {
		const fileUrl = item?.resume_file_url || item?.file_url;
		if (!fileUrl) {
			window.__toast?.push({ type: "error", title: "File unavailable", description: "PDF URL is missing." });
			return;
		}

		if (isExpiredS3SignedUrl(fileUrl)) {
			window.__toast?.push({
				type: "error",
				title: "Link expired",
				description: "This PDF link has expired. Re-upload the resume to generate a fresh link."
			});
			return;
		}

		window.open(fileUrl, "_blank", "noopener,noreferrer");
	}

	async function handleRunAnalysis() {
		if (!selectedResumeForAnalysis || !jdForAnalysis.trim()) {
			window.__toast?.push({ type: "error", title: "Missing input", description: "Please select a resume and enter a job description." });
			return;
		}

		try {
			setRunningAnalysis(true);
			const res = await api.runAnalysis(selectedResumeForAnalysis.id, jdForAnalysis);
			setAnalyses([
				{
					...res.analysis,
					resume_id: selectedResumeForAnalysis.id,
					resume_name: selectedResumeForAnalysis.file_url?.split("/").pop() || "Unknown Resume",
					resume_file_url: selectedResumeForAnalysis.file_url
				},
				...analyses
			]);
			window.__toast?.push({ type: "success", title: "Analysis completed", description: "New analysis added to history." });
			setSelectedResumeForAnalysis(null);
			setJdForAnalysis("");
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Analysis failed", description: e.message });
		} finally {
			setRunningAnalysis(false);
		}
	}

	async function handleViewJD(analysis) {
		try {
			const jdData = await api.getJDByAnalysisId(analysis.id);
			const jdText = jdData?.jd_text || analysis.jd_text || "No job description available";
			downloadJDAsText(jdText, `JD_${analysis.id}`);
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed to fetch JD", description: e.message });
		}
	}

	function downloadJDAsText(text, filename) {
		const element = document.createElement("a");
		const file = new Blob([text], { type: "text/plain" });
		element.href = URL.createObjectURL(file);
		element.download = `${filename}.txt`;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}

	async function handleDelete(analysisId) {
		try {
			await api.deleteAnalysis(analysisId);
			setAnalyses((list) => list.filter((a) => a.id !== analysisId));
			window.__toast?.push({ type: "success", title: "Deleted", description: "Analysis removed." });
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Delete failed", description: e.message });
		}
	}

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 0" }}>
			{/* Page Header */}
			<div style={{ marginBottom: 40 }}>
				<h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px", color: "#667eea" }}>Analysis Dashboard</h1>
				<p style={{ fontSize: 15, color: "var(--muted)", margin: 0 }}>Review and analyze your resumes against job descriptions</p>
			</div>

			{/* Analysis Form Modal - Full Width */}
			{selectedResumeForAnalysis && (
				<div className="card" style={{ 
					padding: 24, 
					background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
					borderLeft: "4px solid #667eea",
					marginBottom: 24,
					boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
					transition: "all 0.3s ease"
				}}>
					<div className="space-between" style={{ marginBottom: 20 }}>
						<div>
							<h3 style={{ margin: 0, color: "#667eea", fontSize: 20, fontWeight: 600 }}>
								📋 Run Analysis
							</h3>
							<p style={{ fontSize: 13, color: "var(--muted)", margin: "8px 0 0 0" }}>
								{selectedResumeForAnalysis.file_url?.split("/").pop() || "Resume"}
							</p>
						</div>
						<button
							className="btn btn-ghost btn-sm"
							onClick={() => {
								setSelectedResumeForAnalysis(null);
								setJdForAnalysis("");
							}}
							style={{ color: "#667eea" }}
						>
							✕ Close
						</button>
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "flex-end" }}>
						<div>
							<label className="label" htmlFor="jd-input" style={{ fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>Job Description</label>
							<textarea
								id="jd-input"
								className="textarea"
								placeholder="Paste the job description here..."
								value={jdForAnalysis}
								onChange={(e) => setJdForAnalysis(e.target.value)}
								style={{ maxHeight: 120, padding: 12, borderColor: "#667eea40" }}
							/>
						</div>
						<button
							className="btn btn-primary"
							onClick={handleRunAnalysis}
							disabled={runningAnalysis || !jdForAnalysis.trim()}
							style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", fontWeight: 600 }}
						>
							{runningAnalysis ? "⏳ Running..." : "▶ Run"}
						</button>
					</div>
				</div>
			)}

			{/* Main Two Column Layout */}
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 32 }}>
				{/* Left: Saved Resumes */}
				<div>
					<div style={{ marginBottom: 24 }}>
						<h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "var(--text)" }}>
							📄 Saved Resumes
						</h2>
						<p style={{ color: "var(--muted)", margin: "8px 0 0 0", fontSize: 13 }}>
							{loading ? "Loading..." : `${resumes.length} resume${resumes.length !== 1 ? "s" : ""}`}
						</p>
					</div>

					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						{loading ? (
							<div className="card" style={{ textAlign: "center", padding: 40, background: "#f8f9fa", borderLeft: "4px solid #667eea40" }}>
								<div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
								<div style={{ color: "var(--muted)", fontSize: 14 }}>Loading your resumes...</div>
							</div>
						) : resumes.length === 0 ? (
							<div className="card" style={{ textAlign: "center", padding: 40, background: "#f8f9fa" }}>
								<div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
								<div style={{ color: "var(--text)", fontSize: 15, fontWeight: 500, marginBottom: 8 }}>No saved resumes yet</div>
								<div style={{ fontSize: 13, color: "var(--muted)" }}>Upload a resume to get started</div>
							</div>
						) : (
							resumes.map((resume, idx) => {
								const colors = [
									{ gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
									{ gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
									{ gradient: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)" },
									{ gradient: "linear-gradient(135deg, #f5576c 0%, #ffa751 100%)" }
								];
								const resumeColor = colors[idx % colors.length];

								return (
									<div 
										key={resume.id} 
										className="card" 
										style={{ 
											padding: 0,
											overflow: "hidden",
											display: "flex", 
											flexDirection: "column",
											transition: "all 0.3s ease",
											cursor: "pointer"
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
										<div
											style={{
												padding: 16,
												background: resumeColor.gradient,
												color: "white"
											}}
										>
											<div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>
												📅 {new Date(resume.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
											</div>
											<div style={{ fontSize: 14, fontWeight: 600, wordBreak: "break-word" }}>
												{resume.file_url?.split("/").pop() || "Resume"}
											</div>
										</div>
										<div style={{ padding: 16, display: "flex", gap: 8 }}>
											<button
												className="btn"
												onClick={() => handleOpenPdf(resume)}
												style={{ flex: 1, background: "#667eea", color: "white", border: "none", fontSize: 13, fontWeight: 500 }}
											>
												👁️ Preview
											</button>
											<button
												className="btn"
												onClick={() => setSelectedResumeForAnalysis(resume)}
												style={{ flex: 1, background: "#f093fb", color: "white", border: "none", fontSize: 13, fontWeight: 500 }}
											>
												🔍 Analyze
											</button>
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>

				{/* Right: Analysis History */}
				<div>
					<div style={{ marginBottom: 24 }}>
						<h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "var(--text)" }}>
							📊 Analysis History
						</h2>
						<p style={{ color: "var(--muted)", margin: "8px 0 0 0", fontSize: 13 }}>
							{loading ? "Loading..." : `${analyses.length} analysis(es)`}
						</p>
					</div>

					{analyses.length === 0 ? (
						<div className="card" style={{ textAlign: "center", padding: 40, background: "#f8f9fa" }}>
							<div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
							<div style={{ color: "var(--text)", fontSize: 15, fontWeight: 500, marginBottom: 8 }}>No analyses yet</div>
							<div style={{ fontSize: 13, color: "var(--muted)" }}>Select a resume and run an analysis</div>
						</div>
					) : (
						<div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "75vh", overflowY: "auto", paddingRight: 8 }}>
							{analyses.map((analysis) => {
								const scoreColor = analysis.score >= 75 ? "#00c853" : analysis.score >= 50 ? "#ffa726" : "#f44336";
								return (
									<div 
										key={analysis.id} 
										className="card" 
										style={{ 
											padding: 16,
											borderLeft: `4px solid ${scoreColor}`,
											transition: "all 0.3s ease",
											cursor: "pointer"
										}}
										onClick={() => setSelectedAnalysis(analysis)}
										onMouseEnter={(e) => {
											e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
											e.currentTarget.style.transform = "translateX(4px)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.boxShadow = "var(--shadow)";
											e.currentTarget.style.transform = "translateX(0)";
										}}
									>
										{/* Resume & Score Header */}
										<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
											<div style={{ flex: 1 }}>
												<div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
													{analysis.resume_name}
												</div>
											</div>
											<div style={{ 
												fontSize: 18, 
												fontWeight: "bold", 
												color: "white",
												background: scoreColor,
												padding: "6px 12px",
												borderRadius: 6,
												minWidth: 55,
												textAlign: "center"
											}}>
												{analysis.score}%
											</div>
										</div>

										{/* Score Breakdown Grid */}
										<div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 12 }}>
											<div style={{ 
												background: "linear-gradient(135deg, #667eea15 0%, #667eea05 100%)",
												padding: 10,
												borderRadius: 6,
												borderLeft: "3px solid #667eea"
											}}>
												<div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 3 }}>Skills</div>
												<div style={{ fontWeight: 700, color: "#667eea", fontSize: 14 }}>{analysis.skill_score}%</div>
											</div>
											<div style={{ 
												background: "linear-gradient(135deg, #f093fb15 0%, #f093fb05 100%)",
												padding: 10,
												borderRadius: 6,
												borderLeft: "3px solid #f093fb"
											}}>
												<div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 3 }}>Experience</div>
												<div style={{ fontWeight: 700, color: "#f093fb", fontSize: 14 }}>{analysis.experience_score}%</div>
											</div>
											<div style={{ 
												background: "linear-gradient(135deg, #00d4ff15 0%, #00d4ff05 100%)",
												padding: 10,
												borderRadius: 6,
												borderLeft: "3px solid #00d4ff"
											}}>
												<div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 3 }}>Education</div>
												<div style={{ fontWeight: 700, color: "#00d4ff", fontSize: 14 }}>{analysis.education_score}%</div>
											</div>
											<div style={{ 
												background: "linear-gradient(135deg, #ffa75115 0%, #ffa75105 100%)",
												padding: 10,
												borderRadius: 6,
												borderLeft: "3px solid #ffa751"
											}}>
												<div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 3 }}>Keywords</div>
												<div style={{ fontWeight: 700, color: "#ffa751", fontSize: 14 }}>{analysis.keyword_score}%</div>
											</div>
										</div>

										{/* Date */}
										<div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
											🕒 {new Date(analysis.created_at).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
										</div>

										{/* Actions */}
										<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
											<button
												className="btn"
												onClick={(e) => { e.stopPropagation(); handleOpenPdf(analysis); }}
												style={{ fontSize: 11, background: "#667eea", color: "white", border: "none", padding: "6px 8px", borderRadius: 4 }}
											>
												📄 PDF
											</button>
											<button
												className="btn"
												onClick={(e) => { e.stopPropagation(); setSelectedAnalysis(analysis); }}
												style={{ fontSize: 11, background: "#00d4ff", color: "white", border: "none", padding: "6px 8px", borderRadius: 4 }}
											>
												📈 Details
											</button>
											<button
												className="btn"
												onClick={(e) => { e.stopPropagation(); handleDelete(analysis.id); }}
												style={{ fontSize: 11, background: "#ffb3ba", color: "#d32f2f", border: "none", padding: "6px 8px", borderRadius: 4, fontWeight: 500 }}
											>
												🗑 Delete
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* Details Modal - Full Width */}
			{selectedAnalysis && (
				<div style={{ marginTop: 32 }}>
					<div className="card" style={{ padding: 24, borderLeft: "4px solid #667eea" }}>
						<div className="space-between" style={{ marginBottom: 24 }}>
							<h3 style={{ margin: 0, color: "#667eea", fontSize: 22, fontWeight: 600 }}>📊 Analysis Details</h3>
							<button
								className="btn btn-ghost btn-sm"
								onClick={() => setSelectedAnalysis(null)}
								style={{ color: "#667eea" }}
							>
								✕ Close
							</button>
						</div>

						<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
							<div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: 20, borderRadius: 12, color: "white" }}>
								<div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>Overall Score</div>
								<div style={{ fontSize: 32, fontWeight: "bold" }}>{selectedAnalysis.score}%</div>
							</div>
							<div style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", padding: 20, borderRadius: 12, color: "white" }}>
								<div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>Skill Match</div>
								<div style={{ fontSize: 32, fontWeight: "bold" }}>{selectedAnalysis.skill_score}%</div>
							</div>
							<div style={{ background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)", padding: 20, borderRadius: 12, color: "white" }}>
								<div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>Experience</div>
								<div style={{ fontSize: 32, fontWeight: "bold" }}>{selectedAnalysis.experience_score}%</div>
							</div>
							<div style={{ background: "linear-gradient(135deg, #f5576c 0%, #f5576c 100%)", padding: 20, borderRadius: 12, color: "white" }}>
								<div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>Education</div>
								<div style={{ fontSize: 32, fontWeight: "bold" }}>{selectedAnalysis.education_score}%</div>
							</div>
							<div style={{ background: "linear-gradient(135deg, #f5576c 0%, #f5576c 100%)", padding: 20, borderRadius: 12, color: "white" }}>
								<div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>Keywords</div>
								<div style={{ fontSize: 32, fontWeight: "bold" }}>{selectedAnalysis.keyword_score}%</div>
							</div>
						</div>

						{selectedAnalysis.missing_skills && selectedAnalysis.missing_skills.length > 0 && (
						<div style={{ marginBottom: 20, background: "linear-gradient(135deg, #fff3e015 0%, #fff3e005 100%)", padding: 16, borderRadius: 8, borderLeft: "4px solid #f5576c" }}>
							<h4 style={{ margin: "0 0 12px 0", color: "#f5576c", fontSize: 14, fontWeight: 600 }}>⚠️ Missing Skills</h4>
							<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
								{selectedAnalysis.missing_skills.map((skill, i) => (
									<span 
										key={i}
										style={{ 
											background: "linear-gradient(135deg, #f5576c 0%, #f5576c 100%)",
												padding: "6px 12px", 
												borderRadius: 6,
												fontSize: 12,
												fontWeight: 500
											}}
										>
											{skill}
										</span>
									))}
								</div>
							</div>
						)}

						{selectedAnalysis.suggestions && selectedAnalysis.suggestions.length > 0 && (
							<div style={{ marginBottom: 20, background: "linear-gradient(135deg, #e3f2fd15 0%, #e3f2fd05 100%)", padding: 16, borderRadius: 8, borderLeft: "4px solid #667eea" }}>
								<h4 style={{ margin: "0 0 12px 0", color: "#667eea", fontSize: 14, fontWeight: 600 }}>💡 Suggestions</h4>
								<ul style={{ margin: 0, paddingLeft: 20 }}>
									{selectedAnalysis.suggestions.map((suggestion, i) => (
										<li key={i} style={{ marginBottom: 10, lineHeight: 1.6, color: "var(--text)", fontSize: 13 }}>{suggestion}</li>
									))}
								</ul>
							</div>
						)}

						{selectedAnalysis.jd_text && (
							<div style={{ marginBottom: 20, background: "linear-gradient(135deg, #f3e5f515 0%, #f3e5f505 100%)", padding: 16, borderRadius: 8, borderLeft: "4px solid #9c27b0" }}>
								<h4 style={{ margin: "0 0 12px 0", color: "#764ba2", fontSize: 14, fontWeight: 600 }}>📋 Job Description</h4>
								<p
									style={{
										background: "white",
										padding: 12,
										borderRadius: 6,
										fontSize: 13,
										whiteSpace: "pre-wrap",
										maxHeight: 400,
										overflow: "auto",
										margin: 0,
										lineHeight: 1.6,
										color: "var(--text)",
										border: "1px solid #e0e0e0"
									}}
								>
									{selectedAnalysis.jd_text}
								</p>
							</div>
						)}

						{selectedAnalysis.resume_file_url && (
							<button
								className="btn"
								onClick={() => handleOpenPdf(selectedAnalysis)}
								style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", padding: "12px 20px", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
							>
								📄 View Resume PDF
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
