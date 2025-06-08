export default class Counter {
    constructor(initialValue, stylizedValueGenerator) {
        this.rawValue = initialValue;
        this.stylizedValueGenerator = stylizedValueGenerator;
        this.active = true;
    }

    static fromCounter(counter) {
        return new Counter(counter.rawValue, counter.stylizedValueGenerator);
    }

    deavtivate() {
        this.active = false;
    }

    incr(){
        if(this.active){
            return ++this.rawValue;
        } else {
            return this.rawValue;
        }
    }

    get value(){
        return this.stylizedValueGenerator(this.rawValue);
    }

    setRawValue(value){
        this.rawValue = value;
    }
}
