/* global expect, jasmine */
'use strict';

var Lockr = require('lockr');
var Highscore = require('../../src/js/model/Highscore');

describe('Highscore Model', function () {

    var max = 10;
    var level = 'test';
    var highscore;
    var hdata;

    beforeEach(function () {
        Lockr.rm(level);
        highscore = new Highscore(level, max);
        hdata = highscore.data;
    });
    it('The Highscore Object is created, no leveldata in storage', function () {

        expect(highscore.level).toEqual(level);
        expect(hdata).toBeDefined();
        expect(hdata.length).toBe(0);
        expect(Lockr.get(level)).not.toBeDefined();

    });
    it('should add object to highscore', function () {

        var test = {name: 'TEST', score: 10};
        highscore.newScore(test.name, test.score);

        expect(hdata).toContain(test);
        expect(hdata.length).toBe(1);

    });
    it('should add 3 objects to highscore ordered', function () {

        var test = {name: 'TEST', score: 10};
        var test2 = {name: 'TEST2', score: 20};
        var test3 = {name: 'TEST3', score: 30};

        var data = [test3, test2, test];

        highscore.newScore(test3.name, test3.score);
        highscore.newScore(test.name, test.score);
        highscore.newScore(test2.name, test2.score);

        expect(hdata).toEqual(jasmine.arrayContaining(data));
        expect(hdata.length).toBe(3);
        expect(hdata[0]).toEqual(jasmine.objectContaining(test3));
        expect(hdata[2]).toEqual(jasmine.objectContaining(test));

    });

    it('should save highscore in localstore', function () {

        var test = {name: 'TEST', score: 10};
        var test2 = {name: 'TEST2', score: 20};
        var test3 = {name: 'TEST3', score: 30};

        var data = [test3, test2, test];
        highscore.newScore(test3.name, test3.score);
        highscore.newScore(test.name, test.score);
        highscore.newScore(test2.name, test2.score);

        var storage = Lockr.get(level);

        expect(storage).toEqual(jasmine.arrayContaining(data));
        expect(storage.length).toBe(3);

    });

    describe('Highscore with 10 entries', function () {
        beforeEach(function () {
            this.ldata = [
                {name: 'Name', score: 10234},
                {name: 'Name', score: 9234},
                {name: 'Name', score: 8234},
                {name: 'Name', score: 7234},
                {name: 'Name', score: 6234},
                {name: 'Name', score: 5234},
                {name: 'Name', score: 4234},
                {name: 'Name', score: 3234},
                {name: 'Name', score: 2234},
                {name: 'Name', score: 1234}
            ];
            Lockr.set(level, this.ldata);
            highscore = new Highscore(level, max);
            hdata = highscore.data;
        });
        it('Loaded data should equal ldata', function () {
            expect(hdata).toEqual(jasmine.arrayContaining(this.ldata));
            expect(hdata.length).toBe(10);
        });
        it('to be same', function () {
            var test = {name: 'TEST', score: 10};
            highscore.newScore(test.name, test.score);

            expect(hdata).not.toContain(test);
            expect(hdata).toEqual(jasmine.arrayContaining(this.ldata));
            expect(hdata.length).toBe(10);
        });
        it('to enter new top score, delete last', function () {
            var test = {name: 'TEST', score: this.ldata[0].score + 1};
            highscore.newScore(test.name, test.score);

            expect(hdata).toContain(test);
            expect(hdata[0]).toEqual(jasmine.objectContaining(test));
            expect(hdata[9]).toEqual(jasmine.objectContaining(this.ldata[8]));
            expect(hdata).not.toContain(this.ldata[9]);
            expect(hdata.length).toBe(10);
        });
        it('to enter new score postion 3, delete last', function () {
            var test = {name: 'TEST', score: this.ldata[2].score + 1};
            highscore.newScore(test.name, test.score);

            expect(hdata).toContain(test);
            expect(hdata[2]).toEqual(jasmine.objectContaining(test));
            expect(hdata[3]).toEqual(jasmine.objectContaining(this.ldata[2]));
            expect(hdata).not.toContain(this.ldata[9]);
            expect(hdata.length).toBe(10);
        });
    });

});