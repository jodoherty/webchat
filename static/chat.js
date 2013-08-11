
(function() {
  var DELAY = 500;
  var MAX_MESSAGE_COUNT = 200;
  var USERLIST_UPDATE_INTERVAL = 1000;
  var MESSAGE_UPDATE_INTERVAL = 300;
  var message_count = 0;
  var lastActivity = 0;
  var delayActive = false;
  var userlistContainer;
  var messageContainer;
  var serverTimeDelta = 0;

  function doPost(target, data, callback) {
    var req = new XMLHttpRequest();
    req.open('POST', target, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.onload = callback;
    req.send(JSON.stringify(data));
  };

  function pollMessages(options) {
    doPost('/chat/poll-messages', options , function () {
      var json = JSON.parse(this.responseText);
      if (options.all) {
        serverTimeDelta = Date.now() - json.now;
        showMessages(json.messages);
      } else {
        showMessages(json);
      }
      setTimeout(function () {
        pollMessages({});
      }, MESSAGE_UPDATE_INTERVAL);
    });
  };

  function pollUsers() {
    doPost('/chat/poll-users', null, function () {
      showUserlist(JSON.parse(this.responseText));
      setTimeout(pollUsers, USERLIST_UPDATE_INTERVAL);
    });
  };

  function showMessage(message) {
    var node = document.createElement('div');
    var bodyNode = document.createElement('div');
    var labelNode = document.createElement('div');
    var usernameNode = document.createElement('span');
    var timeNode = document.createElement('span');
    var container = messageContainer;
    var username; 
    var body;

    if (message === undefined) {
      message = {};
    }

    username = message.username || "System";
    body = message.body || "";

    usernameNode.className = 'username';
    timeNode.className = 'timestamp';
    node.className = 'chat-message-window';
    labelNode.className = 'chat-message-window-username-label';
    bodyNode.className = 'chat-message-window-body';
    usernameNode.appendChild(document.createTextNode(username));
    timeNode.appendChild(document.createTextNode(
          (new Date(serverTimeDelta + message.timestamp)).toString()));
    console.log(timeNode);
    labelNode.appendChild(usernameNode);
    labelNode.appendChild(timeNode);
    bodyNode.appendChild(document.createTextNode(body));

    node.appendChild(labelNode);
    node.appendChild(bodyNode);

    if (container !== undefined) {
      if (message_count > MAX_MESSAGE_COUNT) {
        container.removeChild(container.firstChild);
        message_count -= 1;
      }
      container.appendChild(node);
      message_count += 1;
      node.scrollIntoView();
    }
    return node;
  };

  function showMessages(messages) {
    var i;
    var max;

    max = messages.length;
    for (i=0; i < max; i += 1) {
      showMessage(messages[i]);
    }
  };

  function showUserlist(users) {
    var listNode = document.createElement('ul');
    var container = userlistContainer;
    var i;
    var max;
    var itemNode;

    listNode.className = 'chat-userlist';
    users.sort();

    max = users.length;
    for (i = 0; i < max; i += 1) {
      itemNode = document.createElement('li');
      itemNode.appendChild(document.createTextNode(users[i]));
      listNode.appendChild(itemNode);
    }

    if (container !== undefined) {
      while (container.lastChild) {
        container.removeChild(container.lastChild);
      }
      container.appendChild(listNode);
    }
    return listNode;
  };

  function say(message, callback) {
    doPost('/chat/say', {message: message}, function () {
      res = JSON.parse(this.responseText);
      if (res.error) {
        showMessage({
          username: '*** System Message ***',
          body: res.message
        });
      } else {
        callback();
        lastActivity = Date.now();
      }
    });
  };

  function handleMessage(message, callback) {
    var timeDelta = lastActivity + DELAY - Date.now();

    if (timeDelta > 0) {
      document.getElementById('chat-DELAY-warning').style.display = 'block';
      delayActive = true;
      setTimeout(function() {
        document.getElementById('chat-DELAY-warning').style.display = 'none';
        delayActive = false;
        say(message, callback);
      }, timeDelta);
    } else {
      say(message, callback);
    }
  };

  window.addEventListener('load', function () {
    var pos = 0;
    var history = [];
    var current;
    var tmp;
    var inputNode = document.getElementById('chat-message-input');
    userlistContainer = document.getElementById('chat-userlist-container');
    messageContainer = document.getElementById('chat-message-container');

    inputNode.addEventListener('keydown', function (el) {
      var key = el.keyCode;
      if (key === 13) { // Enter has been pressed
        if (delayActive === false && inputNode.value.trim().length > 0) {
          handleMessage(inputNode.value, function() {
            history.push(inputNode.value);
            pos = history.length;
            current = "";
            inputNode.value = "";
          });
        }
        el.preventDefault();
      } else if (key === 38 || (key === 80 && el.ctrlKey)) { // Up has been pressed
        if (pos > 0) {
          if (pos === history.length) {
            current = inputNode.value || '';
          }
          pos -= 1;
          inputNode.value = history[pos];
        }
        el.preventDefault();
      } else if (key === 40 || (key === 78 && el.ctrlKey)) { // Down has been pressed
        if (history.length > 0) {
          if (pos < history.length) {
            pos += 1;
            if (pos === history.length) {
              inputNode.value = current;
            } else {
              inputNode.value = history[pos];
            }
          } 
        }
        el.preventDefault();
      } else if (key === 9) { // Tab
        // TODO: Username and special command syntax auto-completion
        el.preventDefault();
      }
    });
    inputNode.focus();
    pollUsers();
    pollMessages({all: true});
  });
})();
