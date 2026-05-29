import { getStore } from "@netlify/blobs";
import fs from "fs";

const store = getStore({
	name: "datasets",
	siteID: process.env.NETLIFY_SITE_ID,
	token: process.env.NETLIFY_AUTH_TOKEN,
});

const data = await store.get("coasters", { type: "text" });

fs.writeFileSync("../data/coasters.json", data);
