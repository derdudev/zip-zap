import {currentCounterValue} from "../lib/counter.js";
import {registerRegistry, updateRegistry} from "../registries.js";

registerRegistry("labels", []);

const Label = {
    name: "label",
    dataGenerator: (frontmatter, attributes) => {
        return {
            name: attributes.find(attr => attr.name === "name").value
        }
    },
    preEjsRender: (name, attributes) => {
        updateRegistry("labels", (data) => {
          return data.concat({
              name: attributes.find(attr => attr.name === "name").value,
              value: currentCounterValue()
          });
        })
    }
}

export default Label;
