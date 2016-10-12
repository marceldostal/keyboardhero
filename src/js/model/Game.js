/* global createjs */
module.exports = Game;

var Level = require('./Level');
var Values = require('./../Values');

var music,
        currentLevel,
        startTime,
        levelData,
        symbols,
        listenerMusic,
        listenerTicker;

Game.MAINMENU = 0;
Game.PLAYING = 1;
Game.PAUSED = 2;
Game.END = 3;

/**
 * The Model. Model stores items and notifies
 * observers about changes.
 */
function Game() {
    if (Game.instance) {
        return Game.instance;
    }
    Game.instance = this;
    currentLevel = new Level();

    this.status = Game.MAINMENU;
    this.points = 0;

    createjs.EventDispatcher.initialize(Game.prototype);
    this.dispatchEvent("mainmenu");
}

Game.prototype.addSymbol = function (data) {
    var symbol = {i: data.i, time: data.time, shape: new createjs.Shape()};
    if (!symbols)
        symbols = [];
    if (!symbols[data.i])
        symbols[data.i] = {};

    symbols[data.i][data.time] = symbol;

    var event = new createjs.Event("symboladded");
    event.symbol = symbol;
    this.dispatchEvent(event);
};

Game.prototype.exit = function () {
    this.status = Game.MAINMENU;
    this.dispatchEvent("mainmenu");
};

Game.prototype.forEachSymbol = function (fkt) {
    if (!symbols)
        return;
    for (var i in symbols) {
        Object.keys(symbols[i]).forEach(function (element) {
            fkt(symbols[i][element]);
        });
    }
};

Game.prototype.gameTime = function () {
    return createjs.Ticker.getTime(true) - startTime;
};

Game.prototype.loadLevel = function (level) {
    var listen = currentLevel.on("loaded", function (event) {
        music = currentLevel.music;

        this.start();
        currentLevel.off("loaded", listen);
    }, this);
    currentLevel.loadAsset(level);

    this.dispatchEvent("loading");
};

Game.prototype.pause = function (setpause, toggle) {
    if (this.status !== Game.PAUSED && this.status !== Game.PLAYING)
        return;
    if (toggle) {
        setpause = (this.status === Game.PLAYING) ? true : false;
    }

    // if (setpause === (this.status === Game.PAUSED))
    //     return;

    this.status = setpause ? Game.PAUSED : Game.PLAYING;

    if (music)
        music.paused = setpause;

    console.log("tooglePause");
    this.dispatchEvent("togglePause");
};

Game.prototype.removeSymbol = function (symbol) {

    var i = symbol.i;
    var t = symbol.time;

    if (symbols[i] && symbols[i][t]) {
        delete(symbols[i][t]);

        var event = new createjs.Event("symbolremoved");
        event.symbol = symbol;
        this.dispatchEvent(event);
    }

};

Game.prototype.selectLevel = function () {
    var listen = currentLevel.on("list", function (event) {
        var evt = new createjs.Event("level");
        evt.data = currentLevel.levels;
        this.dispatchEvent(evt);

        currentLevel.off("list", listen);
    }, this);
    currentLevel.loadAsset('level/list.json');
};

Game.prototype.showHelp = function () {
    this.dispatchEvent("help");
};

Game.prototype.showHighscore = function () {
    var evt = new createjs.Event("highscore");
    evt.data = currentLevel.highscore.data;
    this.dispatchEvent(evt);
};

Game.prototype.showOptions = function () {
    this.dispatchEvent("options");
};

Game.prototype.start = function () {
    console.log("Game started");
    this.points = 0;

    for (var i in symbols) {
        Object.keys(symbols[i]).forEach(function (element) {
            this.removeSymbol(symbols[i][element]);
        }, this);
    }

    symbols = [];
    levelData = [];

    if (music) {
        music.stop();
    }
    // reset listener

    createjs.Ticker.off('tick', listenerMusic);
    createjs.Ticker.off('tick', listenerTicker);


    this.status = Game.PLAYING;


    // Clone Level Object (z.B.für Neustart)
    for (var i = 0; i < currentLevel.data.length; i++) {
        var d = currentLevel.data[i];
        levelData.push({i: d.i, time: d.time});
    }

    listenerTicker = createjs.Ticker.on('tick', function (event) {
        if (levelData.length === 0)
            return;
        var time = levelData[0].time;
        if (time <= this.gameTime()) {  // runtime>=delay     
            var symbol = levelData.shift();  // lade Symbol aus levelData       
            this.addSymbol(symbol);
        }
    }, this);

    startTime = createjs.Ticker.getTime(true);
    var delay = startTime + Values.DELAY;                 // set delay when music should start

    listenerMusic = createjs.Ticker.on('tick', function (event) {
        if (event.runTime >= delay) {  // runtime>=delay          
            music.play();                              // play music
            createjs.Ticker.off('tick', listenerMusic);  // detach listener
            listenerMusic = music.on('complete', function (event) {
                var highscore = currentLevel.highscore;
                this.status = Game.END;

                music.off('complete', listenerMusic);
                createjs.Ticker.off('tick', listenerTicker);

                var name = window.prompt("Game Over! Please enter a name.");
                name = name ? name : "Anon";
                highscore.newScore(name, this.points);
                var event = new createjs.Event("end");
                event.data = highscore.data;
                this.dispatchEvent(event);
            }, this);
        }
    }, this);

    this.dispatchEvent("start");
    this.pause(!document.hasFocus() || document.hidden);    // pause if game has no focus    
};

Game.prototype.updatePoints = function (i) {
    if (!symbols[i])
        symbols[i] = {};

    if (this.status === Game.PLAYING) {

        Object.keys(symbols[i]).some(function (element) {
            var target = symbols[i][element].time + Values.DELAY;
            if (target - 500 <= this.gameTime()) {
                this.points += calculatePoints(Math.abs(this.gameTime() - target));
                this.removeSymbol(symbols[i][element]);
                return true;
            }

            return false;
        }, this);

    }
};

function calculatePoints(dT) {
    var p = 0;

    if (dT < 10) {
        p = 200;
    } else if (dT < 20) {
        p = 150;
    } else if (dT < 40) {
        p = 100;
    } else if (dT < 60) {
        p = 80;
    } else if (dT < 80) {
        p = 70;
    } else if (dT < 100) {
        p = 60;
    } else if (dT < 200) {
        p = 30;
    } else if (dT < 300) {
        p = 20;
    } else if (dT < 400) {
        p = 10;
    }
    return p;
}
