const options = { /* ... */ };
const io = require('socket.io')(options);
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

io.on('connection', socket => {
    console.log('user arrived')
    socket.on('join', (message)=>{
        socket.join(message, ()=>{
            console.log(`user joined room ${message}`);
        });
    });
    socket.on('message', (message)=>{
        try{
            console.log(message);
            if(message.type === 'transaction') {
                socket.emit(message.id, message.status);
            }
        }catch (e) {
            console.log(e);
        }
    })
});

io.listen(process.env.SOCKET_PORT);
