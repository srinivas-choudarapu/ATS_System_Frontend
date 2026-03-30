export default function ScoreRing({ score = 0 }) {
	const clamped = Math.max(0, Math.min(100, score));
	const circumference = 2 * Math.PI * 60;
	const offset = circumference - (clamped / 100) * circumference;
	const color = clamped >= 75 ? "#16a34a" : clamped >= 50 ? "#f59e0b" : "#dc2626";
	return (
		<div className="score-ring">
			<svg width="140" height="140">
				<circle cx="70" cy="70" r="60" stroke="#eef2f7" strokeWidth="12" fill="none" />
				<circle
					cx="70" cy="70" r="60"
					stroke={color}
					strokeWidth="12"
					fill="none"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					transform="rotate(-90 70 70)"
				/>
			</svg>
			<div className="value">{clamped}</div>
		</div>
	);
}
