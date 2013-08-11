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

var handlers = [];

exports.redirect = function (res, path) {
  res.writeHead(302, {'Location': path});
  res.end();
};

exports.showText = function (res, text) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(text + '\n\n');
};

exports.show404 = function (res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('404, page not found\n\n');
};

exports.sendJSON = function (res, obj) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(obj));
};

exports.jsonError = function (res, err) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({error: true, message: err}));
};

exports.startCleanupHandlers = function () {
  function cleanup() {
    var i, max;

    max = handlers.length;
    for (i = 0; i < max; i += 1) {
      handlers[i]();
    }
    setTimeout(cleanup, 30000);
  }
  cleanup();
};

exports.addCleanupHandler = function (handler) {
  handlers.push(handler);
};
