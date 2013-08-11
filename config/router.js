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


var url = require('url');
var querystring = require('querystring');
var middle = require('./middleware');
var misc = require('../misc');

var MAX_DATA = 50000;

var doRoute = function (handlers, req, res) {
  var path = url.parse(req.url).pathname;
  var writeHead = res.writeHead;
  var i; 
  var max; 
  var key;
  res.finalize = [];

  max = middle.middleware.length;
  for (i=0; i < max; i += 1) {
    middle.middleware[i](req, res);
  }

  res.writeHead = function (statusCode) {
    var i, max;

    max = res.finalize.length;
    for (i = 0; i < max; i += 1) {
      res.finalize[i]();
    }

    res.writeHead = writeHead;
    if (arguments.length === 1) {
      res.writeHead(statusCode);
    } else if (arguments.length === 2) {
      res.writeHead(statusCode, arguments[1]);
    } else if (arguments.length === 3) {
      res.writeHead(statusCode, arguments[1], arguments[2]);
    }
  };

  for (key in handlers) {
    if (handlers.hasOwnProperty(key) && path.search(key) !== -1) {
      return handlers[key](req, res);
    }
  }

  return misc.show404(res);
};

exports.route = function (handlers, req, res) {
  var data;
  req.body = {};

  if (req.method === 'POST') {
    data = '';
    req.on('data', function (chunk) {
      data += chunk.toString();
      if (data.length > MAX_DATA) {
        req.connection.destroy();
      }
    });
    req.on('end', function () {
      if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
        req.body = querystring.parse(data);
      } else {
        try {
          req.body = JSON.parse(data);
        } catch (err) {
          console.log(data);
          req.body = {};
        }
      }
      doRoute(handlers, req, res);
    });
  } else {
    doRoute(handlers, req, res);
  }
};
