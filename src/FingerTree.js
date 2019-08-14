import { Measured } from './abstract';
import Node from './Node';
import { connect, assert } from './utils';

export default Monoid => {
    const { Node3 } = connect(Node)(Monoid);

    class FingerTree extends Measured {
        v = Monoid.mempty; // monoidal annotation, named by convention `FingerTree v a`

        constructor(v = Monoid.mempty) {
            super();
            this.v = v;
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

        static fromList(list = []) {
            return list.reduceRight((tree, item) => tree.prepend(item), new Empty);
        }
    }

    class Empty extends FingerTree {
        prepend(a) { return new Single(a); }

        append(a) { return new Single(a); }

        viewl(peek = false) { return peek ? undefined : []; }

        viewr(peek = false) { return peek ? undefined : []; }
    }

    class Single extends FingerTree {
        a = null; // named by convention `Single a`

        constructor(a, v = a.measure()) {
            super(v);
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
            // validate params
            [prefix, suffix].forEach(affix => assert.all([
                Array.isArray(affix),
                affix.length >= 1,
                affix.length <= 4
            ], 'Deep affix error'));
            assert.ok(deeper instanceof FingerTree, 'Deep deeper error');

            this.prefix = prefix;
            this.suffix = suffix;
            this.deeper = deeper;
        }

        prepend(a) {
            // reuse the current tree
            this.v = Monoid.mappend(a.measure(), this.measure());
            if (this.prefix.length === 4) {
                let [b, c, d, e] = this.prefix;
                this.prefix = [a, b];
                this.deeper = this.deeper.prepend(new Node3([c, d, e]));
            } else {
                this.prefix = [a, ...this.prefix];
            }
            return this;
        }

        append(e) {
            // reuse the current tree
            this.v = Monoid.mappend(this.measure(), e.measure());
            if (this.suffix.length === 4) {
                let [a, b, c, d] = this.suffix;
                this.deeper = this.deeper.append(new Node3([a, b, c]));
                this.suffix = [d, e];
            } else {
                this.suffix = [...this.suffix, e];
            }
            return this;
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
    }

    return { Empty, Single, Deep };
};
