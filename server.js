var HTTP = require('http');
var EXPRESS = require('express');
var path = require('path');
var _ = require('lodash');
var app = EXPRESS();
var httpServer = HTTP.createServer(app);
var SOCKET_IO = require('socket.io').listen(httpServer);
var userNamesArr = ['parvesh'];


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

		SOCKET_IO.sockets.emit('new_message', data);
	});

	socket.on('is_valid_username', function (data, callBack) {

		if (userNamesArr.indexOf(data) === -1) {

			socket.username = data;
			userNamesArr.push(data);

			callBack(true);

		} else {

			callBack(false);
		}
	});


});
