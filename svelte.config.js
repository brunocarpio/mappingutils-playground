import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from "svelte-preprocess";
/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({
            fallback: "404.html",
        }),
        paths: {
            base: process.argv.includes("dev") ? "" : process.env.BASE_PATH,
        },
    },
    preprocess: sveltePreprocess(),
};
export default config;
