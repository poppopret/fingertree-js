import connect, { Monoid, Measured } from '../src/index';

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
