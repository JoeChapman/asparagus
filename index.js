'use strict';

var Bluebird = require('bluebird'),
    fs = Bluebird.promisifyAll(require('fs')),
    pathUtil = require('path'),
    join = pathUtil.join,
    Pecan = require('pecan');

module.exports = function asparagus(src, options) {
    // default options
    options = options || {};
    src = src || options.src;

    // throw if src is not defined
    if (!src) {
        throw new Error('First argument must be the source path');
    }

    var dest = options.dest || src;

    function getFiles(src, dest) {
        return findFiles(src)
            .map(function (filename) {
                if (isDirname(filename)) {
                    return resolveWith(filename, src, dest);
                } else {
                    // if a file, compile it and return the compiler
                    return compileFile(null, {
                        src: src,
                        dest: dest,
                        filename: filename
                    }, options);
                }
            })
            .catch(function (err) {
                return compileFile(err, {
                    src: src,
                    dest: dest,
                    filename: pathUtil.basename(src)
                }, options);
            });
    }

    function resolveWith(dirname, src, dest) {
        return new Bluebird(function (resolve) {
            return resolve(getFiles(pathUtil.join(src, dirname), pathUtil.join(dest, dirname)));
        });
    }

    return getFiles(src, dest);

};

function compileFile(err, attrs, options) {
    // If there is no error or the error was 'Not a directory'
    if (!err || (err && err.cause && err.cause.code === 'ENOTDIR')) {
        // If there is no exclusive option or this path is not excluded
        if (!options.exclusive || (options.exclusive && attrs.src.split('/').indexOf(options.exclusive) !== -1)) {
            Pecan.create(getPaths(attrs.src, attrs.dest, attrs.filename), options).compile();
        }
    } else if (err && err.cause && err.cause.code !== 'ENOENT' && !isDirname(attrs.filename)) {
        throw new Error(err);
    }
}

function getPaths(src, dest, filename) {
    // if the src/dest paths include the filenames (ext)
    src = isDirname(src) ? src : pathUtil.dirname(src);
    dest = isDirname(dest) ? dest : pathUtil.dirname(dest);
    return {
        jsPath: join(dest, filename.replace(pathUtil.extname(filename), '.js')),
        tmplPath: join(src, filename)
    };
}

function isDirname(node) {
    return Boolean(pathUtil.extname(node)) === false;
}

function findFiles(source) {
    return fs.readdirAsync(source);
}
