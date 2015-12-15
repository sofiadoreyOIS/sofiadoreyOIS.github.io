$(window).load -> #  ಠ_ಠ Canvas + images + latency = dumb stuff like this

  $('#loading').hide()

  # Canvas setup
  sketch = $('#sketch')[0]
  ctx = sketch.getContext '2d'
  ctx.textBaseline = 'middle'
  ctx.font = '20px sans-serif'
  ctx.strokeStyle = '#fff'

  # Image refs
  backgroundImg = $('#background')[0]
  pierImg = $('#pier')[0]
  dockImg = $('#dock')[0]
  waterImg = $('#water')[0]
  bStartImg = $('#bridge-start')[0]
  bMiddleImg = $('#bridge-middle')[0]
  bEndImg = $('#bridge-end')[0]

  # DOM refs
  $randomize = $('#randomize')
  $length = $('#length')
  $submit = $('#submit')

  # Dimensions
  width = sketch.width
  height = sketch.height

  startMargin = -9
  startWidth = bStartImg.width - 1
  pieceWidth = bMiddleImg.width - 1
  endWidth = bEndImg.width

  pivot =
    x: 81
    y: 228

  minY = 233
  maxY = height - 33 # <-- dockImg.height

  bridgeMinMeters = 4.3 # Anything shorter and the bridge looks broken
  bridgeMaxMeters = 1000

  # Aliases
  cos = Math.cos
  tan = Math.tan
  sin = Math.sin
  arcsin = Math.asin
  PI = Math.PI

  # Gobal time and gravity
  t = 0
  g = 50 # <-- This is the world we live in now. Deal with it.

  # Alert message text
  currentAlertMessage = ''

  # Conversion helpers
  m2px = (m) -> #5m == 138px
    m*138/5

  px2m = (px) ->
    px*5/138

  rad2deg = (rad) ->
    rad*180/PI

  # The Dock
  class Dock
    constructor: (@x = 350, @y = 370) ->
      @stepSize = 0.1
      @yBound = @y
      @animating = true
      @worldX = (px2m @x).toFixed(1)
      @worldY = (px2m @y-minY).toFixed(1)

    render: ->
      ctx.drawImage dockImg, @x + pivot.x, @y
      ctx.drawImage waterImg, 0, @y + 33

    setPos: (x, y) ->
      [@x, @y, @yBound] = [x, y, y]
      t = 0
      @worldX = (px2m @x).toFixed(1)
      @worldY = (px2m @y-minY).toFixed(1)
      @render()

    play: ->
      @animating = true

    pause: ->
      @animating = false

    update: ->
      fraction = 0.5 * (cos(t/5 - PI) + 1) # Tidal easing
      @y = minY + fraction * (@yBound - minY)
      t += @stepSize unless not @animating
      @render()

  # The Bridge
  class Bridge
    constructor: (@length, @dockInstance) ->
      @visible = false

    init: ->
      @numPieces()
      @theta = 0
      @v = 0
      @k = g/@length # Scale parameter for the pendulum effect
      @freeFalling = false

    isFalling: ->
      @h/tan(@theta) <= @dockInstance.x

    numPieces: ->
      composableLength = @length - startWidth - startMargin
      @pieces = Math.floor(composableLength / pieceWidth)
      @remainder = composableLength - pieceWidth*@pieces

    render: ->
      return unless @visible
      ctx.save()
      ctx.translate pivot.x, pivot.y
      ctx.rotate @theta
      ctx.drawImage bStartImg, startMargin, -55
      ctx.drawImage bEndImg, startMargin + startWidth + @pieces*pieceWidth - (endWidth - @remainder), -55
      ctx.drawImage bMiddleImg, startMargin + startWidth, -55
      ctx.drawImage bMiddleImg, startMargin + startWidth + i*pieceWidth, -55 for i in [1...@pieces]
      ctx.restore()

    update: ->
      if @isFalling()
        @freeFalling = true
        fallingTime = 0 unless fallingTimeSet
        fallingTimeSet = true
      if not @freeFalling
        @h = @dockInstance.y - minY
        @theta = arcsin @h/@length
        @v = 0.1 * sin(t/5) # d/dt easing fn, keep track of current velocity
      else
        # Physics voodoo for the pendulum effect
        fallingTime += @dockInstance.stepSize
        a = @k*sin(PI/2-@theta)
        @v += a*fallingTime
        @theta += @v*fallingTime unless @theta >= PI/2
      @worldTheta = rad2deg @theta
      @render()

    setLength: (len) ->
      @length = len
      @init()

    hide: ->
      @visible = false

    show: ->
      @visible = true

  # Instances
  dock = new Dock m2px(7), minY + m2px(5)
  bridge = new Bridge 600, dock
  bridge.init()

  # Annotations
  annotate = ->
    ctx.fillStyle = '#fff'

    xTextPos =
      x: pivot.x + dock.x/2 + 9
      y: dock.yBound + 33/2
      width: ctx.measureText("#{dock.worldX} m").width

    yTextPos =
      x: 125
      y: (minY + dock.yBound)/2

    capLength = 10

    # Text labels
    if bridge.visible
      ctx.textAlign = 'left'
      ctx.fillText "#{Math.round rad2deg(bridge.theta)}°", 28, 248
    ctx.textAlign = 'center'
    ctx.fillText "#{dock.worldX} m", xTextPos.x, xTextPos.y
    ctx.fillText "#{dock.worldY} m", yTextPos.x, yTextPos.y

    # Measurement line (X)
    ctx.beginPath()
    ctx.moveTo pivot.x + 5, dock.yBound + 33/2
    ctx.lineTo xTextPos.x - xTextPos.width/2 - 5, dock.yBound + 33/2
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo xTextPos.x + xTextPos.width/2 + 5, dock.yBound + 33/2
    ctx.lineTo pivot.x + dock.x - 2, dock.yBound + 33/2
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo pivot.x + 5, dock.yBound + 33/2 - capLength/2
    ctx.lineTo pivot.x + 5, dock.yBound + 33/2 + capLength/2
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo pivot.x + dock.x - 2, dock.yBound + 33/2 - capLength/2
    ctx.lineTo pivot.x + dock.x - 2, dock.yBound + 33/2 + capLength/2
    ctx.stroke()

    # Measurement line (Y)
    ctx.beginPath()
    ctx.moveTo yTextPos.x, pivot.y + 6
    ctx.lineTo yTextPos.x, yTextPos.y - 15
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo yTextPos.x, yTextPos.y + 15
    ctx.lineTo yTextPos.x, dock.yBound
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo yTextPos.x - capLength/2, pivot.y + 6
    ctx.lineTo yTextPos.x + capLength/2, pivot.y + 6
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo yTextPos.x - capLength/2, dock.yBound
    ctx.lineTo yTextPos.x + capLength/2, dock.yBound
    ctx.stroke()

  alertMessage = (message) ->
    ctx.textAlign = 'left'
    ctx.fillStyle = '#43808e'
    ctx.fillText message, 560, 33

  # Handlers
  randomize = ->
    # meter (world) values for minX, maxX, minY, maxY
    x = Math.random() * (27.1-10.9) + 10.9
    y = Math.random() * (18.3-9.7) + 9.7
    dock.setPos m2px(x), m2px(y)
    bridge.hide()
    $length.val ''
    currentAlertMessage = ''
  $randomize.click randomize

  buildBridge = ->
    len = +$length.val()
    if isNaN len
      currentAlertMessage = "Not sure what you mean."
      return
    if len < bridgeMinMeters
      currentAlertMessage = "That's a pretty short bridge."
      return
    if len > bridgeMaxMeters
      currentAlertMessage = "That's a pretty long bridge."
      return
    currentAlertMessage = ''
    bridge.setLength m2px(len)
    bridge.show()
    dock.play()

  $submit.click ->
    buildBridge()
    $(this).blur()

  $length.focus ->
    t = 0
    dock.pause()

  $length.blur ->
    dock.play()

  # rAF polyfill for people who need these kinds of things
  # http://strd6.com/2011/05/better-window-requestanimationframe-shim/
  window.requestAnimationFrame ||=
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    (callback, element) ->
      window.setTimeout( ->
        callback(+new Date())
      , 1000 / 60)

  # Main draw loop
  draw = ->
    ctx.clearRect 0, 0, width, height
    ctx.drawImage backgroundImg, 0, 0
    ctx.drawImage pierImg, 0, 187.5
    bridge.update()
    dock.update()
    annotate()
    alertMessage currentAlertMessage
    requestAnimationFrame draw

  # Kick things off
  draw()

