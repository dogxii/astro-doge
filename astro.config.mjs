import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import astroExpressiveCode from "astro-expressive-code";
import { fileURLToPath } from "url";
import rehypeHeadingLinks from "./src/lib/rehype/rehype-heading-links.mjs";
import remarkGithubAlerts from "./src/lib/remark/github-alert.mjs";
import remarkDemoteH1ToH2 from "./src/lib/remark/remark-demote-h1.mjs";
import remarkExternalLinks from "./src/lib/remark/remark-external-links.mjs";

const viteEnvPath = fileURLToPath(
	new URL("./node_modules/vite/dist/client/env.mjs", import.meta.url),
);

function resolveViteEnv() {
	return {
		name: "resolve-vite-env",
		enforce: "pre",
		resolveId(id) {
			if (id === "@vite/env") {
				return viteEnvPath;
			}
		},
	};
}

export default defineConfig({
	site: "https://example.com/",
	compressHTML: true,

	output: "static",

	build: {
		inlineStylesheets: "auto",
	},

	integrations: [
		astroExpressiveCode({
			themes: ["github-dark"],
			frames: {
				showCopyToClipboardButton: false,
			},
		}),
		mdx(),
		sitemap({
			filter: (page) => !page.includes("/offline"),
		}),
	],

	markdown: {
		remarkPlugins: [
			remarkGithubAlerts,
			remarkDemoteH1ToH2,
			[remarkExternalLinks, { allowHostnames: ["example.com"] }],
		],
		rehypePlugins: [rehypeHeadingLinks],
	},

	vite: {
		server: {
			watch: {
				ignored: ["**/.vercel/**", "**/dist/**"],
			},
		},
		resolve: {
			alias: {
				"@vite/env": viteEnvPath,
			},
		},
		plugins: [resolveViteEnv(), tailwindcss()],
	},
});
