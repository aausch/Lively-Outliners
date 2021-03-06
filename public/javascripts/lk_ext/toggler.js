lobby.transporter.module.create('toggler', function(requires) {}, function(thisModule) {


thisModule.addSlots(modules.toggler, function(add) {
    
    add.data('_directory', 'lk_ext');

});


thisModule.addSlots(lobby, function(add) {

  add.creator('toggler', {}, {category: ['ui']});

});


thisModule.addSlots(toggler, function(add) {

  add.method('initialize', function(updateFunction, morphToShowOrHide) {
    this._updateFunction = updateFunction;
    this._morphToShowOrHide = morphToShowOrHide;
    this._valueHolder = booleanHolder.containing(false);
    this._valueHolder.add_observer(this.valueChanged.bind(this));
  });

  add.method('toggle', function(evt) { this._valueHolder.toggle(evt); });

  add.method('isOn', function() { return this._valueHolder.getValue(); });

  add.method('setValue', function(b, evt) { this._valueHolder.setValue(b, evt); });

  add.method('beOn', function(evt) { this.setValue(true, evt); });

  add.method('beOff', function(evt) { this.setValue(false, evt); });

  add.method('valueChanged', function(valueHolder, evt) {
    this._updateFunction();
    if (this.isOn()) { this.actualMorphToShow().wasJustShown(evt); }
  });

  add.method('shouldNotBeShown', function() { return ! this.isOn(); });

  add.method('actualMorphToShow', function() {
    var m = this._morphToShowOrHide;
    return typeof(m) === 'function' ? m() : m;
  });

});


thisModule.addSlots(Morph.prototype, function(add) {
  add.method('wasJustShown', function(evt) { });
});

thisModule.addSlots(TextMorph.prototype, function(add) {
  add.method('wasJustShown', function(evt) { this.requestKeyboardFocus(evt.hand); });
});



});
