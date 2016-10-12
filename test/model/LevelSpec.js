/* global expect, jasmine */
'use strict';

var Level = require('../../src/js/model/Level');

describe('Level Model', function () {
    var l;
    var testJSON = '/base/test/model/test.json';

    beforeEach(function (done) {
        l = new Level();        
        l.loadAsset(testJSON);

        setTimeout(function () {
            done();
        }, 500);
    });


    it('The Level Object is created', function () {
        expect(l).toBeDefined();
    });


    it('The level loaded', function () {

        var levelData = [
            {"i": 0, "time": 0},
            {"i": 0, "time": 1000},
            {"i": 1, "time": 2000}
        ];
        var musicUrl = "base/test/model/test.mp3";
        
        expect(l.data).toEqual(jasmine.arrayContaining(levelData));
        expect(l.musicUrl).toBe(musicUrl);
        expect(l.musicUrl).not.toBe("");

    });

});