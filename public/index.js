const socket = io('http://tracelog4.slashrtc.in');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallBtn = document.getElementById('startCall');
const startContainer = document.getElementById('startContainer');
const videosContainer = document.getElementById('videos');
const endCallBtn = document.getElementById('endCall');
const roleHeading = document.getElementById('roleHeading');
const toggleCameraBtn = document.getElementById('toggleCamera');
const shareScreenBtn = document.getElementById('shareScreen');
const joinURL = document.getElementById('joinURL')
const popup = document.getElementById('popup')

let peerConnection;
let localStream;
let roomId;
let isCameraOn = true;
let isSharingScreen = false;
let originalVideoTrack;

const params = new URLSearchParams(window.location.search);
const role = params.get('role') || 'agent';

if (role === 'agent') {
  document.body.classList.add('agent-ui');
  roleHeading.textContent = 'Agent - Video Call';
} else {
  document.body.classList.add('customer-ui');
  document.getElementById('startCall').style.display = 'none';
  document.getElementById('popup').style.display = 'none';
  roleHeading.textContent = 'Customer - Video Call';

}

function copyLink() {
  const input = document.getElementById('joinURL'); 
  input.select();
  document.execCommand('copy');
  alert('Link copied to clipboard!');
}

toggleCameraBtn.onclick = () => {
  if (!localStream) return;
  const videoTrack = localStream.getVideoTracks()[0];
  if (videoTrack) {
    isCameraOn = !isCameraOn;
    videoTrack.enabled = isCameraOn;
    toggleCameraBtn.textContent = isCameraOn ? 'Turn Off Camera' : 'Turn On Camera';
  }
};

endCallBtn.onclick = () => {
  socket.emit('end-call');
  cleanup();
};

roomId = params.get('room');
if (roomId) {
  init(roomId);
}

async function init(room) {
  console.log("init function")
  console.log(room)
  joinURL.style.display = 'block'
  startContainer.style.display = 'none';
  videosContainer.style.display = 'flex';
  endCallBtn.style.display = 'block';

  setTimeout(()=>{
    popup.style.display = 'none'
  },2000)

  const customerUrl = `http://localhost:8080/?room=${roomId}&role=customer`
  joinURL.value = customerUrl;

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    console.log("localStream ===> ", localStream)
  } catch (err) {
    alert('Could not access camera: ' + err.message);
    console.log("this error occured=======")
    return;
  }

  localVideo.srcObject = localStream;

  peerConnection = createPeerConnection();

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  socket.emit('join-room', room);

  socket.on('room-full', () => {
    alert('Room is full. You cannot join.');
  });

  // Handle signaling events
  socket.on('user-connected', async () => {
    if (role === 'agent') {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('offer', offer);
    }
  });

  socket.on('offer', async offer => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
  });

  socket.on('answer', answer => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on('ice-candidate', candidate => {
    if (candidate) {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  });

  socket.on('user-disconnected', () => {
    alert('User disconnected.');
    cleanup();
  });

  socket.on('force-disconnect', () => {
    alert('Call ended by the other user.');
    cleanup();
  });

  socket.on('room-expired', () => {
    alert('This room has expired. Cannot join.');
    cleanup();
  });
}

function createPeerConnection() {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  const remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  pc.ontrack = event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  };

  pc.onicecandidate = event => {
    if (event.candidate) {
      socket.emit('ice-candidate', event.candidate);
    }
  };

  return pc;
}

shareScreenBtn.onclick = async () => {
  if (!peerConnection || !localStream) return;

  if (!isSharingScreen) {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace current video track with screen track
      const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
      if (sender) {
        originalVideoTrack = localStream.getVideoTracks()[0];
        sender.replaceTrack(screenTrack);
        localVideo.srcObject = screenStream;

        screenTrack.onended = () => {
          // Revert to original camera stream when screen sharing ends
          sender.replaceTrack(originalVideoTrack);
          localVideo.srcObject = localStream;
          shareScreenBtn.textContent = 'Start Screen Share';
          isSharingScreen = false;
        };

        isSharingScreen = true;
        shareScreenBtn.textContent = 'Stop Screen Share';
      }
    } catch (err) {
      alert('Screen sharing failed: ' + err.message);
    }
  } else {
    const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
    if (sender && originalVideoTrack) {
      sender.replaceTrack(originalVideoTrack);
      localVideo.srcObject = localStream;
    }
    shareScreenBtn.textContent = 'Start Screen Share';
    isSharingScreen = false;
  }
};


function cleanup() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }
  socket.disconnect();
  startContainer.style.display = 'block';
  videosContainer.style.display = 'none';
  endCallBtn.style.display = 'none';
}


