import path from "node:path";
import {generateFromMDX} from "./lib/generate-from-mdx.js";

generateFromMDX({
    dir: path.join(process.cwd(), "content", "main-chapters"),
    outputDir: path.join(process.cwd(), "build", "content"),
})
