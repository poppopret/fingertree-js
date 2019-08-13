/**
 * Abstract class for something that can be measured.
 * FingerTree, Node and user defined values should be measurable.
 *
 * @export
 * @class Measured
 */
export class Measured {
    measure() {
        throw new Error('Abstract method measure not implemented!');
    }
}

/**
 * Abstract monoid class
 *
 * @export
 * @class Monoid
 */
export class Monoid {
    static get mempty() {
        throw new Error('Abstract getter mempty not implemented!');
    }

    static mappend() {
        throw new Error('Abstract method mappend not implemented!');
    }
}
