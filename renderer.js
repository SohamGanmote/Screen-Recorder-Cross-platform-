const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const video = document.querySelector("video");

let mediaRecorder;
let blobs = [];

const saveBlob = (function () {
	const a = document.createElement("a");
	document.body.appendChild(a);
	a.style.display = "none";
	return function saveData(blob, fileName) {
		const url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = fileName;
		a.click();
	};
})();

const getResource = (async () => {
	const source = await window.electron.getSources();
	let options = "";
	for (let i = 0; i < source.length; i++) {
		options = options + `<option value="${i}">${source[i].name}</option>`;
	}
	document.getElementById("sources").innerHTML = options;
})();

startButton.addEventListener("click", () => {
	navigator.mediaDevices
		.getDisplayMedia({
			audio: true,
			video: {
				width: 1920,
				height: 1080,
				frameRate: 60,
			},
		})
		.then((stream) => {
			video.srcObject = stream;
			video.onloadedmetadata = (e) => video.play();

			mediaRecorder = new MediaRecorder(stream);
			mediaRecorder.ondataavailable = (e) => {
				blobs.push(e.data);
			};

			mediaRecorder.onstop = (e) => {
				const blob = new Blob(blobs);
				saveBlob(blob, `video.mp4`);
				blobs.length = 0;
				startButton.disabled = false;
				stopButton.disabled = true;

				startButton.classList.add("button");
				startButton.classList.remove("reordering");
				startButton.innerHTML = `<i class="fas fa-play icon"></i> Start Recording`;
			};

			mediaRecorder.start();
			startButton.disabled = true;
			stopButton.disabled = false;

			startButton.classList.add("reordering");
			startButton.classList.remove("button");
			startButton.innerHTML = `<i class="fas fa-circle icon"></i> Recording...`;
		})
		.catch((e) => console.log(e));
});

stopButton.addEventListener("click", () => {
	video.pause();
	mediaRecorder.stop();
});

document.getElementById("sources").onchange = () => {
	window.electron.getSelectedSource(document.getElementById("sources").value);
};
