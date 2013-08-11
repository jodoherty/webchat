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

var settings = require('../config/settings');
var misc = require('../misc');

var users = {};
var timeout = settings.options.timeout || 120000;

misc.addCleanupHandler(function () {
  var u;

  for (u in users) {
    if (users.hasOwnProperty(u)) {
      if (users[u].timestamp + timeout < Date.now()) {
        delete users[u];
      }
    }
  }
  console.log(users);
});

exports.add = function (username, session_id) {
  users[username] = {
    timestamp: Date.now(),
    session_id: session_id
  };
  return users[username];
};

exports.lastActive = function (username) {
  if (users.hasOwnProperty(username)) {
    return users[username].timestamp;
  }
  return 0;
};

exports.touch = function (username) {
  if (users.hasOwnProperty(username)) {
    users[username].timestamp = Date.now();
    return true;
  } 
  return false;
};

exports.list = function () {
  var u;
  var list = [];

  for (u in users) {
    if (users.hasOwnProperty(u)) {
      list.push(u);
    }
  }

  return list;
};

exports.exists = function (username) {
  return users.hasOwnProperty(username);
}

exports.validateSession = function (session) {
  if (session && session.username && session.session_id) {
    if (users.hasOwnProperty(session.username) && users[session.username].session_id === session.session_id) {
      return true;
    }
  }
  return false;
};
