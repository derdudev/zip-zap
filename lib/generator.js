import fs from "fs";
import path from "node:path";
import ejs from "ejs";

let generators = [];

// TODO: Add registerGenerators that takes a list

export function registerGenerators(generators) {
    generators.forEach(generator => registerGenerator(generator));
}

export function registerGenerator({name, dataGenerator, preEjsRender}) {
    // TODO: check whether a template file exists
    if(!preEjsRender) {
        generators.push({
            name: name,
            dataGenerator: dataGenerator
        })
    } else {
        generators.push({
            name: name,
            dataGenerator: dataGenerator,
            preEjsRender: preEjsRender
        })
    }
}

export function generate({name, frontmatter, attributes}) {
    const generatorEntry = generators.find(genEntry => genEntry.name === name);
    if(!generatorEntry) {
        console.error(`\x1b[38;2;255;26;5m[ERR] You did not register a generator with the name ${name} yet. \x1b[0m`);
        return "";
    }
    try{
        const file = fs.readFileSync(path.join(process.cwd(), "components",name+".ejs"), "utf-8");

        console.log("[DEBUG] Render <" + name + ">");

        if(generatorEntry.preEjsRender) {
            generatorEntry.preEjsRender(name, attributes);
        }

        return ejs.render(file, generatorEntry.dataGenerator(frontmatter, attributes), {
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
