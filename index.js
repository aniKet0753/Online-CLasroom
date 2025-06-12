const app_id ="d0f2e4ba4eee4310ab84e5d4b4915972";
const token ="007eJxTYEg6cdIybxeTyv4JM+ZP+b8+PCi5zGPr3eincqLVLby9lqUKDCkGaUapJkmJJqmpqSbGhgaJSRYmqaYpJkkmloamluZGr5d7ZTQEMjJc16tiYmSAQBCfk8E5J7G4uCg/P5eBAQAIgSGt";
const channel="Classroom";
const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)
    let UID = await client.join(app_id, channel, token, null)
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks() 
    let player = `<div class="video-container" id="user-container-${UID}">
    <div class="video-player" id="user-${UID}"></div>
    </div>`
    document.getElementById('videostream').insertAdjacentHTML('beforeend', player)
    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[0], localTracks[1]])
}
let joinStream = async () => {
    await joinAndDisplayLocalStream()
    document.getElementById('joinbutton').style.display = 'none'
    document.getElementById('streamcontrol').style.display = 'flex'
}
let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user 
    await client.subscribe(user, mediaType)
    if (mediaType === 'video'){
      let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
          player.remove()
        }
        player = `<div class="video-container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div> 
                </div>`
        document.getElementById('videostream').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }
    if (mediaType === 'audio'){
      user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
      localTracks[i].stop()
      localTracks[i].close()
    }
    await client.leave()
    document.getElementById('joinbutton').style.display = 'block'
    document.getElementById('streamcontrol').style.display = 'none'
    document.getElementById('videostream').innerHTML = ''
}
let toggleMic = async (e) => {
    if (localTracks[0].muted){
      await localTracks[0].setMuted(false)
      e.target.innerText = 'Mic on'
      e.target.style.backgroundColor = 'cadetblue'
    }else{
      await localTracks[0].setMuted(true)
      e.target.innerText = 'Mic off'
      e.target.style.backgroundColor = '#EE4B2B'
    }
}
let toggleCamera = async (e) => {
    if(localTracks[1].muted){
      await localTracks[1].setMuted(false)
      e.target.innerText = 'Camera on'
      e.target.style.backgroundColor = 'cadetblue'
    }else{
      await localTracks[1].setMuted(true)
      e.target.innerText = 'Camera off'
      e.target.style.backgroundColor = '#EE4B2B'
    }
}
document.getElementById('joinbutton').addEventListener('click', joinStream)
document.getElementById('leavebutton').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('micbutton').addEventListener('click', toggleMic)
document.getElementById('camerabutton').addEventListener('click', toggleCamera)