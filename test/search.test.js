import { Empty, Single, SizeMeasured, getDigitTree, getStringTree, PriorityConnected } from './utils';

describe('Search', () => {
    const at = index => (vl, vr) => {
        return index < 0 ? vr + 1 <= -index : vl - 1 >= index;
    };
    const map = ([left, hit, right]) => [left.measure(), hit.get(), right.measure()];

    test('index on Empty', () => {
        let empty = new Empty;
        expect(empty.search(at(0))).toHaveLength(0);
        expect(empty.search(at(1))).toHaveLength(0);
        expect(empty.search(at(-1))).toHaveLength(0);
    });

    describe('index on Single', () => {
        let single = new Single(new SizeMeasured(6));
        test('found something or not', () => {
            expect(single.search(at(0))).toHaveLength(3);
            expect(single.search(at(-1))).toHaveLength(3);
            expect(single.search(at(1))).toHaveLength(0);
            expect(single.search(at(8))).toHaveLength(0);
            expect(single.search(at(-2))).toHaveLength(0);
        });
        test('found the right thing', () => {
            expect(map(single.search(at(0)))).toEqual([0, 6, 0]);
            expect(map(single.search(at(-1)))).toEqual([0, 6, 0]);
        });
    });

    describe('index on Deep', () => {
        let tree = getDigitTree(100);
        test('found something or not', () => {
            expect(tree.search(at(0))).toHaveLength(3);
            expect(tree.search(at(-1))).toHaveLength(3);
            expect(tree.search(at(1))).toHaveLength(3);
            expect(tree.search(at(8))).toHaveLength(3);
            expect(tree.search(at(-2))).toHaveLength(3);
            expect(tree.search(at(-100))).toHaveLength(3);
            expect(tree.search(at(-101))).toHaveLength(0);
            expect(tree.search(at(-1901))).toHaveLength(0);
            expect(tree.search(at(99))).toHaveLength(3);
            expect(tree.search(at(100))).toHaveLength(0);
            expect(tree.search(at(1700))).toHaveLength(0);
        });
        test('found the right thing', () => {
            expect(map(tree.search(at(0)))).toEqual([0, 0, 99]);
            expect(map(tree.search(at(20)))).toEqual([20, 20, 79]);
            expect(map(tree.search(at(36)))).toEqual([36, 36, 63]);
            expect(map(tree.search(at(99)))).toEqual([99, 99, 0]);
            expect(map(tree.search(at(-1)))).toEqual([99, 99, 0]);
            expect(map(tree.search(at(-20)))).toEqual([80, 80, 19]);
            expect(map(tree.search(at(-80)))).toEqual([20, 20, 79]);
            expect(map(tree.search(at(-100)))).toEqual([0, 0, 99]);
        });
    });

    test('priority with fingertree', () => {
        let list = [
            'a',
            '',
            'hello world',
            'a',
            'expect(map(tree.search(at(0)))).toEqual([0, 0, 99])',
            'to be or not to be'
        ];
        let tree = getStringTree(list);
        const extract = tree => {
            let [left, x, right] = tree.search(v => v >= tree.measure());
            return x ? [x, ...extract(PriorityConnected.FingerTree.concat(left, right))] : [];
        };
        expect(extract(tree).map(x => x.get())).toEqual(list.sort((a, b) => b.length - a.length));
    });
});
