const base = process.env.BASE_URL || "";

async function request(path, { method = "GET", headers, body, formData, includeAuth = true } = {}) {
	const init = {
		method,
		headers: headers || {},
		credentials: includeAuth ? "include" : "omit"
	};
	if (formData) {
		init.body = formData;
	} else if (body) {
		init.headers["Content-Type"] = "application/json";
		init.body = JSON.stringify(body);
	}
	const res = await fetch(`${base}${path}`, init);
	const text = await res.text();
	let data;
	try {
		data = text ? JSON.parse(text) : null;
	} catch {
		data = text;
	}
	if (!res.ok) {
		const message = data?.error || data?.message || `Request failed: ${res.status}`;
		throw new Error(message);
	}
	return data;
}

// User routes
export function signup(email, password) {
	return request("/api/users/signup", { method: "POST", body: { email, password } });
}
export function login(email, password) {
	return request("/api/users/login", { method: "POST", body: { email, password } });
}
export function logout() {
	return request("/api/users/logout", { method: "POST" });
}
export function forgot(email) {
	return request("/api/users/forgot", { method: "POST", body: { email } });
}
export function changePassword(oldPassword, newPassword) {
	return request("/api/users/change", { method: "POST", body: { oldPassword, newPassword } });
}

// Resume routes
export function uploadResume(resumeFile, jdText, shouldSave = true) {
	const fd = new FormData();
	fd.append("resume", resumeFile);
	fd.append("jdText", jdText);
	return request("/api/resume/upload", { method: "POST", formData: fd, includeAuth: shouldSave });
}
export function getResumeHistory() {
	return request("/api/resume/history");
}
export function getAllResumes() {
	return request("/api/resume/history");
}
export function getResumeById(id) {
	return request(`/api/resume/${id}`);
}
export function deleteResume(id) {
	return request(`/api/resume/${id}`, { method: "DELETE" });
}
export function deleteAllResumes() {
	return request(`/api/resume/all`, { method: "DELETE" });
}

// Analysis routes
export function runAnalysis(resumeId, jdText) {
	return request("/api/analysis/run", { method: "POST", body: { resumeId, jdText } });
}
export function getAnalysisById(id) {
	return request(`/api/analysis/${id}`);
}
export function deleteAnalysis(id) {
	return request(`/api/analysis/${id}`, { method: "DELETE" });
}
export function deleteAnalysisByResumeId(resumeId) {
	return request(`/api/analysis/resume/${resumeId}`, { method: "DELETE" });
}
export function getAnalysisByResumeId(resumeId) {
	return request(`/api/analysis/resume/${resumeId}`);
}
export function getJDByAnalysisId(id) {
	return request(`/api/analysis/${id}/jd`);
}
