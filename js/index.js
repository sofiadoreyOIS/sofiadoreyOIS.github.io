// Generated by CoffeeScript 1.9.3
(function() {
  $(window).load(function() {
    var $length, $randomize, $submit, Bridge, Dock, PI, alertMessage, annotate, arcsin, bEndImg, bMiddleImg, bStartImg, backgroundImg, bridge, bridgeMaxMeters, bridgeMinMeters, buildBridge, cos, ctx, currentAlertMessage, dock, dockImg, draw, endWidth, g, height, m2px, maxY, minY, pieceWidth, pierImg, pivot, px2m, rad2deg, randomize, sin, sketch, startMargin, startWidth, t, tan, waterImg, width;
    $('#loading').hide();
    sketch = $('#sketch')[0];
    ctx = sketch.getContext('2d');
    ctx.textBaseline = 'middle';
    ctx.font = '20px sans-serif';
    ctx.strokeStyle = '#fff';
    backgroundImg = $('#background')[0];
    pierImg = $('#pier')[0];
    dockImg = $('#dock')[0];
    waterImg = $('#water')[0];
    bStartImg = $('#bridge-start')[0];
    bMiddleImg = $('#bridge-middle')[0];
    bEndImg = $('#bridge-end')[0];
    $randomize = $('#randomize');
    $length = $('#length');
    $submit = $('#submit');
    width = sketch.width;
    height = sketch.height;
    startMargin = -9;
    startWidth = bStartImg.width - 1;
    pieceWidth = bMiddleImg.width - 1;
    endWidth = bEndImg.width;
    pivot = {
      x: 81,
      y: 228
    };
    minY = 233;
    maxY = height - 33;
    bridgeMinMeters = 4.3;
    bridgeMaxMeters = 1000;
    cos = Math.cos;
    tan = Math.tan;
    sin = Math.sin;
    arcsin = Math.asin;
    PI = Math.PI;
    t = 0;
    g = 50;
    currentAlertMessage = '';
    m2px = function(m) {
      return m * 138 / 5;
    };
    px2m = function(px) {
      return px * 5 / 138;
    };
    rad2deg = function(rad) {
      return rad * 180 / PI;
    };
    Dock = (function() {
      function Dock(x1, y1) {
        this.x = x1 != null ? x1 : 350;
        this.y = y1 != null ? y1 : 370;
        this.stepSize = 0.1;
        this.yBound = this.y;
        this.animating = true;
        this.worldX = (px2m(this.x)).toFixed(1);
        this.worldY = (px2m(this.y - minY)).toFixed(1);
      }

      Dock.prototype.render = function() {
        ctx.drawImage(dockImg, this.x + pivot.x, this.y);
        return ctx.drawImage(waterImg, 0, this.y + 33);
      };

      Dock.prototype.setPos = function(x, y) {
        var ref;
        ref = [x, y, y], this.x = ref[0], this.y = ref[1], this.yBound = ref[2];
        t = 0;
        this.worldX = (px2m(this.x)).toFixed(1);
        this.worldY = (px2m(this.y - minY)).toFixed(1);
        return this.render();
      };

      Dock.prototype.play = function() {
        return this.animating = true;
      };

      Dock.prototype.pause = function() {
        return this.animating = false;
      };

      Dock.prototype.update = function() {
        var fraction;
        fraction = 0.5 * (cos(t / 5 - PI) + 1);
        this.y = minY + fraction * (this.yBound - minY);
        if (!!this.animating) {
          t += this.stepSize;
        }
        return this.render();
      };

      return Dock;

    })();
    Bridge = (function() {
      function Bridge(length, dockInstance) {
        this.length = length;
        this.dockInstance = dockInstance;
        this.visible = false;
      }

      Bridge.prototype.init = function() {
        this.numPieces();
        this.theta = 0;
        this.v = 0;
        this.k = g / this.length;
        return this.freeFalling = false;
      };

      Bridge.prototype.isFalling = function() {
        return this.h / tan(this.theta) <= this.dockInstance.x;
      };

      Bridge.prototype.numPieces = function() {
        var composableLength;
        composableLength = this.length - startWidth - startMargin;
        this.pieces = Math.floor(composableLength / pieceWidth);
        return this.remainder = composableLength - pieceWidth * this.pieces;
      };

      Bridge.prototype.render = function() {
        var i, j, ref;
        if (!this.visible) {
          return;
        }
        ctx.save();
        ctx.translate(pivot.x, pivot.y);
        ctx.rotate(this.theta);
        ctx.drawImage(bStartImg, startMargin, -55);
        ctx.drawImage(bEndImg, startMargin + startWidth + this.pieces * pieceWidth - (endWidth - this.remainder), -55);
        ctx.drawImage(bMiddleImg, startMargin + startWidth, -55);
        for (i = j = 1, ref = this.pieces; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
          ctx.drawImage(bMiddleImg, startMargin + startWidth + i * pieceWidth, -55);
        }
        return ctx.restore();
      };

      Bridge.prototype.update = function() {
        var a, fallingTime, fallingTimeSet;
        if (this.isFalling()) {
          this.freeFalling = true;
          if (!fallingTimeSet) {
            fallingTime = 0;
          }
          fallingTimeSet = true;
        }
        if (!this.freeFalling) {
          this.h = this.dockInstance.y - minY;
          this.theta = arcsin(this.h / this.length);
          this.v = 0.1 * sin(t / 5);
        } else {
          fallingTime += this.dockInstance.stepSize;
          a = this.k * sin(PI / 2 - this.theta);
          this.v += a * fallingTime;
          if (!(this.theta >= PI / 2)) {
            this.theta += this.v * fallingTime;
          }
        }
        this.worldTheta = rad2deg(this.theta);
        return this.render();
      };

      Bridge.prototype.setLength = function(len) {
        this.length = len;
        return this.init();
      };

      Bridge.prototype.hide = function() {
        return this.visible = false;
      };

      Bridge.prototype.show = function() {
        return this.visible = true;
      };

      return Bridge;

    })();
    dock = new Dock(m2px(7), minY + m2px(5));
    bridge = new Bridge(600, dock);
    bridge.init();
    annotate = function() {
      var capLength, xTextPos, yTextPos;
      ctx.fillStyle = '#fff';
      xTextPos = {
        x: pivot.x + dock.x / 2 + 9,
        y: dock.yBound + 33 / 2,
        width: ctx.measureText(dock.worldX + " m").width
      };
      yTextPos = {
        x: 125,
        y: (minY + dock.yBound) / 2
      };
      capLength = 10;
      if (bridge.visible) {
        ctx.textAlign = 'left';
        ctx.fillText((Math.round(rad2deg(bridge.theta))) + "°", 28, 248);
      }
      ctx.textAlign = 'center';
      ctx.fillText(dock.worldX + " m", xTextPos.x, xTextPos.y);
      ctx.fillText(dock.worldY + " m", yTextPos.x, yTextPos.y);
      ctx.beginPath();
      ctx.moveTo(pivot.x + 5, dock.yBound + 33 / 2);
      ctx.lineTo(xTextPos.x - xTextPos.width / 2 - 5, dock.yBound + 33 / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(xTextPos.x + xTextPos.width / 2 + 5, dock.yBound + 33 / 2);
      ctx.lineTo(pivot.x + dock.x - 2, dock.yBound + 33 / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pivot.x + 5, dock.yBound + 33 / 2 - capLength / 2);
      ctx.lineTo(pivot.x + 5, dock.yBound + 33 / 2 + capLength / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pivot.x + dock.x - 2, dock.yBound + 33 / 2 - capLength / 2);
      ctx.lineTo(pivot.x + dock.x - 2, dock.yBound + 33 / 2 + capLength / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(yTextPos.x, pivot.y + 6);
      ctx.lineTo(yTextPos.x, yTextPos.y - 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(yTextPos.x, yTextPos.y + 15);
      ctx.lineTo(yTextPos.x, dock.yBound);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(yTextPos.x - capLength / 2, pivot.y + 6);
      ctx.lineTo(yTextPos.x + capLength / 2, pivot.y + 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(yTextPos.x - capLength / 2, dock.yBound);
      ctx.lineTo(yTextPos.x + capLength / 2, dock.yBound);
      return ctx.stroke();
    };
    alertMessage = function(message) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#43808e';
      return ctx.fillText(message, 560, 33);
    };
    randomize = function() {
      var x, y;
      x = 10.9;
      y = 9.7;
      dock.setPos(m2px(x), m2px(y));
      bridge.hide();
      $length.val('');
      return currentAlertMessage = '';
    };
    $randomize.click(randomize);
    buildBridge = function() {
      var len;
      len = +$length.val();
      if (isNaN(len)) {
        currentAlertMessage = "Not sure what you mean.";
        return;
      }
      if (len < bridgeMinMeters) {
        currentAlertMessage = "That's a pretty short bridge.";
        return;
      }
      if (len > bridgeMaxMeters) {
        currentAlertMessage = "That's a pretty long bridge.";
        return;
      }
      currentAlertMessage = '';
      bridge.setLength(m2px(len));
      bridge.show();
      return dock.play();
    };
    $submit.click(function() {
      buildBridge();
      return $(this).blur();
    });
    $length.focus(function() {
      t = 0;
      return dock.pause();
    });
    $length.blur(function() {
      return dock.play();
    });
    window.requestAnimationFrame || (window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
      return window.setTimeout(function() {
        return callback(+new Date());
      }, 1000 / 60);
    });
    draw = function() {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(backgroundImg, 0, 0);
      ctx.drawImage(pierImg, 0, 187.5);
      bridge.update();
      dock.update();
      annotate();
      alertMessage(currentAlertMessage);
      return requestAnimationFrame(draw);
    };
    return draw();
  });

}).call(this);
