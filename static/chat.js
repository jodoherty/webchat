
var append_message = function (message, container) {
    var username,
        body,
        node = document.createElement('div'),
        body_node = document.createElement('div'),
        username_node = document.createElement('div');

    if (message === undefined) {
        message = {};
    }

    username = message.username || "System";
    body = message.body || "";

    username_node.appendChild(document.createTextNode(username));
    body_node.appendChild(document.createTextNode(body));
    node.className = 'chat-message-window';
    username_node.className = 'chat-message-window-username-label';
    body_node.className = 'chat-message-window-body';

    node.appendChild(username_node);
    node.appendChild(body_node);

    if (container !== undefined) {
        if (container.getElementsByClassName('chat-message-window').length > 100) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(node);
        node.scrollIntoView();
    }
    return node;
};

var update_users = function (users, container) {
    var list_node = document.createElement('ul'),
        item_node,
        i = 0,
        max = users.length;

    list_node.className = 'chat-userlist';
    users.sort();

    for (i = 0; i < max; i += 1) {
        item_node = document.createElement('li');
        item_node.appendChild(document.createTextNode(users[i]));
        list_node.appendChild(item_node);
    }

    if (container !== undefined) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(list_node);
    }
    return list_node;
};

var handle_message = function (message) {
    var target = document.getElementById('chat-message-container');
    append_message(message, target);
};

window.addEventListener('load', function () {
    var input_node = document.getElementById('chat-message-input'),
        username = 'user',
        pos = 0,
        history = [],
        current,
        tmp;

    input_node.addEventListener('change', function () {
        var value = input_node.value;
    });
    input_node.addEventListener('keydown', function (el) {
        var key = el.key || el.keyCode;
        if (key === 13) { // Enter has been pressed
            message = {
                username: username,
                body: input_node.value,
            };
            handle_message(message);
            history.push(message.body);
            pos = history.length;
            current = "";
            input_node.value = "";
            el.preventDefault();
        } else if (key === 38 || (key === 80 && el.ctrlKey)) { // Up has been pressed
            if (pos > 0) {
                if (pos === history.length) {
                    current = input_node.value || '';
                }
                pos -= 1;
                input_node.value = history[pos];
            }
            el.preventDefault();
        } else if (key === 40 || (key === 78 && el.ctrlKey)) { // Down has been pressed
            if (history.length > 0) {
                if (pos < history.length) {
                    pos += 1;
                    if (pos === history.length) {
                        input_node.value = current;
                    } else {
                        input_node.value = history[pos];
                    }
                } 
            }
            el.preventDefault();
        } else if (key === 9) { // Tab
            // TODO: Username and special command syntax auto-completion
            el.preventDefault();
        }
    });
    input_node.focus();
});

