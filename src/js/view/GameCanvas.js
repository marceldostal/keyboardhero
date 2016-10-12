/* global createjs */
module.exports = GameCanvas;

var Values = require('./../Values');
var Game = require('./../model/Game');

var game,
        canvas,
        stage,
        bg,
        highway,
        highwayWidth,
        buttons,
        fps,
        timer,
        points;

GameCanvas.menuHighscore = "menuHighscore";
GameCanvas.menuPause = "menuPause";
GameCanvas.menuLevel = "menuLevel";
GameCanvas.menuOptions = "menuOptions";
GameCanvas.menuHelp = "menuHelp";
GameCanvas.menuMain = "menuMain";

/**
 * View object, displays the game.
 * @param {Game} model
 * @returns {GameCanvas}
 */
function GameCanvas(model) {

    game = model;
    game.on("symboladded", createSymbol);
    game.on("symbolremoved", removeSymbol);
    game.on("togglePause", function (event) {
        hideMenues();
        showMenu(game.status === Game.PAUSED, GameCanvas.menuPause);
    });
    game.on("mainmenu", showMenuMain);
    game.on("highscore", showHighscore);
    game.on("level", showLevel);
    game.on("options", showOptions);
    game.on("help", showHelp);
    game.on("start", hideMenues);
    game.on("end", showHighscore);

    canvas = document.getElementById("game");
    stage = new createjs.Stage(canvas);

    bg = createBackground();
    highway = createHighway();
    buttons = createTouchButtons();
    fps = createFps();
    timer = createTimer();
    points = createPoints();

    stage.addChild(bg);
    stage.addChild(highway);
    highway.addChild(buttons);
    highway.addChild(fps);
    highway.addChild(timer);
    highway.addChild(points);

    createjs.Ticker.on("tick", tick);
    createjs.Ticker.framerate = 60;
    createjs.Ticker.timingMode = createjs.Ticker.RAF; // requestAnimationFrame    

    this.resize();

    showMenuMain();

}

/**
 * Returns the current createjs stage.
 * @returns {createjs.Stage|nm$_GameCanvas.stage}
 */
GameCanvas.prototype.getStage = function () {
    return stage;
};

/**
 * Resize event handler
 */
GameCanvas.prototype.resize = function () {
    // Resize the canvas element
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //redraw highway
    var highwayBg = highway.getChildByName("highwayBg");
    highwayWidth = canvas.width;
    highway.x = 0;
    if ((canvas.width) > Values.HIGHWAYMAXWIDTH) {
        highwayWidth = Values.HIGHWAYMAXWIDTH;
        highway.x = (canvas.width - Values.HIGHWAYMAXWIDTH) / 2;
    }

    var lineY = canvas.height * 0.6 / 5;
    highwayBg.graphics.clear();
    highwayBg.graphics.
            beginFill("#000").
            drawRect(0, 0, highwayWidth, canvas.height).
            beginFill("#8ED6FF").
            drawRect(1, 0, highwayWidth - 2, canvas.height).
            beginFill("#333").
            drawRect(4, 0, highwayWidth - 8, canvas.height).
            setStrokeStyle(4, "round").
            beginStroke('#777').moveTo(5, lineY * 1).lineTo(highwayWidth - 5, lineY * 1).endStroke().
            beginStroke('#777').moveTo(5, lineY * 2).lineTo(highwayWidth - 5, lineY * 2).endStroke().
            beginStroke('#777').moveTo(5, lineY * 3).lineTo(highwayWidth - 5, lineY * 3).endStroke().
            beginStroke('#777').moveTo(5, lineY * 4).lineTo(highwayWidth - 5, lineY * 4).endStroke().
            beginStroke('#F00').moveTo(5, lineY * 5).lineTo(highwayWidth - 5, lineY * 5).endStroke();


    var bw = (highwayWidth - 20) / (Values.MAXBUTTONS);
    var by = lineY * 6;
    for (var i = 0; i < buttons.numChildren; i++) {

        var btn = buttons.getChildAt(i);
        var bx = 10 + bw * i;
        var by2 = canvas.height - by;
        var color = Values.COLORS[i];
        btn.graphics.clear();
        btn.graphics
                .lf([color.c1, color.c2], [0, 1], bx, by, bx + bw, by)
                .drawRect(bx + 5, by + 5, bw - 10, by2 - 10)
                .lf([color.c2, color.c1], [0, 1], bx, by, bx + bw, by)
                .drawRect(bx + 10, by + 10, bw - 20, by2 - 20);

    }

    fps.y = stage.canvas.height - 35;

    timer.x = highwayWidth - 120;

    game.forEachSymbol(tweenSymbol);

    // Background: full screen redraw 
    bg.graphics.clear();
    bg.graphics.beginFill("#8ccffd").drawRect(0, 0,
            stage.canvas.width, stage.canvas.height);

    stage.update();
};

