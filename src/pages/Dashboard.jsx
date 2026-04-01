import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../utils/api";
import { isExpiredS3SignedUrl } from "../utils/s3Url";

export default function Dashboard() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [allItems, setAllItems] = useState([]);
	const [items, setItems] = useState([]);
	const [filters, setFilters] = useState({
		startDate: '',
		endDate: ''
	});
	const [showModal, setShowModal] = useState(false);
	const [modalType, setModalType] = useState(''); // 'details' or 'analyses'
	const [selectedResume, setSelectedResume] = useState(null);
	const [analyses, setAnalyses] = useState([]);
	const [selectedAnalysis, setSelectedAnalysis] = useState(null);

	useEffect(() => {
		loadResumes();
	}, []);

	useEffect(() => {
		applyFilters();
	}, [allItems, filters]);

	async function loadResumes() {
		setLoading(true);
		try {
			const data = await api.getResumeHistory();
			setAllItems(data || []);
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed to load", description: e.message });
		} finally {
			setLoading(false);
		}
	}

	function applyFilters() {
		let filtered = allItems;
		if (filters.startDate) {
			const start = new Date(filters.startDate);
			filtered = filtered.filter(r => new Date(r.created_at) >= start);
		}
		if (filters.endDate) {
			const end = new Date(filters.endDate);
			end.setHours(23, 59, 59, 999); // end of day
			filtered = filtered.filter(r => new Date(r.created_at) <= end);
		}
		setItems(filtered);
	}

	function handleFilterChange(key, value) {
		setFilters(prev => ({ ...prev, [key]: value }));
	}

	function handleClearFilters() {
		setFilters({
			startDate: '',
			endDate: ''
		});
	}

	async function handleViewDetails(id) {
		try {
			const resume = await api.getResumeById(id);
			setSelectedResume(resume);
			setModalType('details');
			setShowModal(true);
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed to load details", description: e.message });
		}
	}

	async function handleViewAnalyses(id) {
		try {
			const analysesData = await api.getAnalysisByResumeId(id);
			setAnalyses(analysesData || []);
			setModalType('analyses');
			setShowModal(true);
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed to load analyses", description: e.message });
		}
	}

	function closeModal() {
		setShowModal(false);
		setSelectedResume(null);
		setAnalyses([]);
		setSelectedAnalysis(null);
	}

	async function handleViewAnalysisDetails(id) {
		try {
			const analysis = await api.getAnalysisById(id);
			setSelectedAnalysis(analysis);
			setModalType('analysisDetails');
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed to load analysis", description: e.message });
		}
	}

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

	function handleOpenPdf(resume) {
		if (!resume?.file_url) {
			window.__toast?.push({ type: "error", title: "File unavailable", description: "PDF URL is missing." });
			return;
		}

		if (isExpiredS3SignedUrl(resume.file_url)) {
			window.__toast?.push({
				type: "error",
				title: "Link expired",
				description: "This PDF link has expired. Re-upload the resume to generate a fresh link."
			});
			return;
		}

		window.open(resume.file_url, "_blank", "noopener,noreferrer");
	}

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
									<polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
								</svg>
								Clear All
							</button>
						)}
						<button className="btn btn-primary btn-sm" onClick={() => navigate("/upload")}>
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
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
			<div className="card" style={{ padding: 16 }}>
				<h3>Filters</h3>
				<div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
					<div>
						<label>Start Date</label>
						<input
							type="date"
							value={filters.startDate}
							onChange={(e) => handleFilterChange('startDate', e.target.value)}
						/>
					</div>
					<div>
						<label>End Date</label>
						<input
							type="date"
							value={filters.endDate}
							onChange={(e) => handleFilterChange('endDate', e.target.value)}
						/>
					</div>
				</div>
				<div style={{ marginTop: 16 }}>
					<button className="btn btn-ghost btn-sm" onClick={handleClearFilters}>Clear Filters</button>
				</div>
			</div>
			<div className="card" style={{ padding: 0 }}>
				<table className="table">
					<thead>
						<tr>
							<th>Created</th>
							<th>File</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td colSpan="3" className="muted">Loading...</td></tr>
						) : items.length === 0 ? (
							<tr><td colSpan="3" className="muted">No resumes yet.</td></tr>
						) : items.map((r) => (
							<tr key={r.id}>
								<td>{new Date(r.created_at).toLocaleString()}</td>
								<td><button className="btn btn-ghost btn-sm" onClick={() => handleOpenPdf(r)}>View PDF</button></td>
								<td>
									<button className="btn btn-ghost btn-sm" onClick={() => handleViewDetails(r.id)}>Details</button>
									<button className="btn btn-ghost btn-sm" onClick={() => handleViewAnalyses(r.id)} style={{ marginLeft: 8 }}>Analyses</button>
									<button className="btn btn-ghost btn-sm" onClick={() => handleDelete(r.id)} style={{ marginLeft: 8 }}>Delete</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{showModal && (
				<div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000 }}>
					<div className="modal-content" style={{ backgroundColor: 'white', margin: '5% auto', padding: 20, border: '1px solid #888', width: '80%', maxHeight: '80%', overflowY: 'auto' }}>
						<span className="close" onClick={closeModal} style={{ color: '#aaa', float: 'right', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer' }}>&times;</span>
						{modalType === 'details' && selectedResume && (
							<div>
								<h3>Resume Details</h3>
								<p><strong>ID:</strong> {selectedResume.id}</p>
								<p><strong>Created:</strong> {new Date(selectedResume.created_at).toLocaleString()}</p>
								<p><strong>Parsed Text:</strong></p>
								<pre style={{ whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>{selectedResume.parsed_text}</pre>
							</div>
						)}
						{modalType === 'analyses' && (
							<div>
								<h3>Analyses for Resume</h3>
								{analyses.length === 0 ? (
									<p>No analyses found.</p>
								) : (
									analyses.map((analysis) => (
										<div key={analysis.id} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 10 }}>
											<p><strong>Analysis ID:</strong> {analysis.id}</p>
											<p><strong>Score:</strong> {analysis.score}%</p>
											<p><strong>JD Text:</strong> {analysis.jd_text.substring(0, 100)}...</p>
											<p><strong>Missing Skills:</strong> {analysis.missing_skills?.join(', ') || 'None'}</p>
											<p><strong>Suggestions:</strong> {analysis.suggestions?.join(', ') || 'None'}</p>
											<button className="btn btn-primary btn-sm" onClick={() => handleViewAnalysisDetails(analysis.id)}>View Full Analysis</button>
										</div>
									))
								)}
							</div>
						)}
						{modalType === 'analysisDetails' && selectedAnalysis && (
							<div>
								<h3>Analysis Details</h3>
								<p><strong>ID:</strong> {selectedAnalysis.id}</p>
								<p><strong>Resume ID:</strong> {selectedAnalysis.resume_id}</p>
								<p><strong>Score:</strong> {selectedAnalysis.score}%</p>
								<p><strong>Skill Score:</strong> {selectedAnalysis.skill_score}%</p>
								<p><strong>Experience Score:</strong> {selectedAnalysis.experience_score}%</p>
								<p><strong>Education Score:</strong> {selectedAnalysis.education_score}%</p>
								<p><strong>Keyword Score:</strong> {selectedAnalysis.keyword_score}%</p>
								<p><strong>Project Score:</strong> {selectedAnalysis.project_score}%</p>
								<p><strong>JD Text:</strong></p>
								<pre style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>{selectedAnalysis.jd_text}</pre>
								<p><strong>Missing Skills:</strong> {selectedAnalysis.missing_skills?.join(', ') || 'None'}</p>
								<p><strong>Suggestions:</strong> {selectedAnalysis.suggestions?.join(', ') || 'None'}</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
