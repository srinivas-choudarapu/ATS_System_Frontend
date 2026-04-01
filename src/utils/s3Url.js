export function isExpiredS3SignedUrl(url) {
	if (!url || typeof url !== "string") return false;

	try {
		const parsed = new URL(url);
		const date = parsed.searchParams.get("X-Amz-Date");
		const expires = parsed.searchParams.get("X-Amz-Expires");

		if (!date || !expires) return false;
		if (!/^\d{8}T\d{6}Z$/.test(date)) return false;

		const issuedAt = new Date(
			`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(9, 11)}:${date.slice(11, 13)}:${date.slice(13, 15)}Z`
		);
		const expiresInSeconds = Number(expires);
		if (Number.isNaN(expiresInSeconds)) return false;

		return Date.now() > issuedAt.getTime() + expiresInSeconds * 1000;
	} catch {
		return false;
	}
}
