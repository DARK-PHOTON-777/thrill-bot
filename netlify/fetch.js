import { getStore } from "@netlify/blobs";
import fs from "fs";

const store = getStore({
	name: "datasets",
	siteID: process.env.NETLIFY_SITE_ID,
	token: process.env.NETLIFY_AUTH_TOKEN,
});

const data = await store.get("coasters", { type: "text" });

fs.mkdirSync(new URL("../data", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("../data/coasters.json", import.meta.url), data);
