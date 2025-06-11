import path from "node:path";
import {generateFromMDX} from "./lib/generate-from-mdx.js";

// For CLI later: https://stackoverflow.com/questions/4351521/how-do-i-pass-command-line-arguments-to-a-node-js-program-and-receive-them
// const argv = process.argv.slice(2);
// console.log(argv);

generateFromMDX({
    dir: path.join(process.cwd(), "content", "main-chapters"),
    outputDir: path.join(process.cwd(), "build", "content"),
})
