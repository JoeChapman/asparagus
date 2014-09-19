'use strict';

var _Promise = require('bluebird'),
    fs = _Promise.promisifyAll(require('fs')),
    pathUtil = require('path'),
    join = pathUtil.join,
    Compiler = require('./lib/compiler');

module.exports = function asparagus(src, options) {

    // default options
    options = options || {};
    src = src || options.src;

    // throw if src is not defined
    if (!src) {
        throw new Error('First argument must be the source path');
    }

    var dest = options.dest || src,
        // strip filename from base directory path
        sources = {},
        destinations = {};

    function getFiles(src, dest) {
        return findFiles(src)
            .map(function (filename) {
                if (isDirectory(filename)) {
                    return promise(filename);
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

    function promise(filename) {
        return new _Promise(function (resolve) {
            if (Object.keys(sources).length >= 2) {
                return Object.keys(sources).map(function (id) {
                    if (sources[id].search(filename) === -1) {
                        destinations[id] = join(destinations[id], filename);
                        sources[id] = join(sources[id], filename);
                    }
                    return resolve(getFiles(sources[id], destinations[id]));
                });
            } else {
                if (!sources[filename]) {
                    destinations[filename] = join(dest, filename);
                    sources[filename] = join(src, filename);
                }
                return resolve(getFiles(sources[filename], destinations[filename]));
            }
        });
    }

    return getFiles(src, dest);

};

function compileFile(err, attrs, options) {
    if (!err || (err && err.cause && err.cause.code === 'ENOTDIR')) {
        if (!options.exclusive || (options.exclusive && attrs.src.indexOf(options.exclusive) !== -1)) {
            Compiler.create(getPaths(attrs.src, attrs.dest, attrs.filename), options).compile();
        }
    } else {
        throw new Error(err);
    }
}

function getPaths(src, dest, filename) {
    // if the src/dest paths include the filenames (ext)
    src = isDirectory(src) ? src : pathUtil.dirname(src);
    dest = isDirectory(dest) ? dest : pathUtil.dirname(dest);
    return {
        jsPath: join(dest, filename.replace(pathUtil.extname(filename), '.js')),
        tmplPath: join(src, filename)
    };
}

function isDirectory(node) {
    return Boolean(pathUtil.extname(node)) === false;
}

function findFiles(source) {
    return fs.readdirAsync(source);
}
