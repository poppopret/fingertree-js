import { Empty, Single, Deep, FingerTree, SizeMeasured, getDigitTree, getTreeValues, getDigitList } from './utils';

describe('Construction', () => {
    test('empty tree works', () => {
        expect((new Empty).measure()).toEqual(0);
    });
    test('single tree works', () => {
        expect(new Single(new SizeMeasured(5)).measure()).toEqual(1);
    });
    test('deep tree works', () => {
        expect(new Deep([new SizeMeasured(1)], new Empty, [new SizeMeasured(2)]).measure()).toEqual(2);
    });
    test('tree works with fromList', () => {
        expect(getDigitTree(0).measure()).toEqual(0);
        expect(getDigitTree(1).measure()).toEqual(1);
        expect(getDigitTree(100).measure()).toEqual(100);
        expect(getTreeValues(getDigitTree(100))).toEqual(getDigitList(100));
    });
    describe('new tree with prepend & append', () => {
        test('empty', () => {
            expect((new Empty).prepend(new SizeMeasured(1)).measure()).toEqual(1);
            expect((new Empty).append(new SizeMeasured(1)).measure()).toEqual(1);
        });
        test('single', () => {
            let prependTree = (new Single(new SizeMeasured(0))).prepend(new SizeMeasured(1));
            let appendTree = (new Single(new SizeMeasured(0))).append(new SizeMeasured(1));
            expect(prependTree.measure()).toEqual(2);
            expect(appendTree.measure()).toEqual(2);
            expect(getTreeValues(prependTree)).toEqual([1, 0]);
            expect(getTreeValues(appendTree)).toEqual([0, 1]);
        });
        test('deep', () => {
            let tree = new Deep([new SizeMeasured(1)], new Empty, [new SizeMeasured(2)]);
            expect(tree.prepend(new SizeMeasured(11)).measure()).toEqual(3);
            expect(tree.append(new SizeMeasured(12)).measure()).toEqual(3);
            expect(getTreeValues(tree.prepend(new SizeMeasured(11)))).toEqual([11, 1, 2]);
            expect(getTreeValues(tree.append(new SizeMeasured(12)))).toEqual([1, 2, 12]);
        });
    });
    describe('new tree with concat', () => {
        let toValues = (left, right) => getTreeValues(FingerTree.concat(left, right));
        let measure = (left, right) => FingerTree.concat(left, right).measure();

        test('empty', () => {
            expect(toValues(new Empty, new Empty)).toHaveLength(0);
            expect(toValues(new Empty, getDigitTree(1))).toEqual(getDigitList(1));
            expect(toValues(new Empty, getDigitTree(10))).toEqual(getDigitList(10));
            expect(toValues(getDigitTree(1), new Empty)).toEqual(getDigitList(1));
            expect(toValues(getDigitTree(10), new Empty)).toEqual(getDigitList(10));
            expect(measure(new Empty, getDigitTree(10))).toEqual(10);
            expect(measure(getDigitTree(10), new Empty)).toEqual(10);
        });
        test('single', () => {
            let single = val => new Single(new SizeMeasured(val));
            expect(toValues(single(0), single(1))).toEqual(getDigitList(2));
            expect(toValues(single(0), getDigitTree(10))).toEqual([0, ...getDigitList(10)]);
            expect(toValues(single(1), single(0))).toEqual([1, 0]);
            expect(toValues(getDigitTree(10), single(0))).toEqual([...getDigitList(10), 0]);
            expect(measure(single(3), getDigitTree(10))).toEqual(11);
            expect(measure(getDigitTree(10), single(3))).toEqual(11);
        });
        test('deep', () => {
            expect(toValues(getDigitTree(10), getDigitTree(10))).toEqual([...getDigitList(10), ...getDigitList(10)]);
            expect(toValues(getDigitTree(30), getDigitTree(30))).toEqual([...getDigitList(30), ...getDigitList(30)]);
            expect(toValues(getDigitTree(2), getDigitTree(10))).toEqual([...getDigitList(2), ...getDigitList(10)]);
            expect(toValues(getDigitTree(10), getDigitTree(2))).toEqual([...getDigitList(10), ...getDigitList(2)]);
            expect(measure(getDigitTree(10), getDigitTree(3))).toEqual(13);
        });
    });
});