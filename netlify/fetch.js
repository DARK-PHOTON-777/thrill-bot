import { getStore } from "@netlify/blobs";
import fs from "fs";

const store = getStore("datasets");

const data = await store.get("coasters", { type: "text" });

fs.writeFileSync("../data/coasters.json", data);
