const socket = io()
const form = document.getElementById('send-container');
const messageInp = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
const ClientName = document.getElementById('ClientName');
const roomID = document.getElementById('roomID');
const cc = document.getElementById('cc')
const audio1 = new Audio('..\\static\\media\\message.mp3');
const audio2 = new Audio('..\\static\\media\\joinleft.mp3');
const audio3 = new Audio('..\\static\\media\\msgSent.mp3');
const d = new Date()

const curr = (d)=>{
    let time = d.toLocaleTimeString()
    let date = d.toLocaleDateString()
    return `${date} | ${time.replace(time.substring(3,6),"")}`
}

const append = (message,position)=>{
    const messageElement = document.createElement('div');
    messageElement.innerHTML = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if(position=="left") audio1.play();
    else if(position=="center") audio2.play();
    else if(position=="right") audio3.play();
}


let cname = "user",roomid = "admin";
socket.on('i-have-joined',details=>{
    cname = details["cname"];
    roomid = details["roomID"];
    ClientName.innerText = `Name : ${cname}`;
    roomID.innerText = `Room ID : ${roomid}`;
    socket.emit('new-user-joined',cname,roomid);
})

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const message = messageInp.value;
    append(`<p style="text-align: right;font-size: 14px;">${curr(d)}</p>You: ${message}`,'right')
    socket.emit('send',message,roomid);
    messageInp.value ='';
})

cc.addEventListener('click',(e)=>{
    messageContainer.innerHTML = ""
})

socket.on('user-joined',(name,user)=>{
    let index = 1;
    if(name!==cname){
        append(`<p style="text-align: right;font-size: 14px;">${curr(d)}</p>${name} joined`,'center');
    }
    document.querySelectorAll('.ClientName').forEach(e=>e.remove())
    for(let i in user)
    {
       if(user[i]!=cname){
        let participant = document.createElement('p');
        participant.setAttribute('class','ClientName');
        participant.innerText = `${index}.) ${user[i]}`;
        document.getElementById('information').append(participant);
        index +=1 
        }
    }
})

socket.on('receive',data=>{
    append(`<p style="text-align: right;font-size: 14px;">${curr(d)}</p>${data.name} : ${data.message}`,'left');
})

socket.on('left',(name,user)=>{
    append(`<p style="text-align: right;font-size: 14px;">${curr(d)}</p>${name} left`,'center');
    let index = 1;
    document.querySelectorAll('.ClientName').forEach(e=>e.remove())
    for(let i in user)
    {
       if(user[i]!=cname){
        let participant = document.createElement('p');
        participant.setAttribute('class','ClientName');
        participant.innerText = `${index}.) ${user[i]}`;
        document.getElementById('information').append(participant);
        index++;
        }
    }
})
