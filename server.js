'use strict';

var HTTP = require('http');
var EXPRESS = require('express');
var path = require('path');
var _ = require('lodash');
var app = EXPRESS();
var httpServer = HTTP.createServer(app);
var SOCKET_IO = require('socket.io').listen(httpServer);
var userNamesObj = {};
var socketsRefObj = {};


httpServer.listen(3070);

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(EXPRESS.static(path.join(__dirname, 'public')));

app.get('/', function (request, response) {

	response.sendFile(__dirname + '/index.html');

});

SOCKET_IO.sockets.on('connection', function (socket) {

	socket.on('send_message', function (data, callBack) {

		var message;
		var privateMessageRecog;
		var isPrivateMessaging;
		var messageObjForEvent = {};


		message = data.trim();

		/**
		 * Validating, if accidently empty string inserted by user.
		 */
		if (_.isEmpty(message)) {

			callBack(false, "Entered message was empty.");

			return;
		}

		isPrivateMessaging = false;

		/**
		 * `private messaging` will start with `@`, here we are recognizing if
		 * 	user send a personal message.
		 */
		if (message.charAt() === '@') {

			var firstWhiteSpaceIndex;
			var targetUserName;
			var particularMessage;

			firstWhiteSpaceIndex = message.indexOf(' ');
			targetUserName = message.substr(1, firstWhiteSpaceIndex - 1);
			particularMessage = message.substr(firstWhiteSpaceIndex + 1);

			if (targetUserName in userNamesObj) {

				isPrivateMessaging = true;

				messageObjForEvent['targetUserName'] = targetUserName;
				messageObjForEvent['message'] = particularMessage;

				callBack(true, "Message has been sent privately to " + targetUserName);
			} else {

				callBack(false, "Targeted user i.e. " + targetUserName + " not found into live users list.");

				return;
			}
		}

		if (isPrivateMessaging) {

			socketsRefObj[targetUserName].emit('private_messaging', messageObjForEvent);

			return;
		}

		messageObjForEvent = null;

		if (!isPrivateMessaging) {

			SOCKET_IO.sockets.emit('new_message', {

				"userName": socket.username,
				"message": message
			});

			return;
		}

	});

	socket.on('is_valid_username', function (data, callBack) {

		if (!_.isEmpty(userNamesObj) && data in userNamesObj) {

			callBack(false);
		} else {

			socket.username = data.trim();
			userNamesObj[data] = 1;
			socketsRefObj[data] = socket;

			callBack(true);

			SOCKET_IO.sockets.emit('new_user', userNamesObj);
		}
	});

	socket.on('disconnect', function () {

		if (!socket.username) return;

		delete userNamesObj.socket.username;
		SOCKET_IO.sockets.emit('new_user', userNamesObj);

	});

});
