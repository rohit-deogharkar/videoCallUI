<?php 
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, OPTIONS");
?>
<!DOCTYPE html>
<html>
<head>
  <title>WebRTC Video Call</title>
  <link rel="stylesheet" href="<?php echo base_url('style.css')?>" />

<style>
  body {
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    padding: 0;
    text-align: center;
  }
  #roleHeading {
    font-size: 28px;
    padding: 20px;
  }
  #videos {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 20px;
  }
  video {
    width: 360px;
    height: 270px;
    background: black;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  body.agent-ui {
    background: #e3f2fd;
    color: #01579b;
  }
  body.customer-ui {
    background: #fff8e1;
    color: #e65100;
  }
  button {
    padding: 12px 28px;
    font-size: 16px;
    margin-top: 10px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s ease;
  }
  #startCall {
    background-color: #0288d1;
    color: white;
  }
  #endCall {
    background-color: #c62828;
    color: white;
  }
#toggleCamera {
  background-color: #0288d1;
  color: white;
}
.btn{
  display:flex;
  
  gap: 20px;
}
#shareScreen {
  background-color: #f57c00;
  color: white;
}
#popup{
  display:flex;
   position: fixed;
   top
}

  #startCall:hover, #endCall:hover {
    opacity: 0.9;
  }
</style>

</head>
<body>
<div id="popup" >
  <p>Send this link to the customer:</p>
  <input type="text" id="joinURL" style="width:100%; padding:10px;" readonly />
  <button onclick="copyLink()" style="margin-top:10px; padding:8px 16px;">Copy</button>
</div>

  <h1 id="roleHeading">Peer-to-Peer Video Call</h1>
  
  <div id="startContainer">
    <button class="btn" id="startCall">Start Call</button>
  </div>

  <div id="videos" style="display: none;">
    <video id="localVideo" autoplay muted playsinline></video>
    <video id="remoteVideo" autoplay playsinline></video>
  </div>
  <div class="btn">
    <button id="shareScreen">Start Screen Share</button>
    <button id="toggleCamera">Turn Off Camera</button>
    <button id="endCall">End Call</button>
  </div>

  <!-- <script src="/socket.io/socket.io.js"></script> -->
   <script src="https://cdn.socket.io/4.8.1/socket.io.min.js" integrity="sha384-mkQ3/7FUtcGyoppY6bz/PORYoGqOl7/aSUMn2ymDOJcapfS6PHqxhRTMh1RR0Q6+" crossorigin="anonymous"></script>
  <script src="<?php echo base_url('index.js')?>"></script>
</body>
</html>

