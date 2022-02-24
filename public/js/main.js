var main = document.querySelector(".main");
var msgdisplay = document.querySelector('.megdisplay');
var msgInput = document.querySelector('.sender > input');
var msgBtnSent = document.querySelector('.sender > button');
var control = document.querySelector('.control');
var pername ;
var clind_id ;
function displayMessage(msg, isOutgoing=true){
    let outmsg = document.createElement('div');
    outmsg.className = isOutgoing?'outgoing':'incoming';
    outmsg.innerText = msg;
    msgdisplay.appendChild(outmsg);
    msgdisplay.scrollTo(0, msgdisplay.scrollHeight);
}

msgBtnSent.onclick = function(ev){
    displayMessage(msgInput.value);
    datach.send(msgInput.value);
    msgInput.value = "";
}

function showList(data)
{
    let selectyourHost = `
                <div class="selectHost">
                    <h3>Select Your Host</h3>
                    <button onclick="toSelectHost(1)">Hello world</button>
                </div>
    `
    let item = "";
    for(let i = 0; i < data.length; i ++)
    {
        console.log(data[i]);
        item +=  `<button onclick="toSelectHost(${data[i].id})">${data[i].name}</button>\n`;
    }

    control.innerHTML = `<div class="selectHost">
                            <h3>Select Your Host</h3>
                            ${item}
                        </div>`;
}
function toSelectHost(id){
    window.addEventListener('beforeunload', (e)=>{
        let cmfMsg = 'you lost every conversetion and connections';
        (e || window.event).returnValue = cmfMsg;
        return cmfMsg;
    });
    fetch('/hosts/'+id)
    .then(res=>res.json())
    .then(data=>{
        pername = data.name;
        clind_id = data.clind_id;
        console.log(data);
        hostAnswer(JSON.parse(data.sdp))
        .catch(err=>{
            console.error(err);
        })
    })
}
function toJoin(){
    control.innerHTML = '<span class="loader"></span>';
    fetch('/hosts')
    .then(res=>res.json())
    .then(showList)
}

function toHost(){
    control.innerHTML = `<div class="hostname">
                            <label for="name">Enter your name : </label>
                            <input type="text" id="name">
                            <button onclick="createHost()">create Host</button>
                        </div>`;
}

function createHost(){
    pername = document.querySelector(".hostname input#name").value;
    control.innerHTML = '<span class="loader"></span>';
    window.addEventListener('beforeunload', (e)=>{
        let cmfMsg = 'you lost every conversetion and connections';
        (e || window.event).returnValue = cmfMsg;
        return cmfMsg;
    });
    createHostOffer()
    .catch(err=>{
        console.log(err)
    });
}

function lookingClient(){
    fetch('/clinds/'+clind_id)
    .then(res=>res.json())
    .then(data=>{
        if(data.clind != "")
        {
            local.setRemoteDescription(JSON.parse(data.clind))
            then(()=>{
                console.log("set Remote Description");
            })
            .catch(err=>{
                console.error(err);
            })
        }else{
            setTimeout(lookingClient, 1000);
        }
    })
}

async function jsonPostTo(url, data)
{
    let res = await fetch(url, {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify(data)
        });
    let jsondata = await res.json();
    return jsondata;
}

//remote working here
const configuration = {
    'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'}
    ],
    iceCandidatePoolSize: 10
}
var local = new RTCPeerConnection(configuration);
var datach;

var signalingOk = false;

local.onicecandidate = (ev) => {
    console.log(JSON.stringify(local.localDescription));
    if(!signalingOk)
    {
        signalingOk = true;
        if(local.localDescription.type == 'offer')
        {
            jsonPostTo('hosts', {name:pername, sdp:JSON.stringify(local.localDescription)})
            .then(data=>{
                console.log(data);
                clind_id = data.clind_id;
                setTimeout(lookingClient, 1000);
            });
        }else{
            jsonPostTo('hosts/'+clind_id, {id:clind_id, sdp:JSON.stringify(local.localDescription)})
            .then(data=>{
                console.log(data);
            });
        }
    }
};

async function createHostOffer(){
    datach = local.createDataChannel("shadhin");
    datach.onopen = (ev)=>{
        main.classList.remove('hide');
        console.log('connection Stablish');
    }
    datach.onmessage = (ev)=>{
        displayMessage(ev.data, false);
    }
    let sdp = await local.createOffer();
    await local.setLocalDescription(sdp);
    console.log('set a local distription');
    // jsonPostTo('hosts', {name:name, sdp:JSON.stringify(local.localDescription)})
    // console.log(JSON.stringify(local.localDescription));
}

async function hostAnswer(rsdp){
    await local.setRemoteDescription(rsdp);
    console.log('set a Remote distription');
    local.ondatachannel = (ev)=>{
        datach = ev.channel;
        datach.onopen = (ev)=>{
            main.classList.remove('hide');
            console.log('connection Stablish');
        }
        datach.onmessage = (ev)=>{
            displayMessage(ev.data, false);
        }
    }
    let lsdp = await local.createAnswer();
    await local.setLocalDescription(lsdp);
    console.log('set a local distription');
    console.log(JSON.stringify(local.localDescription));
}

// local.createOffer()
// .then(rtcsd => local.setLocalDescription(rtcsd))
// .then(()=>{
//     console.log('set a local distription');
// });