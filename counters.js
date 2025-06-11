// register all counters in this file
import {counterReset, counterValue, registerCounter} from "./lib/counter.js";

const counters = [
    {
        name: "section",
        initialValue: 0,
        stylizedValueGenerator: (rawValue) => {
            return rawValue;
        },
        onUpdate: (newValue) => {
            counterReset("subsection");
        }
    },
    {
        name: "subsection",
        initialValue: 0,
        stylizedValueGenerator: (rawValue) => {
            return counterValue("section") + "." +  rawValue;
        }
    }
]

export default counters;
