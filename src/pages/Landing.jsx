import { Link, useNavigate } from "react-router-dom";

export default function Landing() {
	const navigate = useNavigate();
	return (
		<div className="stack" style={{ gap: 28 }}>
			<section className="hero">
				<div>
					<h1>Beat the ATS. Get hired faster.</h1>
					<p>Upload your resume and paste the job description. Get an instant ATS score with actionable feedback. No login required.</p>
					<div className="row" style={{ gap: 12 }}>
						<button className="btn btn-primary" onClick={() => navigate("/upload")}>Analyze Your Resume</button>
						<Link className="btn btn-secondary" to="/upload">Try with a sample</Link>
					</div>
				</div>
				<div className="card" style={{ padding: 20 }}>
					<div className="stack">
						<div className="label">Why ATS Analyzer?</div>
						<div className="row muted">• Corporate-grade scoring model</div>
						<div className="row muted">• Clear, structured suggestions</div>
						<div className="row muted">• Save history when you login</div>
					</div>
				</div>
			</section>
			<section className="grid grid-2">
				<div className="card" style={{ padding: 20 }}>
					<div className="label">How it works</div>
					<ol className="stack" style={{ margin: 0, paddingLeft: 16 }}>
						<li>Upload your PDF resume</li>
						<li>Paste the job description</li>
						<li>See your score and basic tips instantly</li>
						<li>Login to unlock full insights and save</li>
					</ol>
				</div>
				<div className="card" style={{ padding: 20 }}>
					<div className="label">Built for students and job seekers</div>
					<p className="muted" style={{ marginTop: 6 }}>
						Focused on clarity, keywords, and relevant experience to help you match modern hiring systems.
					</p>
				</div>
			</section>
		</div>
	);
}
