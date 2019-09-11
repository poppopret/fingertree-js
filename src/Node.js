import { Measured } from './abstract';

export default Monoid => {
    class Node extends Measured {
        v = Monoid.mempty; // monoidal annotation
        nodes = []; // 2-3 children

        constructor(nodes, v = Monoid.mconcat(nodes.map(a => a.measure()))) {
            super();
            this.nodes = nodes;
            this.v = v;
        }

        measure() {
            return this.v;
        }

        toList() {
            return this.nodes.reduce((list, node) => {
                return list.concat(node instanceof Node ? node.toList() : node);
            }, []);
        }

        static nodes(xs) {
            let len = xs.length;
            switch (len) {
                case 0:
                case 1: throw new Error('not enough nodes');
                case 2: return [new Node2([...xs])];
                case 3: return [new Node3([...xs])];
                case 4: return [new Node2(xs.slice(0, 2)), new Node2(xs.slice(2))];
                default: return [new Node3(xs.slice(0, 3)), ...Node.nodes(xs.slice(3))];
            }
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

    return { Node2, Node3, Node };
};
