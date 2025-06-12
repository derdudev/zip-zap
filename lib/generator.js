import fs from "fs";
import path from "node:path";
import ejs from "ejs";

let components = [];

// TODO: Add registerGenerators that takes a list

export function registerComponents(generators) {
    generators.forEach(generator => registerComponent(generator));
}

/**
 *
 * @param name
 * @param dataGenerator executed AFTER preEjsRender
 * @param preEjsRender executed right before dataGenerator and rendering
 */
export function registerComponent({name, dataGenerator, preEjsRender}) {
    // TODO: check whether a template file exists
    if(!preEjsRender) {
        components.push({
            name: name,
            dataGenerator: dataGenerator
        })
    } else {
        components.push({
            name: name,
            dataGenerator: dataGenerator,
            preEjsRender: preEjsRender
        })
    }
}

export function generateComponent({name, frontmatter, attributes, children}) {
    const generatorEntry = components.find(genEntry => genEntry.name === name);
    if(!generatorEntry) {
        console.error(`\x1b[38;2;255;26;5m[ERR] You did not register a generator with the name ${name} yet. \x1b[0m`);
        return "";
    }
    try{
        const file = fs.readFileSync(path.join(process.cwd(), "components",name+".ejs"), "utf-8");

        console.log("[DEBUG] Render <" + name + ">");

        if(generatorEntry.preEjsRender) {
            generatorEntry.preEjsRender(name, attributes, children);
        }

        return ejs.render(file, generatorEntry.dataGenerator(frontmatter, attributes, children), {
            filename: path.join(process.cwd(), "components", name),
            rmWhitespace: true
        }).trim();
    } catch(e) {
        if(e.code === "ENOENT") {
            console.error(`\x1b[38;2;255;26;5m[ERR] You did not create a component template file (*.ejs) in the /components directory for the generator "${name}". \x1b[0m`);
        }
    }

    return "";
}
