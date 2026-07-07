const express = require('express')
const https = require('https')
const fs = require('fs')
const credentials = {
    key: fs.readFileSync('192.168.1.X+2-key.pem'),
    cert: fs.readFileSync('192.168.1.X+2.pem')
}
const { Server } = require('socket.io')
const session = require('express-session')
const { registrarUsuario, obtenerUsuario, obtenerUsuarioPorId, crearRoom, obtenerRoomPorId, obtenerRooms, unirseARoom, guardarMensaje, obtenerMensajesPorRoom } = require('./database')
// io es para todos, socket es para un usuario en especifico
const app = express()
const server = https.createServer(credentials,app)
const io = new Server(server)
const bcrypt = require('bcrypt')

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(express.static('public'))
app.use(session({
    secret: 'mi-secreto',
    resave: false,
    saveUninitialized: false
}))

app.get('/', (req, res) => {
    res.redirect('/login')
})

app.get('/usuarios/:room', (req, res) => {
    const room = req.params.room
    res.json(usuarios_per_room[room] || [])
})

app.get('/login', (req,res) => {
    res.sendFile(__dirname + '/public/login.html')
})

app.get('/login', (req,res) => {
    res.redirect('/login')
})

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html')
})

app.post('/register', (req, res) =>{
    const { username, password } = req.body
    try {
        registrarUsuario(username, password)
        res.redirect('/login')
    } catch (error) {
        console.error('Error al registrar:', error)
        res.redirect('/register')
    }
})

app.post('/login', (req, res) => {
    const { username, password } = req.body
    const user = obtenerUsuario(username)
    if (user && bcrypt.compareSync(password, user.password)){
        req.session.userId = user.id
        res.redirect('/rooms')
    }else {
        res.redirect('/login')
    }
})

function auth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login')
    }
    next()
}

app.get('/rooms', auth, (req, res) => {
    res.sendFile(__dirname + '/public/chat.html')
})

app.post('/rooms/create', auth, (req, res) => {
    const { nombre } = req.body
    const user = obtenerUsuarioPorId(req.session.userId)
    crearRoom(nombre, user.username)
    res.redirect('/rooms')
})

app.get('/rooms/:id', auth, (req, res) => {
    const roomId = req.params.id
    const room = obtenerRoomPorId(roomId)
    if (!room) {
        return res.status(404).send('Sala no encontrada')
    }
    try{
        unirseARoom(req.session.userId, roomId)
    }catch (e){
    }
    res.sendFile(__dirname + '/public/chat.html')
})

app.get('/api/rooms', auth, (req, res) => {
    const rooms = obtenerRooms()
    res.json(rooms)
})

app.get('/api/rooms/:id/mensajes', auth, (req, res) => {
    const roomId = req.params.id
    const mensajes = obtenerMensajesPorRoom(roomId)
    res.json(mensajes)
})

app.get('/api/me', auth, (req, res) => {
    const user = obtenerUsuarioPorId(req.session.userId)
    res.json({ id: user.id, username: user.username })  // ← agrega id
})

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})

server.listen(3000, () => {
    console.log('Servidor corriendo en https://localhost:3000')
})

usuarios_per_room = {}

io.on('connection', (socket) => {
    console.log('Usuario conectado!')

    socket.on('unirse', (data) =>{
        console.log(data)
        socket.nombre = data.username  
        socket.room = data.roomId
        socket.join(data.roomId)
        socket.broadcast.to(data.roomId).emit('mensaje', {
            nombre: 'Sistema',
            mensajes: data.username + ' se ha unido a la sala.'
        })
        if (!usuarios_per_room[data.roomId]) {
            usuarios_per_room[data.roomId] = []
        }
        usuarios_per_room[data.roomId].push(data.username)
    })

    socket.on('mensaje',(data) => {
        console.log(data)
        guardarMensaje(data.userId, data.roomId, data.texto)
        io.to(data.roomId).emit('mensaje', {
            nombre: data.username,
            mensajes: data.texto
        })
    })

    socket.on('unirse-video', (data) => {
        console.log('Unirse-video recibido de: ', socket.id, 'room: ', data.roomId)
        socket.to(data.roomId).emit('nuevo-en-video', {
            de:socket.id
        })
    })


    socket.on('disconnect', () =>{
        socket.broadcast.to(socket.room).emit('mensaje',{
            nombre: 'Sistema',
            mensajes: socket.nombre + ' ha salido de la sala.'
        })
        if (!usuarios_per_room[socket.room]) {
            usuarios_per_room[socket.room] = []
        }
        usuarios_per_room[socket.room] = usuarios_per_room[socket.room].filter(u => u !== socket.nombre)
        console.log(socket.nombre + ' ha salido de la sala.')
    })

    socket.on('oferta', (data) => {
        socket.to(data.roomId).emit('oferta', {
            oferta: data.oferta,
            de: socket.id
        })
    })

    socket.on('respuesta', (data) => {
        console.log('respuesta en servidor, para: ', data.para)
        socket.to(data.para).emit('respuesta',{
            respuesta: data.respuesta,
            de: socket.id
        })
    })

    socket.on('icecandidates', (data) => {
        console.log('candidate recibido en servidor de: ',socket.id)
        socket.to(data.roomId).emit('icecandidates',{
            candidate: data.candidate,
            de: socket.id
        })
    })
})

