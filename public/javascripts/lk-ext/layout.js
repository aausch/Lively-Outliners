// aaa - does LK already have a mechanism for this?

LayoutModes = {
 Rigid: {name: "rigid"},
 SpaceFill: {name: "space-fill"},
 ShrinkWrap: {name: "shrink-wrap"}
};


// aaa rename some of these methods
Morph.addMethods({
  minimumExtent: function() {
    // aaa - meh, don't bother caching yet, I'm scared that I haven't done this right
    return this._cachedMinimumExtent = this.getExtent();
  },

  new_rejiggerTheLayout: function(availableSpace) {
    // maybe nothing to do here
  },

  minimumExtentChanged: function() {
    this._cachedMinimumExtent = null;
    this.minimumExtent();
    var o = this.owner;
    if (!o || o instanceof WorldMorph || o instanceof HandMorph) {
      this.rejiggerTheLayoutIncludingSubmorphs();
    } else {
      o.minimumExtentChanged();
    }
  },


  rejiggerTheLayoutIncludingSubmorphs: function() {
    this.minimumExtent();
    this.new_rejiggerTheLayout(pt(100000, 100000));
  },

});
