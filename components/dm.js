import {counterIncr, counterValue} from "../lib/counter.js";
import {updateRegistry} from "../lib/registry.js";

const Dm = {
    name: "dm",
    dataGenerator: (frontmatter, attributes, children) => {
        let labelAttr = attributes.find(attr => attr.name === "label");
        let labelAttrValue = "";
        if (labelAttr) {
            labelAttr = attributes.find(attr => attr.name === "label").value;
        }
        return {
            label: labelAttrValue,
            number: counterValue("equation"),
        }
    },
    preEjsRender: (name, attributes) => {
        let labelAttr = attributes.find(attr => attr.name === "label");
        if(labelAttr) {
            counterIncr("equation");
            updateRegistry("labels", (data) => {
                return data.concat({
                    name: attributes.find(attr => attr.name === "label").value,
                    value: counterValue("equation")
                });
            })
        }
    }
}

export default Dm;
