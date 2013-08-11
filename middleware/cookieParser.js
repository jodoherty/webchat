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

exports.middleware = function (req, res) {
  var cookies_pieces;
  var i;
  var max;
  var index;
  var key;
  var value;

  req.cookies = {};
  if (req.headers.cookie) {
    cookie_pieces = req.headers.cookie.split(';');
    for (i = 0, max = cookie_pieces.length; i < max; i += 1) {
      index = cookie_pieces[i].indexOf('=');
      key = cookie_pieces[i].slice(0,index).trim();
      value = cookie_pieces[i].slice(index + 1).trim();
      req.cookies[key] = value;
    }
  }
}
