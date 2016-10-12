/* global createjs */
module.exports = Controller;

var Game = require('./../model/Game');
var Values = require('./../Values');

var game, gcanvas;

/**
 * The Controller. Controller responds to user actions and
 * invokes changes on the model.
 * 
 * @param {Game} model - Game Model
 * @param {GameCanvas} view - GameCanvas for drawing
 * @returns {Controller}
 */
function Controller(model, view) {
    game = model;
    gcanvas = view;

    // window resized
    window.onresize = gcanvas.resize;

    // Touch/Mouse
    gcanvas.getStage().getChildByName("highway").on('mousedown', handleTouch, null, false, -1);
    var buttons = gcanvas.getStage().getChildByName("highway").getChildByName("buttons");
    for (var i = 0; i < buttons.numChildren; i++) {

        var btn = buttons.getChildAt(i);
        btn.on('mousedown', handleTouch, null, false, i);
    }

    if (createjs.Touch.isSupported()) {
        createjs.Touch.enable(gcanvas.getStage());
    }

    // Keyboard
    window.addEventListener("keydown", keyPressed, true);


    // Focus gained/lost events
    window.addEventListener("visibilitychange", function (event) {
        if (document.hidden)
            game.pause(true);
    });

    window.addEventListener("blur", pause);

    // Buttons
    addListener("btnStart", start);
    addListener("btnSelect", select);
    addListener("btnRestart", restart);
    addListener("btnBack", back);
    addListener("btnFullscreen", fullscreen);
    addListener("btnResume", resume);
    addListener("btnHighscore", highscore);
    addListener("btnOptions", options);
    addListener("btnSave", save);
    addListener("btnHelp", help);
    addListener("btnExit", exit);

    // Settings
    Values.loadOptions();
    
}

function addListener(name, fkt) {
    var node = document.getElementsByName(name);
    for (i = 0; i < node.length; i++) {
        node[i].addEventListener("click", fkt);
    }
}

function back(event) {
    if (game.status === Game.END) {
        exit(event);
    } else if (game.status === Game.PAUSED) {
        game.pause(true);
    } else if (game.status === Game.MAINMENU) {
        game.exit();
    }
}

function exit(event) {
    game.exit();
}

function fullscreen(event) {
    gcanvas.toggleFullScreen();
}

function handleTouch(event, i) {

    if (i === -1 && event.target.name === "highwayBg") {
        game.pause(true, true);
        return;
    }
    game.updatePoints(i);
}

function help(event) {
    game.showHelp();
}

function highscore(event) {
    game.showHighscore();
}

function keyPressed(event) {
    if (event.defaultPrevented || game.status === Game.MAINMENU) {
        return; // Should do nothing if the key event was already consumed.
    }

    var i = -1;
    switch (event.key) {
        case Values.control.k1.p:
        case Values.control.k1.s:
            console.log("left");
            i = 0;
            break;
        case Values.control.k2.p:
        case Values.control.k2.s:
            console.log("down");
            i = 1;
            break;
        case Values.control.k3.p:
        case Values.control.k3.s:
            console.log("right");
            i = 2;
            break;
        case Values.control.pause.p:
        case Values.control.pause.s:
            game.pause(true, true);
            break;
        case Values.control.fullscreen.p:
        case Values.control.fullscreen.s:
            gcanvas.toggleFullScreen();
            break;
        default:
            return;
    }

    if (i !== -1)
        game.updatePoints(i);

    event.preventDefault();
}

function options(event) {
    game.showOptions();
}

function pause(event) {
    game.pause(true);
}

function restart(event) {
    game.start();
}

function resume(event) {
    game.pause(false);
}

function save(event) {
    var control = {
        k1: {p: document.getElementById("k1p").value,
            s: document.getElementById("k1s").value},
        k2: {p: document.getElementById("k2p").value,
            s: document.getElementById("k2s").value},
        k3: {p: document.getElementById("k3p").value,
            s: document.getElementById("k3s").value},
        pause: {p: document.getElementById("pausep").value,
            s: document.getElementById("pauses").value},
        fullscreen: {p: document.getElementById("fullscreenp").value,
            s: document.getElementById("fullscreens").value}
    };
    Values.saveOptions(control);
}

function select(event) {
    var radio = document.getElementsByName("radioLevel");
    for (i = 0; i < radio.length; i++) {
        if (radio[i].checked) {
            var level = radio[i].value;
            game.loadLevel(level);
            break;
        }
    }
}

function start(event) {
    game.selectLevel();
}


