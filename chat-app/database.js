const Database = require('better-sqlite3')
const db = new Database('chat.db')

const bcrypt = require('bcrypt')

function crearTablas() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    username    TEXT NOT NULL UNIQUE,
                    password    TEXT NOT NULL
                );

        CREATE TABLE IF NOT EXISTS rooms (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre    TEXT NOT NULL UNIQUE,
                    creado_por    TEXT NOT NULL,
                fecha_creacion TEXT NOT NULL
                );

        CREATE TABLE IF NOT EXISTS mensajes (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                room_id INTEGER NOT NULL REFERENCES rooms(id),
                    texto    TEXT NOT NULL,
                    fecha_creacion TEXT NOT NULL
                ); 

        CREATE TABLE IF NOT EXISTS room_usuarios (
                user_id INTEGER NOT NULL REFERENCES users(id),
                room_id INTEGER NOT NULL REFERENCES rooms(id),
                    fecha_union      TEXT NOT NULL
                );   
    `);
}

// Funciones para manejar usuarios

function registrarUsuario(username, password){
    const hash = bcrypt.hashSync(password,10)
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
    stmt.run(username, hash)
}

function obtenerUsuario(username){
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
    return stmt.get(username)
}

function obtenerUsuarioPorId(id){
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    return stmt.get(id)
}


// Funciones para manejar rooms
function crearRoom(nombre, creado_por){
    const stmt = db.prepare('INSERT INTO rooms (nombre, creado_por, fecha_creacion) VALUES (?, ?, ?)')
    stmt.run(nombre, creado_por, new Date().toISOString())
}

function obtenerRoomPorId(id){
    const stmt = db.prepare('SELECT * FROM rooms WHERE id = ?')
    return stmt.get(id)
}

function obtenerRooms(){
    const stmt = db.prepare('SELECT * FROM rooms')
    return stmt.all()
}

function unirseARoom(user_id, room_id){
    const stmt = db.prepare('INSERT INTO room_usuarios (user_id, room_id, fecha_union) VALUES (?, ?, ?)')
    stmt.run(user_id, room_id, new Date().toISOString())
}

// Funciones para manejar mensajes

function guardarMensaje(user_id, room_id, texto){
    const stmt = db.prepare('INSERT INTO mensajes (user_id, room_id, texto, fecha_creacion) VALUES (?, ?, ?, ?)')
    stmt.run(user_id, room_id, texto, new Date().toISOString())
}

function obtenerMensajesPorRoom(room_id){
    const stmt = db.prepare(`SELECT m.texto, m.fecha_creacion, u.username 
                        FROM mensajes m 
                        JOIN users u ON m.user_id = u.id    
                        WHERE m.room_id = ?
                        ORDER BY m.fecha_creacion ASC`)
    return stmt.all(room_id)
}

crearTablas()
module.exports = { db , registrarUsuario, obtenerUsuario, obtenerUsuarioPorId, crearRoom, obtenerRoomPorId, obtenerRooms, unirseARoom, guardarMensaje, obtenerMensajesPorRoom}