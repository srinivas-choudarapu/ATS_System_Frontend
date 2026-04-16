import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
	build: {
		outDir: "dist"
	},
	plugins: [react()],
	server: {
		// port: process.env.PORT,
		proxy: {
			"/api": {
				target: process.env.VITE_API_URL,
				changeOrigin: true,
				withCredentials: true
			}
		}
	}
});
