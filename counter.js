export default class Counter {
    constructor(initialValue, stylizedValueGenerator) {
        this.rawValue = initialValue;
        this.stylizedValueGenerator = stylizedValueGenerator;
    }

    static fromCounter(counter) {
        return new Counter(counter.rawValue, counter.stylizedValueGenerator);
    }

    incr(){
        return ++this.rawValue;
    }

    get value(){
        return this.stylizedValueGenerator(this.rawValue);
    }

    setRawValue(value){
        this.rawValue = value;
    }
}
