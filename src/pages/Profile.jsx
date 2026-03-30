import { useState } from "react";
import { useAuth } from "../state/auth";
import * as api from "../utils/api";

export default function Profile() {
	const { user } = useAuth();
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleChange() {
		if (!oldPassword || !newPassword) {
			window.__toast?.push({ type: "error", title: "Missing", description: "Enter both old and new passwords." });
			return;
		}
		try {
			setLoading(true);
			await api.changePassword(oldPassword, newPassword);
			window.__toast?.push({ type: "success", title: "Updated", description: "Password changed." });
			setOldPassword("");
			setNewPassword("");
		} catch (e) {
			window.__toast?.push({ type: "error", title: "Failed", description: e.message });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="grid grid-2">
			<div className="card" style={{ padding: 20 }}>
				<div className="stack">
					<div>
						<div className="label">Email</div>
						<div>{user?.email || "-"}</div>
					</div>
				</div>
			</div>
			<div className="card" style={{ padding: 20 }}>
				<div className="stack">
					<div className="label">Change Password</div>
					<input className="input" type="password" placeholder="Current password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
					<input className="input" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
					<div className="row" style={{ justifyContent: "flex-end" }}>
						<button className="btn btn-primary" onClick={handleChange} disabled={loading}>
							{loading ? "Updating..." : "Change Password"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
