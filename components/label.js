import ejs from "ejs";
import fs from "fs"
import * as path from "node:path";

export default function generateLabel({name}){
    const file = fs.readFileSync(path.join(process.cwd(), "components","label.ejs"), "utf-8");

    return ejs.render(file, {
        name: name
    });
}
