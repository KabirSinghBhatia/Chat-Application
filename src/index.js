const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const Filter = require("bad-words");
const siofu = require("socketio-file-upload");
const crypto = require("crypto");
const sharp = require("sharp");
const fs = require("fs");

const { generateMessage, generateLocationMessage } = require("./utils/message");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
const { addFile } = require("./utils/images");

const app = express();
app.use(siofu.router);

const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e8,
});

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");
const imagesDirPath = path.join(publicDirPath, "/images");

try {
  if (!fs.existsSync(imagesDirPath)) fs.mkdirSync(imagesDirPath);

  fs.readdir(imagesDirPath, (err, files) => {
    for (const file of files) {
      console.log(file + " : File Deleted Successfully.");

      fs.unlinkSync(imagesDirPath + "/" + file);
    }
  });
} catch (err) {
  console.error(err);
}

app.use(express.json());
app.use(express.static(publicDirPath));
app.use("/images", express.static("images"));

app.get("/", (req, res) => {
  res.render("index.html");
});

io.on("connection", (socket) => {
  console.log("New websocket connection");
  let reg = new RegExp(/[^\s]+(.*?).(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);
  let uploader = new siofu();
  uploader.dir = imagesDirPath;

  uploader.on("start", function (event) {
    if (!reg.test(event.file.name) || !event.file.success) {
      uploader.abort(event.file.id, socket);
      console.log("stopped");
    }
    const user = getUser(socket.id);
    const fileId = crypto.randomBytes(16).toString("hex");
    event.file.userId = user;
    event.file.name = fileId;
    sharp(path.join(imagesDirPath, event.file.name)).resize(100, 100);
    console.log(event);
  });

  uploader.listen(socket);

  uploader.on("saved", (options) => {
    const user = getUser(socket.id);
    console.log(user);
    addFile(options);
    io.to(user.room).emit(
      "file_saved",
      generateLocationMessage(user.username, `/images/${options.file.name}`)
    );

    console.log(options);
  });

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) return callback(error);

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has entered the chat!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (client_input, callback) => {
    const user = getUser(socket.id);
    if (!user) return callback("User error");

    if (!client_input) return callback("Empty message");

    const filter = new Filter();

    if (filter.isProfane(client_input)) {
      return callback("Profanity is not allowed");
    }

    io.to(user.room).emit(
      "message",
      generateMessage(user.username, client_input)
    );
    callback();
  });

  socket.on("sendLocation", ({ longitude, latitude }, callback) => {
    const user = getUser(socket.id);
    if (!user) return callback("User error");
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );
    callback();
  });

  // socket.on("upload", (file, callback) => {
  //   console.log(file);

  //   writeFile("./tmp/x.png", file, (err) => {
  //     callback({ message: err ? "failure" : "success" });
  //   });
  // });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("listening on port " + port);
});