/**
 * Toggles the page to fullscreen.
 */
GameCanvas.prototype.toggleFullScreen = function () {
    blur(false);
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    } else {
        cancelFullScreen.call(doc);
    }
};

/**
 * Blurs the background behind a menu.
 * @param {type} showblur
 */
blur = function (showblur) {
    if (showblur) {
        stage.filters = [new createjs.BlurFilter(10, 10, 1)];
        stage.cache(0, 0, canvas.width, canvas.height);
    } else {
        stage.filters = [];
        stage.uncache();
    }
};

/**
 * Creates a html tr row with 3 td columns and adds the elements e1,e2,e3.
 * @param {type} e1
 * @param {type} e2
 * @param {type} e3
 * @returns {createRow.row|nm$_GameCanvas.createRow.row|Element}
 */
createRow = function (e1, e2, e3) {
    // creates a table row
    var row = document.createElement("tr");

    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    var td3 = document.createElement("td");
    td1.appendChild(e1);
    td2.appendChild(e2);
    td3.appendChild(e3);
    row.appendChild(td1);
    row.appendChild(td2);
    row.appendChild(td3);

    return row;
};

/**
 * Shows or hides a menu
 * @param {boolean} show
 * @param {String} menu
 */
showMenu = function (show, menu) {
    blur(show);
    document.getElementById(menu).style.display = show ? "block" : "none";
    createjs.Ticker.paused = game.status !== Game.PLAYING;
};

/**
 * Hides all menues.
 */
hideMenues = function () {
    showMenu(false, GameCanvas.menuMain);
    showMenu(false, GameCanvas.menuLevel);
    showMenu(false, GameCanvas.menuPause);
    showMenu(false, GameCanvas.menuHighscore);
    showMenu(false, GameCanvas.menuHelp);
    showMenu(false, GameCanvas.menuOptions);
};

/**
 * Shows the help menu
 * @param {type} event
 */
showHelp = function (event) {
    hideMenues();
    showMenu(true, GameCanvas.menuHelp);
};

/**
 * Shows the highscore menu
 * @param {type} event
 */
showHighscore = function (event) {
    var data = event.data;
    var tBody = document.getElementById("tableBodyHighscore");
    tBody.innerHTML = "";

    for (var i = 0; i < data.length; i++) {
        var d = event.data[i];

        var row = createRow(document.createTextNode(i + 1),
                document.createTextNode(d.name),
                document.createTextNode(d.score));
        tBody.appendChild(row);
    }
    hideMenues();
    showMenu(true, GameCanvas.menuHighscore);
};

/**
 * Shows the levelselection menu
 * @param {type} event
 */
