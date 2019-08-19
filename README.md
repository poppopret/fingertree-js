# fingertree-js
This is a Javascript implementation of [Finger tree](https://en.wikipedia.org/wiki/Finger_tree), which can be used to implement other data structures.

## Setup
Using npm:
```bash
npm install fingertree-js
```
In your project:
```javascript
import init, {Monoid, Measured} from 'fingertree-js';
```
## API

### Init
#### Monoid
This is a abstract class, you can inherit it to creat your own monoid
```javascript
import { Monoid } from 'fingertree-js';
export class SizeMonoid extends Monoid {
    static get mempty() { return 0; } // must be implemented
    static mappend(a, b) { return a + b; } // must be implemented
}
```
#### Measured
Also a abstract class, it's for something that can be measured.
```javascript
import { Measured } from 'fingertree-js';
class Character extends Measured {
    constructor(char) {
        super();
        this.char = char; // just for example
    }

    measure() { return 1; } // you must implement this method. For example, a character has size 1
}
```
#### init(Monoid)
Get your configured finger tree classes, which will be used in construction and examining;
```javascript
import init from 'fingertree-js';
const { Empty, Single, FingerTree } = init(SizeMonoid);
```

### Construction
#### Empty
Returns a new empty tree
```javascript
let tree = new Empty;
```
#### Single
Returns a new tree with one measured element
```javascript
let tree = new Single(new Character('a'));
```
#### tree.prepend(measured)
Add an element to the left end and returns a new tree
```javascript
let newTree = tree.prepend(new Character('b'));
```
#### tree.append(measured)
Add an element to the right end and returns a new tree
```javascript
let newTree = tree.append(new Character('c'));
```
#### FingerTree.concat(leftTree, rightTree)
Concat two trees and return the new one
```javascript
let tree = FingerTree.concat(leftTree, rightTree);
```
#### FingerTree.fromList([measured])
Create a tree from a list consists of the measured
```javascript
let list = ['a', 'b', 'c'].map(char => new Character(char));
let tree = FingerTree.fromList(list);
```

### Examine
#### tree.viewl(peek = false)
Returns the left-most element if `peek` set to `true`, otherwise an array like `[element, treeFromOtherElements]`.
If not found, returns `undefined` and `[]` respectively.
```javascript
let x = empty.viewl(true); // got undefined
let result = empty.viewl(); // got []
let x = tree.viewl(true); // got the left-most element if tree is not empty
let [x, tree] = tree.viewl(); // x is now left-most element and tree is a new tree from rest elements, can be a empty tree
```
#### tree.viewr(peek = false)
Returns the right-most element if `peek` set to `true`, otherwise an array like `[treeFromOtherElements, element]`.
If not found, returns `undefined` and `[]` respectively.
```javascript
let x = empty.viewr(true); // got undefined
let result = empty.viewr(); // got []
let x = tree.viewr(true); // got the right-most element if tree is not empty
let [x, tree] = tree.viewr(); // x is now right-most element and tree is a new tree from rest elements, can be a empty tree
```
#### tree.measure()
Returns the measured value of the tree
```javascript
let v = tree.measure(); // got 100, for example
```

### Search
#### tree.search(predicate)
Search a tree for a point where a predicate changes from `False` to `True`. `predicate` is a function returns `Boolean` from two arguments `(measureLeft, measureRight)`. The tree takes the predicate function and returns an array like `[leftTree, target, rightTree]` which makes `predicate(leftTree.measure(), rightTree.prepend(target).measure())` `False` and `predicate(leftTree.append(target).measure(), rightTree.measure())` `True`. If no such point is found, `[]` is returned instead. The `predicate` must be monotonic.
```javascript
const at = index => (vl, vr) => index < 0 ? vr + 1 <= -index : vl - 1 >= index; // you can ignore vr completely and use vl only if you like
tree.search(at(1)); // find sequence for the 1st elemnt, zero indexed. Got [single, target, empty], for example.
tree.search(at(-1)); // find the last element. Got [tree, target, single], for example.
```

## References
* [Finger trees: a simple general-purpose data structure](http://staff.city.ac.uk/~ross/papers/FingerTree.html) by Ross Paterson and Ralf Hinze
* [Haskell implemention](https://hackage.haskell.org/package/fingertree-0.1.4.2/docs/Data-FingerTree.html) by Ross Paterson and Ralf Hinze
* [A great blog](http://andrew.gibiansky.com/blog/haskell/finger-trees/) by Andrew Gibiansky
