lobby.transporter.module.create('snapshotter', function(requires) {

requires('transporter', 'object_graph_walker');

}, function(thisModule) {


thisModule.addSlots(modules.snapshotter, function(add) {

  add.data('_directory', 'transporter');

});


thisModule.addSlots(lobby, function(add) {

  add.method('Snapshotter', function Snapshotter() { Class.initializer.apply(this, arguments); }, {category: ['transporter']});

});


thisModule.addSlots(Snapshotter, function(add) {

  add.data('superclass', ObjectGraphWalker);

  add.creator('prototype', Object.create(ObjectGraphWalker.prototype));

  add.data('type', 'Snapshotter');

  add.data('currentNumber', 0, {comment: 'Used to mark the objects as we snapshot them, so that we know we have already included them in this snapshot.'});

});


thisModule.addSlots(Snapshotter.prototype, function(add) {

  add.data('constructor', Snapshotter);

  add.data('_objectsByOID', []);

  add.method('initialize', function ($super) {
    $super();
    this._number = (++Snapshotter.currentNumber);
    this._objectsByOID = [];
    this._buffer = stringBuffer.create();
  });

  add.data('namesToIgnore', ["__snapshotNumberOfOID__", "__snapshotNumber__", "__oid__", "localStorage", "sessionStorage", "globalStorage", "enabledPlugin"], {comment: 'Having enabledPlugin in here is just a hack for now - what\'s this clientInformation thing, and what are these arrays that aren\'t really arrays?', initializeTo: '["__annotation__", "enabledPlugin"]'});

  add.data('shouldWalkIndexables', true);

  add.method('oidForObject', function (o) {
    if (o.hasOwnProperty('__snapshotNumberOfOID__') && o.__snapshotNumberOfOID__ === this._number) { return o.__oid__; }
    var parent = o['__proto__'];
    if (parent) { this.oidForObject(parent); } // make sure the parent gets created before the child
    var oid = this._objectsByOID.length;
    o.__oid__ = oid;
    this._objectsByOID.push(o);
    o.__snapshotNumberOfOID__ = this._number;
    return oid;
  });

  add.method('markObject', function (o) {
    if (o.hasOwnProperty('__snapshotNumber__') && o.__snapshotNumber__ === this._number) { return false; }
    o.__snapshotNumber__ = this._number;
    return true;
  });

  add.method('referenceTo', function (o) {
    if (o ===      null) { return 'null';      }
    if (o === undefined) { return 'undefined'; }
    var t = typeof(o);
    if (t === 'number' || t === 'string' || t === 'boolean') { return Object.inspect(o); }
    if (this.isNativeFunction(o)) { return reflect(o).creatorSlotChainExpression(); }
    var oid = this.oidForObject(o);
    return "(__objectsByOID__[" + oid + "])";
  });

  add.method('reachedObject', function (o) {
    // anything to do here?
  });

  add.method('isNativeFunction', function (o) {
    // Is there a better way to test for native functions?
    return typeof(o) === 'function' && o.toString().include('[native code]') && o !== this.isNativeFunction;
  });

  add.method('reachedSlot', function (holder, slotName, contents) {
    var holderAnno = annotator.existingAnnotationOf(holder);
    if (holderAnno) {
      var slotAnno = holderAnno.existingSlotAnnotation(slotName);
      if (slotAnno && slotAnno.module === modules.init) { return; }
    }
    if (slotName === 'currentWorld') { return; } // aaa hack
    if (contents && contents.hasOwnProperty('rawNode') && contents !== contents.constructor.prototype) {
      throw "Hey, what's this thing with a rawNode getting snapshotted for? " + slotName;
    }
    this._buffer.append(this.referenceTo(holder)).append('[').append(slotName.inspect()).append('] = ').append(this.referenceTo(contents)).append(';\n');
  });

  add.method('creationStringFor', function (o) {
    if (o.storeString) {
      if (!o.storeStringNeeds || o !== o.storeStringNeeds()) {
        return o.storeString();
      }
    }

    var mir = reflect(o);
    var cs = mir.creatorSlot();
    if (cs && cs.module() === modules.init /* && cs.contents().equals(mir) */) { return mir.creatorSlotChainExpression(); }

    var t = typeof(o);
    if (t === 'function') {
      if (this.isNativeFunction(o)) { return mir.creatorSlotChainExpression(); }
      if (o instanceof RegExp) { return "new RegExp(" + RegExp.escape(o.source).inspect() + ")"; }
      return o.toString();
    }
    if (mir.isReflecteeArray()) { return '[]'; }

    var parent = o['__proto__'];
    if (parent === Object.prototype) { return '{}'; } // not really necessary, but looks nicer
    return 'createChildOf(' + this.referenceTo(parent) + ')';
  });

  add.method('completeSnapshotText', function () {
    var setupBuf = stringBuffer.create('(function() {\n');
    setupBuf.append("var createChildOf = function(parent) { function F() {}; F.prototype = parent; return new F(); };\n");
    setupBuf.append("var __objectsByOID__ = [];\n");
    for (var i = 0, n = this._objectsByOID.length; i < n; ++i) {
      var o = this._objectsByOID[i];
      setupBuf.append('__objectsByOID__[').append(i).append('] = ').append(this.creationStringFor(o)).append(';\n');
    }

    var tearDownBuf = stringBuffer.create('\n');
    tearDownBuf.append('var canvas = Global.document.getElementById("canvas");\n');
    // aaa - For now, let's just create a new world - recreating the morphs is tricky, I think.
    // tearDownBuf.append('WorldMorph.current().displayOnCanvas(canvas);\n');
    tearDownBuf.append('new WorldMorph(canvas).displayOnCanvas(canvas);\n');
    tearDownBuf.append('})();\n');

    return setupBuf.concat(this._buffer, tearDownBuf).toString();
  });

});


thisModule.addSlots(Morph.prototype, function(add) {

  add.method('storeString', function () {
    return 'null'; // aaa - Is there a way to file out a morph?
  });

  add.method('storeStringNeeds', function () {
    return this.constructor.prototype;
  });

});


});
