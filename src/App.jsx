import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./state/auth";
import { ThemeProvider } from "./state/theme";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Results from "./pages/Results";
import Resumes from "./pages/Resumes";
import Analysis from "./pages/Analysis";
import Profile from "./pages/Profile";
import ToastHost from "./components/ToastHost";

function PrivateRoute({ children }) {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<div className="app-shell">
					<Navbar />
					<main className="main-container">
						<Routes>
							<Route path="/" element={<Landing />} />
							<Route path="/upload" element={<Upload />} />
							<Route path="/results" element={<Results />} />
							<Route path="/dashboard" element={<Navigate to="/analysis" replace />} />
							<Route
								path="/resumes"
								element={
									<PrivateRoute>
										<Resumes />
									</PrivateRoute>
								}
							/>
							<Route
								path="/analysis"
								element={
									<PrivateRoute>
										<Analysis />
									</PrivateRoute>
								}
							/>
							<Route
								path="/profile"
								element={
									<PrivateRoute>
										<Profile />
									</PrivateRoute>
								}
							/>
							<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>
					</main>
					<ToastHost />
				</div>
			</AuthProvider>
		</ThemeProvider>
	);
}
