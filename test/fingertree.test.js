import { Monoid, Measured, init } from '../src/index';

class SizeMonoid extends Monoid {
    static get mempty() { return 0; }
    static mappend(a, b) {
        return a + b;
    }
}

class SizeMeasured extends Measured {
    constructor(x) {
        super();
        this.x = x;
    }

    measure() {
        return 1;
    }
}

const { Empty, Single, Deep } = init(SizeMonoid);
const getDigitList = len => [...Array(len).keys()];
const getDigitTree = len => {
    return Empty.fromList(getDigitList(len).map(x => new SizeMeasured(x)));
};

describe('FingerTree initializing', () => {
    test('empty tree works with constructor', () => {
        expect(new Empty).toHaveProperty('v', 0);
    });
    test('single tree works with constructor', () => {
        expect(new Single(new SizeMeasured(5))).toHaveProperty('v', 1);
    });
    test('deep tree works with constructor', () => {
        expect(new Deep([new SizeMeasured(1)], new Empty, [new SizeMeasured(2)])).toHaveProperty('v', 2);
    });
    test('tree works with fromList', () => {
        expect(getDigitTree(0)).toHaveProperty('v', 0);
        expect(getDigitTree(1)).toHaveProperty('v', 1);
        expect(getDigitTree(100)).toHaveProperty('v', 100);
    });
});

describe('FingerTree basic operations', () => {
    describe('viewl works', () => {
        test('on Empty', () => {
            expect((new Empty).viewl()).toHaveLength(0);
        });
        test('on Single', () => {
            let [left, tree] = getDigitTree(1).viewl();
            expect(left).toBeInstanceOf(SizeMeasured); // Caution with `Node` not checked here
            expect(tree).toBeInstanceOf(Empty);
        });
        test('on Deep', () => {
            let [left, tree] = getDigitTree(2).viewl();
            expect(left).toBeInstanceOf(SizeMeasured);
            expect(tree).toBeInstanceOf(Single);
        });
        test('on really Deep', () => {
            let [left, tree] = getDigitTree(10).viewl();
            expect(left).toBeInstanceOf(SizeMeasured);
            expect(tree).toBeInstanceOf(Deep);
        });
        test('in right order', () => {
            let len = 100;
            let tree = getDigitTree(len);
            let list = [];
            while (!(tree instanceof Empty)) {
                let [left, newTree] = tree.viewl();
                list.push(left.x);
                tree = newTree;
            }
            expect(list).toEqual(getDigitList(len));
        });
    });
    describe('viewr works', () => {
        test('on Empty', () => {
            expect((new Empty).viewr()).toHaveLength(0);
        });
        test('on Single', () => {
            let [tree, right] = getDigitTree(1).viewr();
            expect(right).toBeInstanceOf(SizeMeasured); // Caution with `Node` not checked here
            expect(tree).toBeInstanceOf(Empty);
        });
        test('on Deep', () => {
            let [tree, right] = getDigitTree(2).viewr();
            expect(right).toBeInstanceOf(SizeMeasured);
            expect(tree).toBeInstanceOf(Single);
        });
        test('on really Deep', () => {
            let [tree, right] = getDigitTree(10).viewr();
            expect(right).toBeInstanceOf(SizeMeasured);
            expect(tree).toBeInstanceOf(Deep);
        });
        test('in right order', () => {
            let len = 100;
            let tree = getDigitTree(len);
            let list = [];
            while (!(tree instanceof Empty)) {
                let [newTree, right] = tree.viewr();
                list.push(right.x);
                tree = newTree;
            }
            expect(list).toEqual(getDigitList(len).reverse());
        });
    });
    describe('view peek mode works', () => {
        test('on Empty', () => {
            expect((new Empty).viewl(true)).toBeUndefined();
            expect((new Empty).viewr(true)).toBeUndefined();
        });
        test('on Single', () => {
            let tree = getDigitTree(1);
            let left = tree.viewl(true);
            let right = tree.viewr(true);
            expect(left).toBeInstanceOf(SizeMeasured);
            expect(left).toEqual(right);
        });
        test('on Deep', () => {
            let tree = getDigitTree(2);
            let left = tree.viewl(true);
            let right = tree.viewr(true);
            expect(left).toBeInstanceOf(SizeMeasured);
            expect(right).toBeInstanceOf(SizeMeasured);
            expect(left).not.toEqual(right);
        });
    });
});