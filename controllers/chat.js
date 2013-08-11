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

var file = require('../models/file');
var users = require('../models/users');
var messages = require('../models/messages');
var misc = require('../misc');
var settings = require('../config/settings');
var defaults = require('../config/defaults');

exports.index = function (req, res) {
  if (users.validateSession(req.session)) {
    file.show(res, 'chatview.html');
  } else {
    delete req.session;
    misc.redirect(res, '/');
  }
};

exports.pollUsers = function (req, res) {
  if (req.method !== 'POST') {
    misc.jsonError(res, "Invalid HTTP Request Method");
  } else if (users.validateSession(req.session)) {
    misc.sendJSON(res, users.list());
  } else {
    delete req.session;
    misc.jsonError(res, "Invalid Session Information");
  }
};

exports.pollMessages = function (req, res) {
  var time;
  if (req.method !== 'POST') {
    misc.jsonError(res, "Invalid HTTP Request Method");
  } else if (users.validateSession(req.session)) {
    time = users.lastActive(req.session.username);
    users.touch(req.session.username);
    if (req.body && req.body.all && req.body.all === true) {
      misc.sendJSON(res, {now: Date.now(), messages: messages.poll(0)});
    } else {
      misc.sendJSON(res, messages.poll(time));
    }
  } else {
    delete req.session;
    misc.jsonError(res, "Invalid Session Information");
  }
};

exports.say = function (req, res) {
  var timeout = settings.options.flood_delay || defaults.options.flood_delay;

  if (req.method !== 'POST') {
    misc.jsonError(res, "Invalid HTTP Request Method");
  } else if (users.validateSession(req.session)) {
    if (req.session.last_activity + timeout < Date.now()) {
      messages.add(req.session.username, req.body.message);
      req.session.last_activity = Date.now();
      misc.sendJSON(res, 'Success');
    } else {
      misc.jsonError(res, "Flood control activated.");
    }
  } else {
    delete req.session;
    misc.jsonError(res, "Invalid Session Information");
  }
};
