import { useEffect, useState } from "react";
import * as api from "../utils/api";
import { isExpiredS3SignedUrl } from "../utils/s3Url";

export default function Dashboard() {
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
			setItems((list) => list.filter((x) => x.id !== id));
			window.__toast?.push({ type: "success", title: "Deleted", description: "Resume removed." });
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Delete failed", description: e.message });
		}
	}

	async function handleDeleteAll() {
		try {
			await api.deleteAllResumes();
			setItems([]);
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
		<div className="stack" style={{ gap: 16 }}>
			<div className="space-between">
				<h2 style={{ margin: 0, color: "var(--primary)" }}>Dashboard</h2>
				<button className="btn btn-secondary btn-sm" onClick={handleDeleteAll}>Delete All</button>
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
