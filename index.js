// This is the node server which will handle socket io connections

const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const PORT = 8000
const user = {}

app.use('/static',express.static(path.join(__dirname,'static')))
app.use(express.urlencoded());

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/views/index.html')
})

let cname = {name:"undefined"};
app.post('/',(req,res)=>{
    cname = req.body
    res.redirect('/chatroom')
})

app.get('/chatroom',(req,res)=>{
    res.sendFile(__dirname+'/views/chatroom.html')
})

io.on('connection',socket =>{
    socket.emit('i-have-joined',cname)
    socket.on('new-user-joined',name=>{
        user[socket.id] = name;
        io.sockets.emit('user-joined',name,user);
    });

    socket.on('send',message=>{
        socket.broadcast.emit('receive',{message:message,name:user[socket.id]});
    });

    socket.on('disconnect',message=>{
        a = user[socket.id];
        delete user[socket.id];
        socket.broadcast.emit('left',a,user);
    })
})

server.listen(PORT,()=>console.log(`Server is running on port:${PORT}`))