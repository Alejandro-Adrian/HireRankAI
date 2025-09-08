const videoEl = document.getElementById("localVideo");
const transcriptEl = document.getElementById("youTranscript");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const toggleCamBtn = document.getElementById("toggleCam");

let ws;
let micStream;
let audioContext;
let processor;

startBtn.onclick = async () => {
    micStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    // Show local camera
    videoEl.srcObject = micStream;

    // Connect to backend transcription WebSocket
    ws = new WebSocket("ws://localhost:5000");
    ws.binaryType = "arraybuffer";

    ws.onopen = () => console.log("🔌 Connected to backend");
    ws.onmessage = (event) => {
        transcriptEl.textContent = `You: ${event.data}`;
    };

    // Setup audio pipeline
    audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(micStream);
    processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = floatTo16BitPCM(inputData);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(pcm16);
        }
    };

    startBtn.disabled = true;
    stopBtn.disabled = false;
};

stopBtn.onclick = () => {
    if (processor) processor.disconnect();
    if (audioContext) audioContext.close();
    if (ws) ws.close();

    micStream.getTracks().forEach(track => track.stop());

    startBtn.disabled = false;
    stopBtn.disabled = true;
};

toggleCamBtn.onclick = () => {
    videoEl.style.display = videoEl.style.display === "none" ? "block" : "none";
};

function floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
}
