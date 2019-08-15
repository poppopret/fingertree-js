import { Measured } from './abstract';
import connect from './Node';
import { assert, patch } from './utils';

export default Monoid => {
    const { Node3, Node } = connect(Monoid);
    const assertMeasured = a => assert.ok(a instanceof Measured, 'not an instance of Measured');

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

        static concat(left, right) {
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
    }

    class Deep extends FingerTree {
        prefix = null; // 1-4 list of type `a`
        deeper = null; // reference to another fingertree of type `Node a`
        suffix = null; // 1-4 list of type `a`

        static measureAffix(affix = []) {
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
    }

    return process.env.NODE_ENV === 'production'
        ? { Empty, Single, FingerTree } // avoid malformed Deep tree
        : { Empty, Single, Deep, FingerTree };
};
