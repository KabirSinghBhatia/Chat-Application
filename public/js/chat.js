const socket = io();
const uploader = new SocketIOFileUpload(socket);
uploader.maxFileSize = 5242880;
uploader.listenOnInput(document.getElementById("siofu_input"));

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $sendFileInput = document.querySelector("#siofu_input");
const $messages = document.querySelector("#messages");
const $locations = document.querySelector("#locations");
const $sidebar = document.querySelector("#sidebar");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
const imageTemplate = document.querySelector("#image-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", ({ username, locationURL, createdAt }) => {
  console.log(username);
  const html = Mustache.render(locationTemplate, {
    username,
    locationURL,
    createdAt: moment(createdAt).format("h:mm a"),
  });

  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");

  let client_input = e.target.elements.message.value;

  socket.emit("sendMessage", client_input, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("The message has been delivered.");
  });
});

$sendLocationButton.addEventListener("click", (e) => {
  if (!navigator.geolocation)
    return alert("Geolocation API is not supported in your browser.");

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      socket.emit(
        "sendLocation",
        {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        },
        () => {
          console.log("Location shared!");
          $sendLocationButton.removeAttribute("disabled");
        }
      );
    },
    (err) => {
      alert("Geolocation API is not supported in your browser.");
    }
  );
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("file_saved", ({ userName, locationURL, createdAt }) => {
  const html = Mustache.render(imageTemplate, {
    username,
    image_path: locationURL,
    createdAt: moment(createdAt).format("h:mm a"),
  });

  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

// socket.on("siofu_complete", (options) => {
//   console.log(options);
// });

// socket.on("countUpdated", (count) => {
//   console.log("The count has been updated! " + count);
// });

// incrementButton.addEventListener("click", () => {
//   console.log("Clicked");
//   socket.emit("increment");
// });