showLevel = function (event) {
    console.log("select level");
    var data = event.data;
    var tBody = document.getElementById("tableBodyLevel");
    tBody.innerHTML = "";

    for (var i = 0; i < data.length; i++) {
        var d = event.data[i];

        var start = document.createElement("input");
        start.setAttribute("type", "radio");
        start.setAttribute("name", "radioLevel");
        start.setAttribute("value", d.json);
        if (i === 0)
            start.checked = true;

        var row = createRow(document.createTextNode(d.title),
                document.createTextNode(d.artist),
                start);
        tBody.appendChild(row);

    }
    hideMenues();
    showMenu(true, GameCanvas.menuLevel);
};

/**
 * Shows the main menu
 * @param {type} event
 */
showMenuMain = function (event) {
    console.log("MainMenu");
    hideMenues();
    showMenu(true, GameCanvas.menuMain);
};

/**
 * Shows the options menu
 * @param {type} event
 */
showOptions = function (event) {
    var tBody = document.getElementById("tableBodyOptions");
    tBody.innerHTML = "";
    var input = function (key, value) {
        var x = document.createElement("input");
        x.setAttribute("type", "text");
        x.setAttribute("id", key);
        x.setAttribute("value", value);
        return x;
    };

    tBody.appendChild(
            createRow(document.createTextNode("key1"),
                    input("k1p", Values.control.k1.p),
                    input("k1s", Values.control.k1.s)));
    tBody.appendChild(
            createRow(document.createTextNode("key2"),
                    input("k2p", Values.control.k2.p),
                    input("k2s", Values.control.k2.s)));
    tBody.appendChild(
            createRow(document.createTextNode("key3"),
                    input("k3p", Values.control.k3.p),
                    input("k3s", Values.control.k3.s)));
    tBody.appendChild(
            createRow(document.createTextNode("Pause"),
                    input("pausep", Values.control.pause.p),
                    input("pauses", Values.control.pause.s)));
    tBody.appendChild(
            createRow(document.createTextNode("Fullscreen"),
                    input("fullscreenp", Values.control.fullscreen.p),
                    input("fullscreens", Values.control.fullscreen.s)));

    hideMenues();
    showMenu(true, GameCanvas.menuOptions);
};

/**
 * Creates the background.
 * @returns {Shape} - Background Shape
 */
createBackground = function () {
    var background = new createjs.Shape();
    return background;
};

/**
 * Creates the fps counter.
 * @returns {Text} - Fps counter element.
 */
createFps = function () {
    var f = new createjs.Text("FPS: ", "1em Arial", "#FFF");
    f.x = 30;
    f.on('tick', function (event) {
        f.text = "FPS: " + Number.parseInt(createjs.Ticker.getMeasuredFPS());
    });
    return f;
};

/**
 * Creates the highway container.
 * @returns {Container} - Highway Container
 */
createHighway = function () {
    var h = new createjs.Container();
    var bg = new createjs.Shape();
    h.name = "highway";
    bg.name = "highwayBg";
    h.addChild(bg);
    return h;
};

/**
 * Creates the counter for points.
 * @returns {Text} - Timer element.
 */
createPoints = function () {
    var p = new createjs.Text("Points: 0", "1.5em Arial", "#FFF");
    p.x = 5;
    p.y = 6;
    p.on('tick', function (event) {
        p.text = "Points: " + game.points;

    });
    return p;
};

/**
 * Creates the timer.
 * @returns {Text} - Timer element.
 */
createTimer = function () {
    var t = new createjs.Text("00:00:000", "1.5em Arial", "#FFF");
    t.y = 6;
    t.on('tick', function (event) {
        if (!game.gameTime())
            t.text = "00:00:000";
        else
            t.text = getTimeString(game.gameTime());
    });
    return t;
};

/**
 * Creates buttons for the highway.
 * @returns {createjs.Container} - Container with buttons
 */
createTouchButtons = function () {
    var btns = new createjs.Container();
    btns.name = "buttons";

    for (var i = 0; i < Values.MAXBUTTONS; i++) {
        var btn = new createjs.Shape();
        btns.addChild(btn);
    }
    return btns;
};

