import connect, { Monoid, Measured } from '../src/index';

// random-access sequence
export class SizeMonoid extends Monoid {
    static get mempty() { return 0; }
    static mappend(a, b) {
        return a + b;
    }
}

export class SizeMeasured extends Measured {
    constructor(x) {
        super();
        this.x = x;
    }

    measure() {
        return 1;
    }

    get() { return this.x; }
}

export const { Empty, Single, Deep, FingerTree } = connect(SizeMonoid);
export const getDigitList = len => [...Array(len).keys()];
export const getDigitTree = len => {
    return FingerTree.fromList(getDigitList(len).map(x => new SizeMeasured(x)));
};
export const getTreeValues = tree => tree.toList().map(x => x.get());


// string with priority
export class PriorityMonoid extends Monoid {
    static get mempty() { return -Infinity; }
    static mappend(a, b) { return Math.max(a, b); }
}

export class PriorityMeasured extends Measured {
    constructor(x) {
        super();
        this.x = x; // x should be a string
    }

    measure() {
        return this.x.length;
    }

    get() { return this.x; }
}

export const PriorityConnected = connect(PriorityMonoid);
export const getStringTree = list => PriorityConnected.FingerTree.fromList(list.map(str => new PriorityMeasured(str)));
