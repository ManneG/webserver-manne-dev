const elements = (ids => {
  let obj = {};
  ids.forEach(element => obj[element] = document.getElementById(element));
  return obj;
})([
  "name",
  "opponent",
  "points",
  "cooperate",
  "defect",
])

const socket = new WebSocket("ws://manne.dev/game");

socket.addEventListener("open", (event) => {
  elements.cooperate.onclick = () => socket.send("cooperate");
  elements.defect.onclick = () => socket.send("defect");
});

socket.addEventListener("message", (event) =>{
  console.log(event);
  let msg = JSON.parse(event.data)
  switch (msg.type) {
    case "joined":
      elements.name.textContent = msg.name;
      elements.opponent.textContent = msg.opponent ?? '';
      break;
    case "points":
      elements.points.textContent = msg.points;
      break;
    case "waiting":
      elements.opponent.textContent = '';
      break;
  
    default:
      break;
  }
});

socket.addEventListener("close", (event) => {
  console.log("Server closed. ", event);
});

socket.addEventListener("error", (event) => {
  console.log("Could not connect to server. ", event)
})
