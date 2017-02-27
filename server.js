var HTTP = require('http');
var EXPRESS = require('express');
var path = require('path');
var _ = require('lodash');
var app = EXPRESS();
var httpServer = HTTP.createServer(app);
var SOCKET_IO = require('socket.io').listen(httpServer);
var userNamesObj = {};


httpServer.listen(3070);

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(EXPRESS.static(path.join(__dirname, 'public')));

app.get('/', function (request, response) {

	response.sendFile(__dirname + '/index.html');

});

SOCKET_IO.sockets.on('connection', function (socket) {

	socket.on('send_message', function (data) {

		SOCKET_IO.sockets.emit('new_message', {

			"userName": socket.username,
			"message": data
		});
	});

	socket.on('is_valid_username', function (data, callBack) {

		if (data in userNamesObj) {

			callBack(false);
		} else {

			socket.username = data;
			userNamesObj.data = 1;

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
