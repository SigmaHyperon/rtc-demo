const http = require('http');
const io = require('socket.io')();
const express = require('express');
const uuid = require('uuid/v1');
const {pipe, fn} = require('./lib');

const app = express();

app.use('/', express.static('www'));
const server = http.createServer(app).listen(3000);
io.listen(server);

const clients = [];
const pool = [];
const partners = [];

const relay = fn(self => target => data => {
	if(target != null){
		target.socket.emit("data", data);
		console.log(`relay from ${self} to ${target.id}`);
	} else {
		throw `no partner selected`;
	}
});

const init = () => {

};

io.on('connection', socket => {
	const id = uuid();
	pool[id] = {id, socket};
	let partner = null;
	const relay_ = relay(id, partner);

	socket.on("data", relay_);
	socket.on("connect", init);
})

