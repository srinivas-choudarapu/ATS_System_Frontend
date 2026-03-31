import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../utils/api";

export default function Upload() {
	const [file, setFile] = useState(null);
	const [drag, setDrag] = useState(false);
	const [jd, setJd] = useState("");
	const [loading, setLoading] = useState(false);
	const [saveToLibrary, setSaveToLibrary] = useState(true);
	const navigate = useNavigate();

	function onDrop(e) {
		e.preventDefault();
		setDrag(false);
		const f = e.dataTransfer.files?.[0];
		if (f) setFile(f);
	}

	async function submit() {
		if (!file || !jd.trim()) {
			window.__toast?.push({ type: "error", title: "Missing input", description: "Please attach a PDF and paste the job description." });
			return;
		}
		try {
			setLoading(true);
			const res = await api.uploadResume(file, jd, saveToLibrary);
			navigate("/results", { state: { result: res?.analysis, saved: saveToLibrary } });
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Upload failed", description: e.message });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="grid grid-2">
			<div className="card" style={{ padding: 20 }}>
				<div className="label">Resume (PDF)</div>
				<div
					className={`upload-drop ${drag ? "drag" : ""}`}
					onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
					onDragLeave={() => setDrag(false)}
					onDrop={onDrop}
				>
					<input
						type="file"
						accept="application/pdf"
						onChange={(e) => setFile(e.target.files?.[0] ?? null)}
					/>
					<div className="muted" style={{ marginTop: 8 }}>{file ? file.name : "Drag & drop or click to upload PDF"}</div>
				</div>
			</div>
			<div className="card" style={{ padding: 20 }}>
				<label className="label" htmlFor="jd">Job Description</label>
				<textarea id="jd" className="textarea" placeholder="Paste the job description here..." value={jd} onChange={(e) => setJd(e.target.value)} />
				<div style={{ marginTop: 12, marginBottom: 12 }}>
					<label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
						<input 
							type="checkbox" 
							checked={saveToLibrary} 
							onChange={(e) => setSaveToLibrary(e.target.checked)}
						/>
						<span>Save resume to my library</span>
					</label>
					{!saveToLibrary && (
						<div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
							📌 Resume will be analyzed but not saved. Results will be temporary.
						</div>
					)}
				</div>
				<div className="row" style={{ justifyContent: "flex-end" }}>
					<button className="btn btn-primary" onClick={submit} disabled={loading}>
						{loading ? "Analyzing..." : "Run Analysis"}
					</button>
				</div>
			</div>
		</div>
	);
}
