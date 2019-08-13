import { Measured } from './abstract';

export default Monoid => {
    class Node extends Measured {
        v = Monoid.mempty; // monoidal annotation
        nodes = []; // 2-3 children

        constructor(nodes, v = nodes.map(a => a.measure()).reduce(Monoid.mappend, Monoid.mempty)) {
            super();
            this.nodes = nodes;
            this.v = v;
        }

        measure() {
            return this.v;
        }
    }

    class Node2 extends Node {
        constructor(nodes, v) {
            if (!Array.isArray(nodes) || nodes.length !== 2) {
                throw new Error('Node2 should have exactly 2 children');
            }
            super(nodes, v);
        }
    }

    class Node3 extends Node {
        constructor(nodes, v) {
            if (!Array.isArray(nodes) || nodes.length !== 3) {
                throw new Error('Node3 should have exactly 3 children');
            }
            super(nodes, v);
        }
    }

    return { Node2, Node3 };
};
