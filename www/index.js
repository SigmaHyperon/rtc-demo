let soc = null;
let peer = null;
let initiator = false;
let video = null;
const emit = (key, data) => (soc != null) ? soc.emit(key, data) : null;
const destroyRTC = () => {
	peer.destroy();
	peer = null;
	emit("rtcDisconnect");
	console.warn("rtc connection destroyed");
}
function postData(data){
	console.log(data);
	$("div#received").append(`<p>${data}</p>`);
}
function createPeer(init = false){
	const tempPeer = new SimplePeer({ initiator: init });
	tempPeer.on('signal', data => {
		console.log("signal", data);
		emit('data', data);
	});
	tempPeer.on('data', postData);
	
	tempPeer.on('close', destroyRTC);
	tempPeer.on('error', destroyRTC);
	tempPeer.on('stream', stream => {
		video.srcObject = stream;
		video.play();
	})

	navigator.getUserMedia({ video: true, audio: false }, (stream) => {tempPeer.addStream(stream)}, () => {})
	return tempPeer;
}
function init(){
	const socket = io();
	socket.on('connect', ()=>{
		soc = socket;
	});
	socket.on("init", () => {
		peer = createPeer(true);
	});
	socket.on('data', data => {
		if(peer == null){
			peer = createPeer();
		}
		peer.signal(data);
	})
	socket.on('disconnect', ()=>{
		soc = null;
	});
	$("button#init").on('click', ()=>{
		emit("init");
	});
	$("button#send").on("click", ()=>{
		if(peer != null){
			console.log(`sending data:`, $(this).val());
			peer.send("test");
		} else {
			console.error('peer not ready');
		}
	});
	$("button#close").on('click', destroyRTC);
	video = document.querySelector('video');
}
$(init);