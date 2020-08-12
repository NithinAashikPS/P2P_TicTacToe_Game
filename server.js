const http = require("http");
const app = require("./app");

const port = process.env.PORT || 3333;

const server = http.createServer(app);


const io = require("socket.io")(server);

let waiting_players = [];
let connected_players = [];

let player = {};


io.on("connection", (socket) => {

    console.log("Connected USER ID : ", socket.id);

    socket.on("init", async (data) => {

        if (waiting_players.length > 0) {

            player["socket"] = socket.id;
            player["you"] = "x";
            player["opp"] = "o";
            console.log("PLAYER_1 " + player);
            waiting_players[waiting_players.length-1].emit("opponent", player);

            player["socket"] =  waiting_players[waiting_players.length-1].id;
            player["you"] = "o";
            player["opp"] = "x";
            console.log("PLAYER_2 " + player.socket);
            socket.emit("opponent", player);

            connected_players.push(socket);
            connected_players.push(waiting_players[waiting_players.length-1]);
            waiting_players.pop();

        } else {
            waiting_players.push(socket);
        }

    });

    socket.on("play", async (data) => {
        io.sockets.connected[data.socket].emit("set",data);
    });

    socket.on("set_win", async (data) => {
        io.sockets.connected[data.socket].emit("win", data);
    });

});


server.listen(port);