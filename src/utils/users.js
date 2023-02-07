const users = [];

const addUser = ({ id, username, room }) => {
  // Clean data
  username = username.trim();
  room = room.trim();

  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  // Check for existing users
  const existingUser = users.find((user) => {
    return user.username === username;
  });

  // Validate Username

  if (existingUser) {
    return {
      error: "Username already in use",
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

// addUser({ id: 22, username: "Kabir", room: "USA" });
// const res = addUser({ id: 33, username: " Kabir", room: "JFK " });

// console.log(users);
// const removedUser = removeUser(33);
// console.log(res);
// console.log(users);
// console.log(removedUser);

// console.log(getUser(33));
// console.log(getUsersInRoom("USA"));
module.exports = { addUser, removeUser, getUser, getUsersInRoom };
