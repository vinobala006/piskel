/**
 * @provide pskl.drawingtools.SimplePen
 *
 * @require pskl.utils
 */
(function() {
  var ns = $.namespace("pskl.drawingtools");

  ns.SimplePen = function() {
    this.toolId = "tool-pen";
    this.helpText = "Pen tool";

    this.previousCol = null;
    this.previousRow = null;

    this.pixels = [];
  };

  pskl.utils.inherit(ns.SimplePen, ns.BaseTool);

  /**
   * @override
   */
  ns.SimplePen.prototype.applyToolAt = function(col, row, color, frame, overlay, event) {
    frame.setPixel(col, row, color);
    this.previousCol = col;
    this.previousRow = row;
    this.pixels.push({
      col : col,
      row : row
    });
  };

  /**
   * @override
   */
  ns.SimplePen.prototype.moveToolAt = function(col, row, color, frame, overlay, event) {
    if((Math.abs(col - this.previousCol) > 1) || (Math.abs(row - this.previousRow) > 1)) {
      // The pen movement is too fast for the mousemove frequency, there is a gap between the
      // current point and the previously drawn one.
      // We fill the gap by calculating missing dots (simple linear interpolation) and draw them.
      var interpolatedPixels = this.getLinePixels_(col, this.previousCol, row, this.previousRow);
      for(var i=0, l=interpolatedPixels.length; i<l; i++) {
        var coords = interpolatedPixels[i];
        this.applyToolAt(coords.col, coords.row, color, frame, overlay);
      }
    }
    else {
      this.applyToolAt(col, row, color, frame, overlay);
    }

    this.previousCol = col;
    this.previousRow = row;
  };


  ns.SimplePen.prototype.releaseToolAt = function(col, row, color, frame, overlay, event) {
    $.publish(Events.PISKEL_SAVE_STATE, {
      type : 'TOOL',
      tool : this,
      replay : {
        pixels : this.pixels.slice(0),
        color : color
      }
    });
    this.pixels = [];
  };

  ns.SimplePen.prototype.replay = function (frame, replayData) {
    var pixels = replayData.pixels;
    pixels.forEach(function (pixel) {
      frame.setPixel(pixel.col, pixel.row, replayData.color);
    });
  };
})();
