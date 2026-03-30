import { useEffect, useState } from "react";
import * as api from "../utils/api";

export default function Dashboard() {
	const [loading, setLoading] = useState(true);
	const [items, setItems] = useState([]);

	useEffect(() => {
		(async () => {
			try {
				const data = await api.getResumeHistory();
				setItems(data || []);
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

	return (
		<div className="stack" style={{ gap: 16 }}>
			<div className="space-between">
				<h2 style={{ margin: 0, color: "var(--primary)" }}>Dashboard</h2>
				<button className="btn btn-secondary btn-sm" onClick={handleDeleteAll}>Delete All</button>
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
								<td><a href={r.file_url} target="_blank" rel="noreferrer">View PDF</a></td>
								<td>
									<button className="btn btn-ghost btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
