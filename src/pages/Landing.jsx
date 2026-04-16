import { Link, useNavigate } from "react-router-dom";

export default function Landing() {
	const navigate = useNavigate();

	return (
		<div className="stack animate-fade-up" style={{ gap: 80, paddingBottom: 60 }}>
			
			{/* HERO SECTION */}
			<section className="hero" style={{ 
				textAlign: "center", 
				display: "flex", 
				flexDirection: "column", 
				alignItems: "center", 
				padding: "80px 20px 40px",
                position: "relative",
                gridTemplateColumns: "1fr",
                gap: 0
			}}>
                <div style={{
                    position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
                    width: "100%", maxWidth: 800, height: 400,
                    background: "radial-gradient(ellipse at top, rgba(99,102,241,0.15) 0%, transparent 70%)",
                    pointerEvents: "none", zIndex: -1
                }}></div>

				<div className="badge badge-primary" style={{ marginBottom: 24, padding: "6px 14px", fontSize: 13 }}>
					✨ ATS Intelligence Engine 2.0 is live
				</div>
				<h1 style={{ 
					fontSize: "clamp(48px, 6vw, 72px)", 
					fontWeight: 900, 
					letterSpacing: "-2px", 
					lineHeight: 1.1,
					maxWidth: 900, 
					margin: "0 0 24px",
					background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent"
				}}>
					Beat the ATS.<br/>Land the Interview.
				</h1>
				<p style={{ 
					fontSize: 18, 
					color: "var(--text-secondary)", 
					maxWidth: 600, 
					margin: "0 0 40px", 
					lineHeight: 1.6 
				}}>
					Upload your resume and paste your target job description. Our AI analyzes your match rate and gives actionable keyword recommendations in seconds.
				</p>
				<div className="row" style={{ gap: 16, justifyContent: "center" }}>
					<button className="btn btn-primary btn-lg" onClick={() => navigate("/upload")} style={{ padding: "16px 32px", fontSize: 16 }}>
						Start Analyzing for Free
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
							<line x1="5" y1="12" x2="19" y2="12" />
							<polyline points="12 5 19 12 12 19" />
						</svg>
					</button>
				</div>
                
                {/* Hero Dashboard Preview Graphic */}
                <div style={{ marginTop: 60, width: "100%", maxWidth: 1000, borderRadius: 20, padding: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                    <div style={{ width: "100%", height: 360, borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ height: 48, borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", padding: "0 20px", gap: 8, background: "rgba(10,15,30,0.5)" }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }}></div>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }}></div>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }}></div>
                            <div style={{ marginLeft: 16, fontSize: 13, color: "var(--text-muted)", fontFamily: "monospace" }}>app.atsanalyzer.com/report/10492</div>
                        </div>
                        <div className="flex-responsive" style={{ flex: 1, padding: 32, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
                            
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                                <div style={{ height: 160, borderRadius: 12, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                                    <div style={{ fontSize: 48, fontWeight: 800, color: "var(--emerald-light)" }}>94%</div>
                                    <div style={{ fontSize: 13, color: "var(--emerald)", fontWeight: 600, textTransform: "uppercase" }}>Excellent Match</div>
                                </div>
                                <div style={{ height: 24, width: "60%", background: "var(--bg-elevated)", borderRadius: 4 }}></div>
                                <div style={{ height: 12, width: "80%", background: "var(--bg-elevated)", borderRadius: 4 }}></div>
                                <div style={{ height: 12, width: "40%", background: "var(--bg-elevated)", borderRadius: 4 }}></div>
                            </div>

                            <div style={{ flex: 1.5, display: "flex", flexDirection: "column", gap: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(16,185,129,0.1)", borderRadius: 8, borderLeft: "3px solid var(--emerald)" }}>
                                    <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>Kubernetes</span>
                                    <span style={{ fontSize: 12, color: "var(--emerald-light)" }}>Found in Experience</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(244,63,94,0.1)", borderRadius: 8, borderLeft: "3px solid var(--rose)" }}>
                                    <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>CI/CD Pipelines</span>
                                    <span style={{ fontSize: 12, color: "var(--rose-light)" }}>Missing Keyword</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(16,185,129,0.1)", borderRadius: 8, borderLeft: "3px solid var(--emerald)" }}>
                                    <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>TypeScript</span>
                                    <span style={{ fontSize: 12, color: "var(--emerald-light)" }}>Found in Skills</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(245,158,11,0.1)", borderRadius: 8, borderLeft: "3px solid var(--amber)" }}>
                                    <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>Leadership</span>
                                    <span style={{ fontSize: 12, color: "var(--amber-light)" }}>Low occurrences</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
			</section>

			{/* FEATURES GRID SECTION */}
			<section style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
				<div style={{ textAlign: "center", marginBottom: 48 }}>
					<h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Corporate-grade intelligence.</h2>
					<p style={{ color: "var(--text-secondary)", fontSize: 16 }}>Everything you need to optimize your resume and bypass parsing filters.</p>
				</div>
                
				<div className="grid grid-3">
					<div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-light)" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </div>
						<h3 style={{ fontSize: 18, fontWeight: 700 }}>Keyword Analysis</h3>
						<p className="muted" style={{ fontSize: 14 }}>We scan job descriptions to extract the most crucial hard skills, soft skills, and action verbs the ATS is looking for.</p>
					</div>

					<div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--emerald-light)" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                        </div>
						<h3 style={{ fontSize: 18, fontWeight: 700 }}>Real-time Scoring</h3>
						<p className="muted" style={{ fontSize: 14 }}>Get an instant percentage score reflecting your resume's match probability against exact job requirements.</p>
					</div>

					<div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber-light)" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
						<h3 style={{ fontSize: 18, fontWeight: 700 }}>Privacy by Design</h3>
						<p className="muted" style={{ fontSize: 14 }}>Security matters. Try it without an account, or log in to safely store and manage your analysis history.</p>
					</div>
				</div>
			</section>

			{/* HOW IT WORKS SECTION */}
			<section style={{ maxWidth: 1200, margin: "60px auto 0", width: "100%" }}>
                <div className="card p-responsive" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-bright)" }}>
                    <div className="grid grid-2" style={{ alignItems: "center", gap: 60 }}>
                        <div>
                            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>How to optimize.</h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32 }}>Three simple steps to bypass the robot filters and get your resume in front of human eyes.</p>
                            
                            <div className="stack" style={{ gap: 24 }}>
                                <div style={{ display: "flex", gap: 16 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>1</div>
                                    <div>
                                        <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Upload your resume document</h4>
                                        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Upload your latest PDF. We parse it just like the hiring systems do.</p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 16 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>2</div>
                                    <div>
                                        <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Paste the Job Description</h4>
                                        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Copy the exact text from LinkedIn, Indeed, or the career site into the analyzer.</p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 16 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99, 102, 241, 0.15)", border: "1px solid var(--primary)", color: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>3</div>
                                    <div>
                                        <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Apply the AI Suggestions</h4>
                                        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>See your match score and read plain-english instructions on what missing words to add.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                            {/* Decorative Document Graphics */}
                            <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, background: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 60%)", pointerEvents: "none" }}></div>
                            
                            <div style={{ width: "100%", maxWidth: 330, background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-bright)", boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.15)", padding: 32, display: "flex", flexDirection: "column", gap: 12, position: "relative", transform: "rotate(3deg) translateY(-10px)", transition: "transform 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "rotate(0deg) translateY(-15px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "rotate(3deg) translateY(-10px)"}>
                                <div style={{ position: "absolute", top: -20, right: -20, width: 64, height: 64, background: "var(--emerald)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18, boxShadow: "0 10px 20px rgba(16,185,129,0.4)", border: "4px solid var(--bg-card)", zIndex: 2 }}>
                                    94%
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Sr. Product Designer</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>John Doe • San Francisco, CA</div>
                                
                                <div style={{ padding: "10px 12px", background: "rgba(16,185,129,0.1)", borderLeft: "3px solid var(--emerald)", borderRadius: 6, fontSize: 12, color: "var(--text)", fontWeight: 600 }}>
                                    Design Systems <span style={{ color: "var(--emerald-light)", float: "right" }}>✓ Found</span>
                                </div>
                                <div style={{ padding: "10px 12px", background: "rgba(16,185,129,0.1)", borderLeft: "3px solid var(--emerald)", borderRadius: 6, fontSize: 12, color: "var(--text)", fontWeight: 600 }}>
                                    Figma Prototyping <span style={{ color: "var(--emerald-light)", float: "right" }}>✓ Found</span>
                                </div>
                                <div style={{ padding: "10px 12px", background: "rgba(244,63,94,0.1)", borderLeft: "3px solid var(--rose)", borderRadius: 6, fontSize: 12, color: "var(--text)", fontWeight: 600 }}>
                                    User Research <span style={{ color: "var(--rose-light)", float: "right" }}>✗ Missing Keyword</span>
                                </div>
                                <div style={{ padding: "10px 12px", background: "rgba(245,158,11,0.1)", borderLeft: "3px solid var(--amber)", borderRadius: 6, fontSize: 12, color: "var(--text)", fontWeight: 600 }}>
                                    Wireframing <span style={{ color: "var(--amber-light)", float: "right" }}>! Add Context</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
			</section>

            {/* CTA SECTION */}
			<section style={{ maxWidth: 800, margin: "80px auto 40px", width: "100%", textAlign: "center" }}>
                <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Ready to upgrade your career?</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32 }}>Stop guessing what recruiters want. Let data tell you exactly how to pass the screening filters.</p>
                <button className="btn btn-primary btn-lg" onClick={() => navigate("/upload")} style={{ padding: "16px 36px", fontSize: 16 }}>
                    Analyze Your Resume Now
                </button>
            </section>
		</div>
	);
}
