import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="p-responsive" style={{
            background: "var(--bg-secondary)",
            borderTop: "1px solid var(--border-subtle)",
            marginTop: "auto"
        }}>
            <div style={{
                maxWidth: 1600,
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 48,
                marginBottom: 60
            }}>
                {/* Brand / Logo */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16, gridColumn: "1 / -1", '@media (min-width: 1024px)': { gridColumn: 'span 2' } }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H14l5 5v12.5a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 19.5z" stroke="url(#footerGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(99,102,241,0.08)"/>
							<path d="M14 2v5h5M8 13l2 2 4-4" stroke="url(#footerGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							<defs>
								<linearGradient id="footerGrad" x1="4" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
									<stop stopColor="#6366f1" />
									<stop offset="1" stopColor="#06b6d4" />
								</linearGradient>
							</defs>
						</svg>
                        <strong style={{ fontSize: 18, color: "var(--text)" }}>ATS Analyzer</strong>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, maxWidth: 300 }}>
                        The smart resume intelligence platform. Match your resume with job descriptions instantly and land more interviews.
                    </p>
                </div>

                {/* Product Links */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <h4 style={{ color: "var(--text)", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px", fontWeight: 700 }}>Product</h4>
                    <Link to="/upload" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Upload Resume</Link>
                    <Link to="/analysis" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Dashboard</Link>
                    <a href="#" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Pricing</a>
                    <a href="#" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Changelog</a>
                </div>

                {/* Resources Links */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <h4 style={{ color: "var(--text)", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px", fontWeight: 700 }}>Resources</h4>
                    <a href="#" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Blog</a>
                    <a href="#" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Resume Templates</a>
                    <a href="#" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Career Guide</a>
                    <a href="#" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Help Center</a>
                </div>

                {/* Legal Links */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <h4 style={{ color: "var(--text)", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px", fontWeight: 700 }}>Legal</h4>
                    <a href="#" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Privacy Policy</a>
                    <a href="#" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Terms of Service</a>
                    <a href="#" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Cookie Policy</a>
                </div>
            </div>

            <div style={{
                maxWidth: 1600,
                margin: "0 auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: 30,
                color: "var(--text-muted)",
                fontSize: 13
            }}>
                <div>© {new Date().getFullYear()} ATS Analyzer. All rights reserved.</div>
                <div style={{ display: "flex", gap: 20 }}>
                    <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Twitter</a>
                    <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>GitHub</a>
                    <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>LinkedIn</a>
                </div>
            </div>
        </footer>
    );
}
