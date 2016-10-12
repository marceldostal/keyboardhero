/* global expect, jasmine */
'use strict';

var Game = require('../../src/js/model/Game');
var Level = require('../../src/js/model/Level');

describe('Game Model', function () {
    var g;
    var testJSON = '/base/test/model/test.json';

    beforeEach(function () {
        g = new Game();
    });

    it('Game is singleton', function () {
        expect(g).toBeDefined();
        var g2 = new Game();
        expect(g).toBe(g2);
    });

    it('starts in Mainmenu', function () {
        expect(g.status).toBe(Game.MAINMENU);
    });

    describe('started', function () {

        beforeEach(function (done) {
            setTimeout(function () {
                var listener = g.on('start', function () {
                    console.log("bla");
                    g.off('start', listener);
                    done();
                });
                g.loadLevel(testJSON);
            }, 1000);
        });
        
        it('status=PLAYING', function (done) {
            expect(g.status).toBe(Game.PLAYING);
            done();
        });
    });
});