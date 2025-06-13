import fs from "fs";
import path from "node:path";
import ejs from "ejs";

export function renderEjsComponent({name, data, ejsComponentsPath}) {
    try{
        const pathToEjsComponents = ejsComponentsPath ?? path.join(process.cwd(), "ejs-components")
        const file = fs.readFileSync(path.join(pathToEjsComponents,name+".ejs"), "utf-8");

        return ejs.render(file, data, {
            filename: path.join(process.cwd(), "ejs-components", name),
            rmWhitespace: true
        }).trim();
    } catch(e) {
        if(e.code === "ENOENT") {
            console.error(`\x1b[38;2;255;26;5m[ERR] You did not create a component template file (*.ejs) in the /ejs-components directory. \x1b[0m`);
        }
    }

    return "";
}
