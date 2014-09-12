'use strict';

var asparagus = require('../'),
    Compiler = require('../lib/compiler');

describe('asparagus', sandbox(function () {

    var compiler;

    beforeEach(function () {
        sandbox.stub(Compiler, 'create', function () {
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

                Compiler.create.getCall(0).should.have.been.calledWith({
                    jsPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/t1.js',
                    tmplPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/t1.jade'
                }, {});

                compiler.compile.should.have.been.called;

                done();
            });

    });

    it('compiles a file 3 steps down', function (done) {

        return asparagus(__dirname + '/dummySource/d2/sub/subtfile2.jade')
            .then(function () {

                Compiler.create.getCall(0).should.have.been.calledWith({
                    jsPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d2/sub/subtfile2.js',
                    tmplPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d2/sub/subtfile2.jade'
                }, {});

                compiler.compile.should.have.been.called;

                done();
            });

    });

    it('compiles files and files within parallel folders', function (done) {

        return asparagus(__dirname + '/dummySource/')
            .then(function () {

                Compiler.create.getCall(0).should.have.been.calledWith({
                    jsPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/t1.js',
                    tmplPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/t1.jade'
                }, {});

                Compiler.create.getCall(1).should.have.been.calledWith({
                    jsPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/t2.js',
                    tmplPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/t2.jade'
                }, {});

                Compiler.create.getCall(2).should.have.been.calledWith({
                    jsPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d1/d1.js',
                    tmplPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d1/d1.jade',
                }, {});

                Compiler.create.getCall(3).should.have.been.calledWith({
                    jsPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d2/d2.js',
                    tmplPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d2/d2.jade'
                }, {});

                Compiler.create.getCall(4).should.have.been.calledWith({
                    jsPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d1/sub/subtfile1.js',
                    tmplPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d1/sub/subtfile1.jade',
                }, {});

                Compiler.create.getCall(5).should.have.been.calledWith({
                    jsPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d2/sub/subtfile2.js',
                    tmplPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d2/sub/subtfile2.jade'
                }, {});

                compiler.compile.should.have.been.called;

                done();

            });

    });

    it('only compiles files within folders matching "exclusive" prop if provided', function (done) {

        return asparagus(__dirname + '/dummySource/', { exclusive: 'sub' })
            .then(function () {

                Compiler.create.getCall(0).should.have.been.calledWith({
                    jsPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d1/sub/subtfile1.js',
                    tmplPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d1/sub/subtfile1.jade',
                }, { exclusive: 'sub' });

                Compiler.create.getCall(1).should.have.been.calledWith({
                    jsPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d2/sub/subtfile2.js',
                    tmplPath: '/Users/josephchapman/Projects/asparagus/test/dummySource/d2/sub/subtfile2.jade'
                }, { exclusive: 'sub' });

                compiler.compile.should.have.been.called;

                done();

            });

    });

}));
