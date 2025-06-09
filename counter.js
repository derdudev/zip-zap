const _counters = [];
let _currentCounterName = "";

class Counter {
    constructor(name, initialValue, stylizedValueGenerator, onUpdate) {
        this.name = name;
        this.initialValue = initialValue;
        this.rawValue = initialValue;
        this.stylizedValueGenerator = stylizedValueGenerator;
        this.onUpdate = onUpdate;
    }

    static fromCounter(counter) {
        return new Counter(counter.rawValue, counter.stylizedValueGenerator, counter.onUpdate);
    }

    incr(){
        this.rawValue += 1;
        if(this.onUpdate){
            this.onUpdate(this.rawValue);
        }
        _currentCounterName = this.name;
        return this.rawValue;
    }

    get value(){
        return this.stylizedValueGenerator(this.rawValue);
    }

    setRawValue(value){
        if(this.onUpdate){
            this.onUpdate(this.rawValue+1);
        }
        this.rawValue = value;
    }

    reset() {
        this.rawValue = this.initialValue;
    }
}

/**
 *
 * @param name
 * @param initialValue used to initialize the counter
 * @param stylizedValueGenerator (currentValue) => {...}
 * @param onUpdate (newValue) => {...}
 */
export function registerCounter({name, initialValue, stylizedValueGenerator, onUpdate}) {
    _counters.push(new Counter(name, initialValue, stylizedValueGenerator, onUpdate));
}

export function counterSetTo(name, rawValue) {
    return _counters.find(x => x.name === name).setRawValue(rawValue);
}

export function counterIncr(name) {
    return _counters.find(x => x.name === name).incr();
}

export function counterValue(name) {
    return _counters.find(x => x.name === name).value;
}

export function counterReset(name) {
    _counters.find(x => x.name === name).reset();
}

export function resetCounters() {
    // set _currentCounter = null and handle null cases
    _counters.forEach(x => x.reset());
}

export function currentCounterValue() {
    return _counters.find(x => x.name === _currentCounterName).value;
}
