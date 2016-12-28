// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
  var names = {};

  var check = function (name) {
    if (!name || names[name]) {
      console.log(name,"name in use")
      return false;
    } else {
      console.log(name, "name not in use")
      names[name] = true;
      return true;
    }
  };

// find the lowest unused "MC" number and check it
  var getGuestName = function () {
    var name,
      nextUserId = 1;
    do {
      name = 'MC ' + nextUserId;
      nextUserId += 1;
    } while (!check(name));
    return name;
  };

//put name in array
  var get = function () {
    var answer = [];
    for (user in names) {
      answer.push(user);
    }
    return answer;
  };



// export function for listening to the socket
module.exports = function (socket) {
  var name = userNames.getGuestName();

  // send the new user their name and a list of users
  socket.emit('init', {
    name: name,
    users: userNames.get()
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    socket.broadcast.emit('send:message', {
      user: name,
      text: data.text
    });
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      name: name
    });
  });
};