/**
 * Creates a symbol shape and adds it to the highway container
 * @param {type} event
 */
createSymbol = function(event) {
    var s = event.symbol;

    var symbol = s.shape;
    var r = 40;
    var i = s.i;

    var color = Values.COLORS[i];

    symbol.graphics
            .rf(['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0)'], [0, 1], 0, 0, r - 10, 0, 0, r + 10)
            .drawCircle(0, 0, r + 10)
            .lf([color.c1, color.c2], [0, 1], r, 0, r, r)
            .drawCircle(0, 0, r)
            .lf([color.c2, color.c1], [0, 1], r, 0, r, r - 5)
            .drawCircle(0, 0, r - 5);
    symbol.alpha = 0.2;

    tweenSymbol(s);

    highway.addChild(symbol);
};

/**
 * Creates an animation for a symbol.
 * @param {Object} symbol
 */
tweenSymbol = function(symbol) {
    var timeToDestroy = Values.DELAY * 6 / 5;   //Symbol should be destroyed 1/5 after target time

    var shape = symbol.shape;
    var i = symbol.i;
    var time = symbol.time;
    var timeActive = game.gameTime() - time; // gameTime-time = time the symbol is already active

    var endY2 = canvas.height * 0.6;
    var endY1 = endY2 / 5;
    var endY3 = endY2 + endY1;

    var t1 = timeToDestroy * 1 / 6 - timeActive;
    var t2 = timeToDestroy * 4 / 6;
    var t3 = timeToDestroy * 1 / 6;

    var x = highwayWidth / Values.MAXBUTTONS;
    var scale = Math.min(highwayWidth / Values.HIGHWAYMAXWIDTH,
            canvas.height / (2 * highwayWidth));

    shape.scaleX = scale;
    shape.scaleY = scale;
    shape.x = i * x + x / 2;
    /*
     * canvas.height * 0.6 = finish line
     * finish line * 6/5 = destroy line
     * destroyline / timeToDestryo = pixel per millisecond (symbol)
     * * timeActive = currentpos = shape.y;
     */
    shape.y = ((canvas.height * 0.6 * (6 / 5)) / timeToDestroy) * timeActive;

    var tween = createjs.Tween.get(shape, {override: true});
    if (t1 > 0) {
        tween = tween.to({x: shape.x, y: endY1, alpha: 1}, t1);
    } else {
        t2 += t1;
    }
    if (t2 > 0) {
        tween = tween.to({x: shape.x, y: endY2}, t2);
    } else {
        t3 += t2;
    }
    tween = tween.to({x: shape.x, y: endY3, alpha: 0}, t3).call(function (symbol) {
        game.removeSymbol(symbol);
    }, [symbol]);

};

/**
 * Removes a symbol from the display
 * @param {type} event
 */
removeSymbol = function(event) {
    var symbol = event.symbol;
    createjs.Tween.removeTweens(symbol.shape);
    highway.removeChild(symbol.shape);
};

tick = function(event) {
    stage.update(event); // redraw  
};

/**
 * Current game time as formated String XX:XX:XXX (Minutes:Seconds:Milliseconds)
 * 
 * @param {Number} t - Time in ms
 * @return {string} - Time as String
 */
getTimeString = function(t) {
    var time = new Date(t);
    var milli = time.getMilliseconds();
    var second = time.getSeconds();
    var minute = time.getMinutes();

    var tarray = [[minute, 2], [second, 2], [milli, 3]];

    var timeString = "";
    tarray.map(function (element, index) {  // add leading zeros
        var num = element[0];
        var width = element[1];
        width -= num.toString().length;
        var fill = num + "";
        if (width > 0)
        {
            var fill = new Array(width + (/\./.test(num) ? 2 : 1)).join('0') + num;
        }
        fill += (index < 2) ? ":" : "";
        timeString += fill;
    });
    return timeString;
};
