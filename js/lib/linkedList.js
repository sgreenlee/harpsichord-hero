function Node (item, prev, next) {
  this.item = item;
  this.prev = prev || null;
  this.next = next || null;
}

Node.prototype.delete = function () {
  this.prev.next = this.next;
  this.next.prev = this.prev;
};

function LinkedList () {
  this._head = new Node(null);
  this._tail = new Node(null);
  this._tail.prev = this._head;
  this._head.next = this._tail;
}

LinkedList.prototype.add = function (item) {
  var node = new Node(item);
  node.prev = this._tail.prev;
  node.next = this._tail;
  this._tail.prev.next = node;
  this._tail.prev = node;
};

LinkedList.prototype.forEach = function(callback) {
  var argsArray = [].slice.call(arguments, 1);
  var currentNode = this._head.next;
  while (currentNode.next !== null) {
    callback.apply(null, [currentNode].concat(argsArray));
    currentNode = currentNode.next;
  }
};

LinkedList.prototype.while = function (truthyFunc, callback) {
  var argsArray = [].slice.call(arguments, 2);
  var currentNode = this._head.next;
  while (currentNode.next !== null && truthyFunc(currentNode)) {
    callback.apply(null, [currentNode].concat(argsArray));
    currentNode = currentNode.next;
  }
};

module.exports = LinkedList;
