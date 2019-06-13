const http = require('http');
const io = require('socket.io')();
const express = require('express');
const uuid = require('uuid/v1');
const {pipe, fn} = require('./lib');

const app = express();

app.use('/', express.static('www'));
const server = http.createServer(app).listen(3000);
io.listen(server);

const pool = {};
const partners = {};

const relay = fn(self => data => {
	if(typeof partners[self] != 'undefined'){
		partners[self].socket.emit("data", data);
	}
});

const init = fn(id => () => {
	if(Object.keys(pool).length > 1){
		const a = pool[id];
		delete pool[id];
		const b_ID = Object.keys(pool)[Math.floor(Math.random()*Object.keys(pool).length)];
		const b = pool[b_ID];
		delete pool[b_ID];
		partners[a.id] = b;
		partners[b.id] = a;
		a.socket.emit("init");
	}
});

const destroy = fn(id => () => {
	if(typeof pool[id] != 'undefined')
		delete pool[id];
	if(typeof partners[id] != 'undefined'){
		const b_ID = partners[id].id
		pool[b_ID] = partners[b_ID];
		delete partners[b_ID];
		delete partners[id];
	}
});

const rtcDisconnect = fn(id => () => {
	if(typeof partners[id] != 'undefined'){
		const a_ID = id;
		pool[a_ID] = partners[a_ID];
		const b_ID = partners[id].id
		pool[b_ID] = partners[b_ID];
		delete partners[b_ID];
		delete partners[a_ID];
	}
});

io.on('connection', socket => {
	const id = uuid();
	pool[id] = {id, socket};

	const relay_ = relay(id);
	const init_ = init(id);
	const destroy_ = destroy(id);
	const rtcDisconnect_ = rtcDisconnect(id);

	socket.on("data", relay_);
	socket.on("init", init_);
	socket.on("disconnect", destroy_);
	socket.on("rtcDisconnect", rtcDisconnect_);
})

