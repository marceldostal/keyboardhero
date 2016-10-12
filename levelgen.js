/* global Infinity */

var fs = require('fs');
var path = require('path');
var id3 = require('id3js');
var Chrome = require('chrome-remote-interface');
var ChildProc = require('child_process');

var override = false;
var paths = [];

function walkDir(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkDir(filePath, callback);
        }
    });
}

function save(level) {
    var filePath = level.musicURL;
    var json = filePath.replace(".mp3", ".json");
    fs.writeFile(json, JSON.stringify(level), function (err, data) {
        if (err) {
            return console.log(err);
        }
    });
}

function createLevel(chrome) {
    with (chrome) {
        if (!paths || paths.length === 0) {
            close();
            return;
        }
        var filePath = paths[0];

        console.log("load: " + filePath);
        Page.frameNavigated(function (frame) {
            evaluate(filePath, chrome);
        });
        Page.navigate({'url': 'http://localhost:9080/levelgen.html?path=' + filePath});
    }
}

function evaluate(path, chrome) {
    with (chrome) {
        Runtime.evaluate({expression: 'JSON.stringify(level)', returnByValue: true}).then(function (ret) {
            if (ret.result.type !== 'undefined') {
                var level = JSON.parse(ret.result.value);
                var filePath = level.musicURL;

                if (path === filePath) {
                    paths.shift();
                    save(level);
                    createLevel(chrome);
                    return;
                }
            }
            setTimeout(function () {
                evaluate(path, chrome);
            }, 1000);
        });
    }
}

//Check if Chrome is opened, start if not
Chrome(function (chrome) {
    with (chrome) {
        close();
    }
}).on('error', function (err) {
    ChildProc.exec('start chrome --remote-debugging-port=9222', function (err) {
        if (err) { //process error
        } else {
            console.log("success open");
        }
    });
});

setTimeout(function () {
    var all = [];
    var levels = [];

    walkDir('level/', function (filePath, stat) {
        if (filePath.endsWith(".mp3")) {
            if (filePath.endsWith("test.mp3"))
                return;

            all.push(filePath);
            var json = filePath.replace(".mp3", ".json");

            id3({file: filePath, type: id3.OPEN_LOCAL}, function (err, tags) {
                var artist= tags.artist.replace(/\u0000/g, "");
                var title= tags.title.replace(/\u0000/g, "");               
                
                levels.push({json: json, artist: artist, title: title});
                
                if (all.length === levels.length) {
                    fs.writeFile("level/list.json", JSON.stringify({levels: levels}), function (err, data) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                }
            });

            if (!fs.existsSync(json) || override) {
                paths.push(filePath);
            }
        }
    });




    Chrome(function (chrome) {
        with (chrome) {
            Runtime.enable();
            Page.enable();
            once('ready', function () {
                createLevel(chrome);
            });
        }
    }).on('error', function (err) {
        console.error('Cannot connect to Chrome:', err);
    });

}, 2000);








