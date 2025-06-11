import {getRegistryData} from "../lib/registry.js";

const Ref = {
    name: "ref",
    dataGenerator: (frontmatter, attributes) => {
        let to = attributes.find(attr => attr.name === "to").value;
        let label = getRegistryData("labels").find(label => label.name === to);

        // console.log("[DEBUG] Counter corresp. to Ref: ", label);

        if(label){
            // console.log("[DEBUG]", label.ccounter)
            // console.log("[DEBUG] Counter value: ", label.ccounter.value)
            return {
                href: "#"+to,
                value: "Abschnitt " + label.value
            }
        } else {
            return {
                href: to,
                value: "tbr"
            }
        }
    }
}

export default Ref;
