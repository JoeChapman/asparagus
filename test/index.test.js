'use strict';

var asparagus = require('../'),
    Pecan = require('pecan'),
    EventEmitter = require('events').EventEmitter;

describe('asparagus', sandbox(function () {

    var compiler;

    beforeEach(function () {
        sandbox.stub(Pecan, 'create', function () {
            compiler = { compile: sandbox.stub() };
            return compiler;
        });
    });

    it('throws "First argument must be the source path" if no src provided', function () {
        (function () {
            asparagus();
            compiler.compile.should.not.have.been.called;
        }).should.throw('First argument must be the source path');
    });

    it('compiles a top-level file', function (done) {

        Pecan.queue[__dirname + '/dummy-source/t1.jade'] = {
            on: sandbox.stub()
        };

        return asparagus(__dirname + '/dummy-source/t1.jade')
            .then(function () {

                Pecan.create
                    .should.have.been.calledWith({
                        jsPath: __dirname + '/dummy-source/t1.js',
                        tmplPath: __dirname + '/dummy-source/t1.jade'
                    }, {});

                Pecan.create.callCount
                    .should.equal(1);

                compiler.compile
                    .should.have.been.called;

                done();
            });

    });

    it('calls options.onEnd when finished compiling all files', function (done) {

        var onEndSpy = sandbox.spy();
        Pecan.queue[__dirname + '/dummy-source/t1.jade'] = new EventEmitter();

        return asparagus(__dirname + '/dummy-source/t1.jade', { onEnd: onEndSpy })
            .then(function () {

                Pecan.create
                    .should.have.been.calledWith({
                        jsPath: __dirname + '/dummy-source/t1.js',
                        tmplPath: __dirname + '/dummy-source/t1.jade'
                    }, { onEnd: onEndSpy });

                var queueItem = Pecan.queue[__dirname + '/dummy-source/t1.jade'];
                delete Pecan.queue[__dirname + '/dummy-source/t1.jade'];
                queueItem.emit('end');

                onEndSpy
                    .should.have.been.called;

                done();
            });

    });

    it('compiles a file 3 steps down', function (done) {

        Pecan.queue[__dirname + '/dummy-source/d2/sub/sub-file-2.jade'] = {
            on: sandbox.stub()
        };

        return asparagus(__dirname + '/dummy-source/d2/sub/sub-file-2.jade')
            .then(function () {

                Pecan.create.should.have.been.calledWith({
                    jsPath: __dirname + '/dummy-source/d2/sub/sub-file-2.js',
                    tmplPath: __dirname + '/dummy-source/d2/sub/sub-file-2.jade'
                }, {});

                Pecan.create.callCount.should.equal(1);
                compiler.compile.should.have.been.called;

                done();
            });

    });

    it('compiles files and files within parallel folders', function (done) {

        Pecan.queue[__dirname + '/dummy-source/t1.jade'] = {
            on: sandbox.stub()
        };
        Pecan.queue[__dirname + '/dummy-source/t2.jade'] = {
            on: sandbox.stub()
        };
        Pecan.queue[__dirname + '/dummy-source/d1/d1.jade'] = {
            on: sandbox.stub()
        };
        Pecan.queue[__dirname + '/dummy-source/d2/d2.jade'] = {
            on: sandbox.stub()
        };
        Pecan.queue[__dirname + '/dummy-source/exp/exp-sub.jade'] = {
            on: sandbox.stub()
        };
        Pecan.queue[__dirname + '/dummy-source/d1/d1-sub/d1-sub-file.jade'] = {
            on: sandbox.stub()
        };
        Pecan.queue[__dirname + '/dummy-source/d1/sub/sub-file-1.jade'] = {
            on: sandbox.stub()
        };
        Pecan.queue[__dirname + '/dummy-source/d1/d1-sub/d1-sub-file.jade'] = {
            on: sandbox.stub()
        };
        Pecan.queue[__dirname + '/dummy-source/d1/sub/sub-file-1.jade'] = {
            on: sandbox.stub()
        };
        Pecan.queue[__dirname + '/dummy-source/d2/sub/sub-file-2.jade'] = {
            on: sandbox.stub()
        };

        return asparagus(__dirname + '/dummy-source/')
            .then(function () {

                Pecan.create.should.have.been.calledWith({
                    jsPath: __dirname + '/dummy-source/t1.js',
                    tmplPath: __dirname + '/dummy-source/t1.jade'
                }, {});

                Pecan.create.should.have.been.calledWith({
                    jsPath: __dirname + '/dummy-source/t2.js',
                    tmplPath: __dirname + '/dummy-source/t2.jade'
                }, {});

                Pecan.create.should.have.been.calledWith({
                    jsPath: __dirname + '/dummy-source/d1/d1.js',
                    tmplPath: __dirname + '/dummy-source/d1/d1.jade',
                }, {});

                Pecan.create.should.have.been.calledWith({
                    jsPath: __dirname + '/dummy-source/d2/d2.js',
                    tmplPath: __dirname + '/dummy-source/d2/d2.jade'
                }, {});

                Pecan.create.should.have.been.calledWith({
                    jsPath: __dirname + '/dummy-source/exp/exp-sub.js',
                    tmplPath: __dirname + '/dummy-source/exp/exp-sub.jade',
                }, {});

                Pecan.create.should.have.been.calledWith({
                    jsPath: __dirname + '/dummy-source/d1/d1-sub/d1-sub-file.js',
                    tmplPath: __dirname + '/dummy-source/d1/d1-sub/d1-sub-file.jade'
                }, {});

                Pecan.create.should.have.been.calledWith({
                    jsPath: __dirname + '/dummy-source/d1/sub/sub-file-1.js',
                    tmplPath: __dirname + '/dummy-source/d1/sub/sub-file-1.jade',
                }, {});

                Pecan.create.should.have.been.calledWith({
                    jsPath: __dirname + '/dummy-source/d2/sub/sub-file-2.js',
                    tmplPath: __dirname + '/dummy-source/d2/sub/sub-file-2.jade'
                }, {});

                Pecan.create.callCount.should.equal(8);
                compiler.compile.should.have.been.called;

                done();

            });

    });

    it('only compiles files within folders matching "exclusive" prop if provided', function (done) {

        return asparagus(__dirname + '/dummy-source/', { exclusive: 'sub' })
            .then(function () {

                Pecan.create.should.have.been.calledWith({
                    jsPath: __dirname + '/dummy-source/d1/sub/sub-file-1.js',
                    tmplPath: __dirname + '/dummy-source/d1/sub/sub-file-1.jade',
                }, { exclusive: 'sub' });

                Pecan.create.should.have.been.calledWith({
                    jsPath: __dirname + '/dummy-source/d2/sub/sub-file-2.js',
                    tmplPath: __dirname + '/dummy-source/d2/sub/sub-file-2.jade'
                }, { exclusive: 'sub' });

                Pecan.create.callCount.should.equal(2);
                compiler.compile.should.have.been.called;

                done();

            });

    });

}));
