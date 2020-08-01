// This is the node server which will handle socket io connections

const express = require( 'express' )
const socketio = require( 'socket.io' )
const http = require( 'http' )
const path = require( 'path' )

const app = express()
const server = http.createServer( app )
const io = socketio( server )
const PORT = 8000
const rooms = {}

app.set( 'view engine', 'ejs' )
app.use( '/static', express.static( path.join( __dirname, 'static' ) ) )
app.use( express.urlencoded() );

let roomExists = true;
app.get( '/', ( req, res ) =>
{
    res.render( 'index', { roomExists: roomExists } )
    roomExists = true;
} )
app.get( '/createRoom', ( req, res ) =>
{
    res.render( 'createRoom' )
} )

let details = { cname: "user", roomID: "admin" };
app.post( '/', ( req, res ) =>
{
    details = req.body;
    if ( Object.keys( rooms ).includes( details["roomID"] ) ) res.redirect( '/chatroom' )
    else {
        roomExists = false;
        res.redirect( '/' )
    }
} )
app.post( '/createRoom', ( req, res ) =>
{
    details = req.body;
    rooms[details["roomID"]] = {};
    res.redirect( '/chatroom' );
} )

app.get( '/chatroom', ( req, res ) =>
{
    res.render( 'chatroom' );
} )

// on hitting /chatroom
io.on( 'connection', socket =>
{
    socket.join( details["roomID"] );
    socket.emit( 'i-have-joined', details );
    socket.on( 'new-user-joined', ( name, roomid ) =>
    {
        rooms[roomid][socket.id] = name;
        io.to( roomid ).emit( 'user-joined', name, rooms[roomid] );
    } );

    socket.on( 'send', ( message, roomid ) =>
    {
        socket.to( roomid ).broadcast.emit( 'receive', { message: message, name: rooms[roomid][socket.id] } );
    } );

    let room_id;
    socket.on( 'disconnecting', () =>
    {
        room_id = Object.keys( socket.rooms )[0];
    } )
    
    socket.on( 'disconnect', () =>
    {
        a = rooms[room_id][socket.id];
        delete rooms[room_id][ socket.id ];
        socket.to( room_id ).broadcast.emit( 'left', a, rooms[room_id] );
        socket.leave( room_id );
        if ( rooms[room_id].length == 0 ) {
            delete rooms[room_id];
        }
    } )
} )

server.listen( PORT, () => console.log( `Server is running on port:${PORT}` ) )