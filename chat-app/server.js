const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
// io es para todos, socket es para un usuario en especifico
const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))

app.get('/usuarios/:room', (req, res) => {
    const room = req.params.room
    res.json(usuarios_per_room[room] || [])
})


server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000')
})

usuarios_per_room = {}

io.on('connection', (socket) => {
    console.log('Usuario conectado!')

    socket.on('unirse', (msg) =>{
        console.log(msg)
        socket.nombre = msg.nombre  
        socket.room = msg.room
        socket.join(msg.room)
        socket.broadcast.to(msg.room).emit('mensaje', {
            nombre: 'Sistema',
            mensajes: msg.nombre + ' se ha unido a la sala.'
        })
        if (!usuarios_per_room[msg.room]) {
            usuarios_per_room[msg.room] = []
        }
        usuarios_per_room[msg.room].push(msg.nombre)
    })

    socket.on('mensaje',(msg) => {
        io.to(msg.room).emit('mensaje', msg)
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
})

