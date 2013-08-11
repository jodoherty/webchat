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

var http = require('http');
var url = require('url');
var file = require('../models/file');
var users = require('../models/users');
var misc = require('../misc');
var settings = require('../config/settings');

exports.index = function (req, res) {
  if (users.validateSession(req.session)) {
    misc.redirect(res, '/chat');
  } else {
    file.show(res, 'loginform.html');
  }
};

exports.doLogin = function (req, res) {
  var parts = url.parse(settings.options.auth_url);
  var options = {
    host: parts.host,
    path: parts.path,
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  };

  function done(isValid) {
    var username = req.body.username;
    if (isValid === true) {
      req.session.username = username;
      users.add(username, req.session.session_id);
      misc.redirect(res, '/chat');
    } else {
      file.show(res, 'loginform_failed.html');
    }
  }

  if (req.method === 'POST' && req.body && req.body.username) {
    var request = http.request(options, function (response) {
      var username = req.body.username;
      var data = '';
      var json;

      response.on('data', function (chunk) {
        data += chunk.toString();
      });
      response.on('end', function () {
        console.log(data);
        try {
          json = JSON.parse(data);
        } catch(err) {
          return misc.redirect(res, '/');
        }
        console.log(json);
        done(json);
      });
    });
    request.write('user=' + req.body.username + '&passwrd=' + req.body.password);
    request.end();
  } else {
    misc.showText(res, 'Invalid submission method. Please use login form.');
  }
};

