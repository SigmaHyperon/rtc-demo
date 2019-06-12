const http = require('http');
const io = require('socket.io')();
const express = require('express');
const uuid = require('uuid/v1');

const app = express();

app.use('/', express.static('www'));
const server = http.createServer(app).listen(3000);
io.listen(server);

const clients = [];
const pool = [];

io.on('connection', socket => {
	const id = uuid();
	pool[id] = {id, socket};
	let partner = null;
	
	function relay(data){
		if(partner != null){
			partner.socket.emit("data", data);
			console.log(`relay from ${id} to ${partner.id}`);
		} else {
			throw `no partner selected`;
		}
	}
	socket.on("data", relay );
})

