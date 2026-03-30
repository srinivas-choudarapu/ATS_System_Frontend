import { useLocation } from "react-router-dom";
import ScoreRing from "../components/ScoreRing";
import LockedSection from "../components/LockedSection";
import { useState } from "react";
import AuthDialog from "./AuthDialog";
import { useAuth } from "../state/auth";

export default function Results() {
	const { state } = useLocation();
	const base = state?.result || {};
	const { isAuthenticated } = useAuth();
	const [open, setOpen] = useState(false);

	return (
		<div className="stack" style={{ gap: 20 }}>
			<div className="card" style={{ padding: 20 }}>
				<div className="space-between">
					<div className="row" style={{ gap: 16 }}>
						<ScoreRing score={base.score ?? 0} />
						<div className="stack">
							<strong style={{ fontSize: 20, color: "var(--primary)" }}>Your ATS Score</strong>
							<div className="muted">Higher scores indicate better alignment to the job description.</div>
							<div className="row" style={{ gap: 16 }}>
								<Pill label="Skills" value={base.skillScore} />
								<Pill label="Experience" value={base.experienceScore} />
								<Pill label="Education" value={base.educationScore} />
								<Pill label="Keywords" value={base.keywordsScore} />
								<Pill label="Projects" value={base.projectScore} />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-2">
				<div className="card" style={{ padding: 20 }}>
					<div className="label">Basic Feedback</div>
					<ul className="stack" style={{ margin: 0, paddingLeft: 16 }}>
						{(base?.suggestions ?? []).slice(0, 3).map((s, i) => (
							<li key={i}>{s}</li>
						))}
						{(!base?.suggestions || base.suggestions.length === 0) && <li className="muted">No basic feedback available.</li>}
					</ul>
				</div>
				{isAuthenticated ? (
					<div className="card" style={{ padding: 20 }}>
						<div className="label">Keyword Gaps</div>
						<ul className="stack" style={{ margin: 0, paddingLeft: 16 }}>
							{(base?.missingSkills ?? []).map((s, i) => <li key={i}>{s}</li>)}
							{(!base?.missingSkills || base.missingSkills.length === 0) && <li className="muted">No gaps detected.</li>}
						</ul>
					</div>
				) : (
					<LockedSection onLogin={() => setOpen(true)} />
				)}
			</div>
			{open && <AuthDialog onClose={() => setOpen(false)} />}
		</div>
	);
}

function Pill({ label, value }) {
	return (
		<div className="row" style={{ border: "1px solid var(--border)", borderRadius: 999, padding: "6px 10px" }}>
			<span className="muted">{label}</span>
			<strong style={{ color: "var(--primary)" }}>{typeof value === "number" ? ` ${value}` : " —"}</strong>
		</div>
	);
}
