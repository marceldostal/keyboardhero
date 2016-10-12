/* global createjs */
var Game = require('./model/Game');
var GameCanvas = require('./view/GameCanvas');
var Controller = require('./control/Controller');

window.onload = function () {
    var model = new Game(),
            view = new GameCanvas(model),
            controller = new Controller(model, view);

};
