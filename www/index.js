let soc = null;
let peer = null;
let initiator = false;
function postData(data){
	console.log(data);
	$("div#received").append(`<p>${data}</p>`);
}
function init(){
	const socket = io();
	socket.on('connect', ()=>{
		soc = socket;
	});
	socket.on('data', data => {
		console.log("received data");
		if(initiator == false){
			if(peer == null){
				peer = new SimplePeer();
				peer.on('signal', d => {
					socket.emit('data', d);
				});
				peer.on('data', postData);
			}
			peer.signal(data);
		} else if( initiator == true) {
			peer.signal(data);
		}
	})
	socket.on('disconnect', ()=>{
		soc = null;
	});
	$("button#init").on('click', ()=>{
		initiator = true;
		peer = new SimplePeer({ initiator: true });
		peer.on('signal', data => {
			console.log("signal", data);
			socket.emit('data', data);
		});
		peer.on('data', postData);
	});
	$("button#send").on("click", ()=>{
		if(typeof peer != 'undefined'){
			console.log(`sending data:`, $(this).val());
			peer.send("test");
		} else {
			console.error('peer not ready');
		}
	});
}
$(init);