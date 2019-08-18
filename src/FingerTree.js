import { Measured } from './abstract';
import connect from './Node';
import { assert, patch } from './utils';

export default Monoid => {
    const { Node3, Node } = connect(Monoid);
    const assertMeasured = a => assert.ok(a instanceof Measured, 'not an instance of Measured');
    const assertTree = a => assert.ok(a instanceof FingerTree, 'not an instance of FingerTree');

    class FingerTree extends Measured {
        v = Monoid.mempty; // monoidal annotation, named by convention `FingerTree v a`

        constructor(v = Monoid.mempty) {
            super();
            this.v = v;
            patch(this, 'prepend', assertMeasured);
            patch(this, 'append', assertMeasured);
        }

        measure() {
            return this.v;
        }

        viewl() {
            throw new Error('Abstract method viewl not implemented!');
        }

        viewr() {
            throw new Error('Abstract method viewr not implemented!');
        }

        append() {
            throw new Error('Abstract method append not implemented!');
        }

        prepend() {
            throw new Error('Abstract method prepend not implemented!');
        }

        search() {
            throw new Error('Abstract method search not implemented!');
        }

        noWhere(predicate) {
            return predicate(Monoid.mempty, this.measure()) || !predicate(this.measure(), Monoid.mempty);
        }

        static concat(left, right) {
            [left, right].forEach(assertTree);
            const concat = (left, middle, right) => {
                if (!(left instanceof Deep)) {
                    return [...left.toList(), ...middle].reduceRight((tree, item) => tree.prepend(item), right);
                } else if (!(right instanceof Deep)) {
                    return [...middle, ...right.toList()].reduce((tree, item) => tree.append(item), left);
                } else {
                    return new Deep(
                        left.prefix,
                        concat(left.deeper, Node.nodes([...left.suffix, ...middle, ...right.prefix]), right.deeper),
                        right.suffix
                    );
                }
            };
            return concat(left, [], right);
        }

        static fromList(list = []) {
            list.forEach(assertMeasured);
            return list.reduceRight((tree, item) => tree.prepend(item), new Empty);
        }

        toList() {
            throw new Error('Abstract method toList not implemented!');
        }
    }

    class Empty extends FingerTree {
        prepend(a) { return new Single(a); }

        append(a) { return new Single(a); }

        viewl(peek = false) { return peek ? undefined : []; }

        viewr(peek = false) { return peek ? undefined : []; }

        toList() { return []; }

        search() { return []; }
    }

    class Single extends FingerTree {
        a = null; // named by convention `Single a`

        constructor(a) {
            assertMeasured(a);
            super(a.measure());
            this.a = a;
        }

        prepend(b) {
            return new Deep([b], new Empty, [this.a]);
        }

        append(b) {
            return new Deep([this.a], new Empty, [b]);
        }

        viewl(peek = false) {
            return peek ? this.a : [this.a, new Empty];
        }

        viewr(peek = false) {
            return peek ? this.a : [new Empty, this.a];
        }

        toList() { return [this.a]; }

        search(predicate) { return this.noWhere(predicate) ? [] : [new Empty, this.a, new Empty]; }
    }

    class Deep extends FingerTree {
        prefix = null; // 1-4 list of type `a`
        deeper = null; // reference to another fingertree of type `Node a`
        suffix = null; // 1-4 list of type `a`

        static measureAffix(affix = []) {
            if (affix.length > 4 || !affix.length) {
                throw new Error('Deep affix error');
            }
            return affix.map(a => a.measure()).reduce(Monoid.mappend, Monoid.mempty);
        }
        
        static fromAffix(affix = []) {
            let [a, b, c, d] = affix;
            switch (affix.length) {
                case 1: return new Single(a);
                case 2: return new Deep([a], new Empty, [b]);
                case 3: return new Deep([a, b], new Empty, [c]);
                case 4: return new Deep([a, b], new Empty, [c, d]);
                default: throw new Error('affix size error');
            }
        }

        static rotL(deeper, suffix) {
            let [x, tree] = deeper.viewl();
            let v = Monoid.mappend(deeper.measure(), Deep.measureAffix(suffix));
            return x ? new Deep(x.nodes, tree, suffix, v) : Deep.fromAffix(suffix);
        }

        static rotR(prefix, deeper) {
            let [tree, x] = deeper.viewr();
            let v = Monoid.mappend(Deep.measureAffix(prefix), deeper.measure());
            return x ? new Deep(prefix, tree, x.nodes, v) : Deep.fromAffix(prefix);
        }

        static deepL(prefix, deeper, suffix) {
            return prefix.length ? new Deep(prefix, deeper, suffix) : Deep.rotL(deeper, suffix);
        }

        static deepR(prefix, deeper, suffix) {
            return suffix.length ? new Deep(prefix, deeper, suffix) : Deep.rotR(prefix, deeper);
        }

        static searchList(predicate, vl, list, vr) {
            // list is affix of tree or nodes of Node
            if (list.length === 0) {
                throw new Error('search failed');
            }
            let [x, ...xs] = list;
            let vx = x.measure();
            let vxs = xs.map(x => x.measure()).reduce(Monoid.mappend, Monoid.mempty);
            if (predicate(Monoid.mappend(vl, vx), Monoid.mappend(vxs, vr))) {
                return [[], x, xs];
            } else {
                let [left, hit, right] = Deep.searchList(predicate, Monoid.mappend(vl, vx), xs, vr);
                return [[x, ...left], hit, right];
            }
        }

        static searchTree(predicate, vl, tree, vr) {
            if (tree instanceof Empty) {
                throw new Error('search failed');
            } else if (tree instanceof Single) {
                return [new Empty, tree.viewl(true), new Empty];
            }
            let vt = tree.measure(); // v of tree
            let vp = Deep.measureAffix(tree.prefix); // v of tree prefix
            let vs = Deep.measureAffix(tree.suffix); // v of tree suffix
            let vm = tree.deeper.measure(); // v of tree deeper
            let vlp = Monoid.mappend(vl, vp); // vl `mappend` v of tree prefix
            let vsr = Monoid.mappend(vs, vr); // v of tree suffix `mappend` vr

            const fromList = list => list.length ? Deep.fromAffix(list) : new Empty;
            
            if (predicate(vl, Monoid.mappend(vt, vr)) || !predicate(Monoid.mappend(vl, vt), vr)) {
                // not found
                throw new Error('search failed');
            } else if (predicate(vlp, Monoid.mappend(vm, vsr))) {
                // found in the prefix
                let [left, hit, right] = Deep.searchList(predicate, vl, tree.prefix, Monoid.mappend(vm, vsr));
                return [fromList(left), hit, Deep.deepL(right, tree.deeper, tree.suffix)];
            } else if (predicate(Monoid.mappend(vlp, vm), vsr)) {
                // found in the deeper
                let [leftTree, {nodes}, rightTree] = Deep.searchTree(predicate, vlp, tree.deeper, vsr);
                let vlpt = Monoid.mappend(vlp, leftTree.measure());
                let vtsr = Monoid.mappend(rightTree.measure(), vsr);
                let [left, hit, right] = Deep.searchList(predicate, vlpt, nodes, vtsr);
                return [Deep.deepR(tree.prefix, leftTree, left), hit, Deep.deepL(right, rightTree, tree.suffix)];
            } else {
                // found in the suffix
                let [left, hit, right] = Deep.searchList(predicate, Monoid.mappend(vlp, vm), tree.suffix, vr);
                return [Deep.deepR(tree.prefix, tree.deeper, left), hit, fromList(right)];
            }
        }

        constructor(prefix = [], deeper = null, suffix = [], v = [
            Deep.measureAffix(prefix),
            deeper.measure(),
            Deep.measureAffix(suffix)
        ].reduce(Monoid.mappend, Monoid.mempty)) {
            super(v);
            this.prefix = prefix;
            this.suffix = suffix;
            this.deeper = deeper;
        }

        prepend(a) {
            let full = this.prefix.length === 4;
            let [b, c, d, e] = this.prefix;
            return new Deep(
                full ? [a, b] : [a, ...this.prefix],
                full ? this.deeper.prepend(new Node3([c, d, e])) : this.deeper,
                [...this.suffix],
                Monoid.mappend(a.measure(), this.measure())
            );
        }

        append(e) {
            let full = this.suffix.length === 4;
            let [a, b, c, d] = this.suffix;
            return new Deep(
                [...this.prefix],
                full ? this.deeper.append(new Node3([a, b, c])) : this.deeper,
                full ? [d, e] : [...this.suffix, e],
                Monoid.mappend(this.measure(), e.measure())
            );
        }

        viewl(peek = false) {
            let [a, ...rest] = this.prefix;
            if (peek) {
                return a;
            } else if (this.prefix.length === 1) {
                let [left, tree] = this.deeper.viewl();
                return [a, left ? new Deep(
                    left.nodes,
                    tree,
                    this.suffix,
                    Monoid.mappend(this.deeper.measure(), Deep.measureAffix(this.suffix))
                ) : Deep.fromAffix(this.suffix)];
            } else {
                return [a, new Deep(rest, this.deeper, this.suffix)];
            }
        }

        viewr(peek = false) {
            let [a] = this.suffix.slice(-1);
            let rest = this.suffix.slice(0, -1);
            if (peek) {
                return a;
            } else if (this.suffix.length === 1) {
                let [tree, right] = this.deeper.viewr();
                return [right ? new Deep(
                    this.prefix,
                    tree,
                    right.nodes,
                    Monoid.mappend(Deep.measureAffix(this.prefix), this.deeper.measure())
                ) : Deep.fromAffix(this.prefix), a];
            } else {
                return [new Deep(this.prefix, this.deeper, rest), a];
            }
        }

        toList() {
            let affixToList = affix => {
                return affix.reduce((list, node) => {
                    return list.concat(node instanceof Node ? node.toList() : node);
                }, []);
            };
            return [...affixToList(this.prefix), ...this.deeper.toList(), ...affixToList(this.suffix)];
        }

        search(predicate) {
            return this.noWhere(predicate) ? [] : Deep.searchTree(predicate, Monoid.mempty, this, Monoid.mempty);
        }
    }

    return process.env.NODE_ENV === 'production'
        ? { Empty, Single, FingerTree } // avoid malformed Deep tree
        : { Empty, Single, Deep, FingerTree };
};
