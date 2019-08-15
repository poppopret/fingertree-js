import { Empty, Single, Deep, SizeMeasured, getDigitList, getDigitTree, getTreeValues } from './utils';

describe('Examining the ends', () => {
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
                list.push(left.get());
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
                list.push(right.get());
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
    describe('toList works', () => {
        test('on Empty', () => {
            expect(getTreeValues(new Empty)).toHaveLength(0);
        });
        test('on Single', () => {
            expect(getTreeValues(new Single(new SizeMeasured(1)))).toEqual([1]);
        });
        test('on Deep', () => {
            expect(getTreeValues(getDigitTree(2))).toEqual(getDigitList(2));
            expect(getTreeValues(getDigitTree(20))).toEqual(getDigitList(20));
            expect(getTreeValues(getDigitTree(36))).toEqual(getDigitList(36));
        });
    });
});