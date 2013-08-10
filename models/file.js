/*
 * Copyright (c) 2013 James O'Doherty <jodoherty@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var fs = require('fs');
var url = require('url');
var misc = require('../misc');

function sendFile(res, filename) {
    var type,
        extension = filename.slice(filename.lastIndexOf('.'));
    switch (extension) {
        case '.html':
            type = 'text/html';
            break;
        case '.htm':
            type = 'text/html';
            break;
        case '.js':
            type = 'text/javascript';
            break;
        case '.css':
            type = 'text/css';
            break;
        case '.txt':
            type = 'text/plain; charset=utf-8';
            break;
        case '.ico':
            type = 'image/ico';
            break;
        case '.jpg':
            type = 'image/jpeg';
            break;
        case '.png':
            type = 'image/png';
            break;
        case '.gif':
            type = 'image/gif';
            break;
        default:
            type = 'application/octet-stream';
    }
    fs.readFile(filename, function (err, data) {
        if (err) {
            return misc.show404(res);
        }
        res.writeHead(200, {'Content-Type': type});
        res.end(data);
    });
}

exports.show = function (res, path) {
    // Ensure that the given path is a file and is safely within our static directory
    var filename = url.resolve('static/', './' + path);
    if (filename.indexOf('static/') === 0) {
        fs.stat(filename, function (err, stats) {
            if (err || (stats && !stats.isFile())) {
                return misc.show404(res);
            } else {
                // File exists and is safe, go ahead and send it
                return sendFile(res, filename);
            }
        });
    } else {
        return misc.show404(res);
    }
}

