class Player{
  constructor(socket, name){
    this.socket = socket;
    this.name = name;
    this.points = 0;
    this.games = 0;
    this.choice = "";
  }

  givePoints(opponentsMove){
    if(this.choice == "cooperate") this.points -= 1;
    if(opponentsMove == "cooperate") this.points += 3;

    this.socket.send(JSON.stringify({
      type: "points",
      points: this.points,
      opponentsMove
    }))
  }
}

class Match{
  constructor(p1, p2){
    this.length = 10 + Math.floor(5 * Math.random());
    this.choices = ["cooperate", "defect"];
    
    this.onjoin(p1, p2)
    p1.socket.onmessage = (event) => this.playeraction(p1, p2, event);
    this.onjoin(p2, p1);
    p2.socket.onmessage = (event) => this.playeraction(p2, p1, event);
  }

  onjoin(player, other){
    if(player.socket.readyState == 1){
      player.socket.send(JSON.stringify({type:"joined", name: player.name, opponent: other.name}));
    } else player.socket.onopen = () => player.socket.send(JSON.stringify({type:"joined", name: player.name, opponent: other.name}));
  }

  playeraction(player, other, event){
    const msg = event.data;
    if(player.choice != "" || !this.choices.includes(msg)) return;
    player.choice = msg;
    if(other.choice == "") return;
    other.givePoints(player.choice)
    player.givePoints(other.choice)
    other.choice = "";
    player.choice = "";
    this.length -= 1;
    if(this.length > 0) return;

    player.socket.onmessage = undefined;
    other.socket.onmessage = undefined;

    player.socket.send(JSON.stringify({type: "waiting"}));
    other.socket.send(JSON.stringify({type: "waiting"}));
    console.log("Match ended");

    if(playersWaiting.length > 0){
      new Match(
        player,
        playersWaiting.pop()
      )
      if(playersWaiting.length > 0){
        new Match(
          other,
          playersWaiting.pop()
        )
      } else playersWaiting.push(other);
    } else {
      playersWaiting.push(player);
      playersWaiting.push(other);
    }

  }
}

const genName = () => {
  let adjectives = ["Amazing", "Awesome", "Beautiful", "Bright", "Cool", "Charismatic", "Dangerous", "Distant", "Ephimeral", "Extatic", "Fun", "Fantastic", "Great", "Generous", "Handsome", "Hasty", "Incredible", "Insane"];
  let nouns = ["Lad", "Puffin", "Ghost", "Banana", "Soup", "Knight", "Vampire", "Cyborg", "Pickle"];

  return adjectives[Math.floor(Math.random()*adjectives.length)] + " " + nouns[Math.floor(Math.random()*nouns.length)];
};

let playersWaiting = [];

const join = (socket) => {
  let name = genName();
  console.log(name + " joined");
  if(playersWaiting.length == 0){
    let player = new Player(socket, name);
    if(player.socket.readyState == 1){
      player.socket.send(JSON.stringify({type:"joined", name: player.name}));
    } else player.socket.onopen = () => player.socket.send(JSON.stringify({type:"joined", name: player.name}));
    playersWaiting.push(player);
  } else {
    new Match(
      new Player(socket, name),
      playersWaiting.pop()
    )
    console.log("Match created")
  }
};

module.exports = { join }