'use strict';

var asparagus = require('../'),
    Pecan = require('pecan');

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

        return asparagus(__dirname + '/dummySource/t1.jade')
            .then(function () {

                Pecan.create.getCall(0).should.have.been.calledWith({
                    jsPath: __dirname + '/dummySource/t1.js',
                    tmplPath: __dirname + '/dummySource/t1.jade'
                }, {});

                compiler.compile.should.have.been.called;

                done();
            });

    });

    it('compiles a file 3 steps down', function (done) {

        return asparagus(__dirname + '/dummySource/d2/sub/subtfile2.jade')
            .then(function () {

                Pecan.create.getCall(0).should.have.been.calledWith({
                    jsPath: __dirname + '/dummySource/d2/sub/subtfile2.js',
                    tmplPath: __dirname + '/dummySource/d2/sub/subtfile2.jade'
                }, {});

                compiler.compile.should.have.been.called;

                done();
            });

    });

    it('compiles files and files within parallel folders', function (done) {

        return asparagus(__dirname + '/dummySource/')
            .then(function () {

                Pecan.create.getCall(0).should.have.been.calledWith({
                    jsPath: __dirname + '/dummySource/t1.js',
                    tmplPath: __dirname + '/dummySource/t1.jade'
                }, {});

                Pecan.create.getCall(1).should.have.been.calledWith({
                    jsPath: __dirname + '/dummySource/t2.js',
                    tmplPath: __dirname + '/dummySource/t2.jade'
                }, {});

                Pecan.create.getCall(2).should.have.been.calledWith({
                    jsPath: __dirname + '/dummySource/d1/d1.js',
                    tmplPath: __dirname + '/dummySource/d1/d1.jade',
                }, {});

                Pecan.create.getCall(3).should.have.been.calledWith({
                    jsPath: __dirname + '/dummySource/d2/d2.js',
                    tmplPath: __dirname + '/dummySource/d2/d2.jade'
                }, {});

                Pecan.create.getCall(4).should.have.been.calledWith({
                    jsPath: __dirname + '/dummySource/d1/sub/subtfile1.js',
                    tmplPath: __dirname + '/dummySource/d1/sub/subtfile1.jade',
                }, {});

                Pecan.create.getCall(5).should.have.been.calledWith({
                    jsPath: __dirname + '/dummySource/d2/sub/subtfile2.js',
                    tmplPath: __dirname + '/dummySource/d2/sub/subtfile2.jade'
                }, {});

                compiler.compile.should.have.been.called;

                done();

            });

    });

    it('only compiles files within folders matching "exclusive" prop if provided', function (done) {

        return asparagus(__dirname + '/dummySource/', { exclusive: 'sub' })
            .then(function () {

                Pecan.create.getCall(0).should.have.been.calledWith({
                    jsPath: __dirname + '/dummySource/d1/sub/subtfile1.js',
                    tmplPath: __dirname + '/dummySource/d1/sub/subtfile1.jade',
                }, { exclusive: 'sub' });

                Pecan.create.getCall(1).should.have.been.calledWith({
                    jsPath: __dirname + '/dummySource/d2/sub/subtfile2.js',
                    tmplPath: __dirname + '/dummySource/d2/sub/subtfile2.jade'
                }, { exclusive: 'sub' });

                compiler.compile.should.have.been.called;

                done();

            });

    });

}));
