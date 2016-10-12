/* global createjs */
module.exports = Level;

var Highscore = require('./Highscore');
var Values = require('./../Values');

function Level() {
    this.musicUrl="";
    this.data=[];
    this.levels=[];
    this.music;
    this.highscore;
  
    this.queue = new createjs.LoadQueue(true);
    this.queue.installPlugin(createjs.Sound);

    this.queue.on("fileload", handleFileLoaded, this);
    this.queue.on("error", handleError, this);
    
    createjs.EventDispatcher.initialize(Level.prototype);
}

// Load a single asset.
Level.prototype.loadAsset = function (url) {
// TODO: check if already loaded (save bandwidth)

    var item = {
        src: url,
        id: url,
        callback: "maps"
    };
    this.queue.loadFile(item, true);

};

function handleFileLoaded(event) {
    var result = event.result;
    console.log("Loaded: "+event.item.src);
    
    switch (event.item.type) {
        case createjs.AbstractLoader.JSON:
            if(result.levels){
                this.levels=result.levels;
                this.dispatchEvent("list");
                break;
            }
            this.musicUrl = result.musicURL;
            this.data = result.levelData;
            this.highscore = new Highscore(event.item.src, Values.HIGHSCORESIZE);
            this.loadAsset(this.musicUrl, this.musicUrl);
            break;
        case createjs.AbstractLoader.SOUND:
            this.music=createjs.Sound.createInstance(event.item.id);
            this.dispatchEvent("loaded");
            break;
    }

}

// A file failed to load.
function handleError(event) {
    console.log(event.title);
}


