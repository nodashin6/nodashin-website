class OperatorArgs {
    constructor(number, result) {
        if (typeof number !== 'number') {
            throw new TypeError("number must be a number");
        }
        if (typeof result !== 'string') {
            throw new TypeError("result must be a string");
        }
        this.number = number;
        this.result = result;
    }

    addSuffix(suffix) {
        this.result += suffix;
    }
}

class OperatorElement {
    constructor(x, suffix) {
        this.x = x;
        this.suffix = suffix;
    }
}

class IOperator {
    call(args) {
        throw new Error("Method 'call' must be implemented");
    }

    chain(nextOperator) {
        return new ChainedOperator(this, nextOperator);
    }
}

class ChainedOperator extends IOperator {
    constructor(current, next) {
        super();
        this.current = current;
        this.next = next;
    }

    call(args) {
        const currentResult = this.current.call(args);
        return this.next.call(currentResult);
    }

    chain(nextOperator) {
        return new ChainedOperator(this, nextOperator);
    }
}

class BaseOperator extends IOperator {
    constructor(element) {
        super();
        this.element = element;
    }

    get x() {
        return this.element.x;
    }

    get suffix() {
        return this.element.suffix;
    }

    validateElement(element) {
        // To be implemented by subclasses
    }
}

class ContainsOperator extends BaseOperator {
    constructor(target, suffix) {
        super(new OperatorElement(target, suffix));
    }

    call(args) {
        const result = new OperatorArgs(args.number, args.result);
        if (String(args.number).includes(String(this.x))) {
            result.addSuffix(this.suffix);
        }
        return result;
    }
}

class DivisionOperator extends BaseOperator {
    constructor(divisor, suffix) {
        super(new OperatorElement(divisor, suffix));
        if (divisor === 0) {
            throw new Error("divisor must be a non-zero integer");
        }
    }

    call(args) {
        const result = new OperatorArgs(args.number, args.result);
        if (args.number % this.x === 0) {
            result.addSuffix(this.suffix);
        }
        return result;
    }
}

class StartOperator extends IOperator {
    call(number) {
        return new OperatorArgs(number, "");
    }
}

class StopOperator extends IOperator {
    call(args) {
        const result = new OperatorArgs(args.number, args.result);
        if (result.result === "") {
            result.addSuffix(String(result.number));
        }
        return result;
    }
}

// --------------------------------
// Test Functions
// --------------------------------
function testFizzBuzz() {
    const commonFizzBuzz = (i) => {
        if (i % 15 === 0) return "FizzBuzz";
        if (i % 3 === 0) return "Fizz";
        if (i % 5 === 0) return "Buzz";
        return String(i);
    };

    const fizzBuzz = new StartOperator()
        .chain(new DivisionOperator(3, "Fizz"))
        .chain(new DivisionOperator(5, "Buzz"))
        .chain(new StopOperator());

    const n = 100;
    const a = Array.from({ length: n }, (_, i) => fizzBuzz.call(i + 1).result);
    const b = Array.from({ length: n }, (_, i) => commonFizzBuzz(i + 1));
    for (let i = 0; i < n; i++) {
        console.assert(a[i] === b[i], `Failed at ${i + 1}, ${a[i]} !== ${b[i]}`);
    }
}

function testAhoBuzz() {
    const commonAhoBuzz = (i) => {
        let result = "";
        if (String(i).includes("3")) result += "Aho";
        if (i % 5 === 0) result += "Buzz";
        return result || String(i);
    };

    const ahoBuzz = new StartOperator()
        .chain(new ContainsOperator(3, "Aho"))
        .chain(new DivisionOperator(5, "Buzz"))
        .chain(new StopOperator());

    const n = 100;
    const a = Array.from({ length: n }, (_, i) => ahoBuzz.call(i + 1).result);
    const b = Array.from({ length: n }, (_, i) => commonAhoBuzz(i + 1));
    for (let i = 0; i < n; i++) {
        console.assert(a[i] === b[i], `Failed at ${i + 1}, ${a[i]} !== ${b[i]}`);
    }
}

// --------------------------------
// Run Tests
// --------------------------------
testFizzBuzz();
testAhoBuzz();
console.log("All tests passed");
