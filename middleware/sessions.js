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

var crypto = require('crypto');
var misc = require('../misc');

var sessions = {};

var session_timeout = 2*60*60*1000; // 2 hours

function generate_sid() {
  return crypto.randomBytes(32).toString('hex');
}

function create_session() {
  return {
    username: undefined,
    session_id: generate_sid(),
    timestamp: Date.now(),
    last_activity: 0
  };
}

exports.middleware = function (req, res) {
  if (req.cookies && req.cookies.session_id && sessions.hasOwnProperty(req.cookies.session_id)) {
    req.session = sessions[req.cookies.session_id];
    sessions[req.cookies.session_id].timestamp = Date.now();
  } else {
    // Start a new session
    req.session = create_session();
  }
  res.finalize.push(function () {
    var session = req.session || create_session();
    if (req.cookies.session_id !== session.session_id) {
      res.setHeader('Set-Cookie', ['session_id = ' + session.session_id]);
    }
    sessions[session.session_id] = session;
  });
};

misc.addCleanupHandler(function () {
  var sid;
  for (sid in sessions) {
    if (sessions.hasOwnProperty(sid)) {
      if (sessions[sid].time + session_timeout < Date.now()) {
        delete sessions[sid];
      }
    }
  }
  console.log(sessions);
});

