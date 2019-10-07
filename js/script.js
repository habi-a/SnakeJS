class Snake {
  constructor(width, height, tile_size, speed) {
    this.x          = [0];
    this.y          = [0];
    this.velocity_y = [0];
    this.velocity_x = [speed];
    this.tile_size  = tile_size;
    this.width      = width / this.tile_size;
    this.height     = height / this.tile_size;
  }

  getSize() {
    return this.x.length;
  }

  updateDirection(direction, speed) {
    if (this.velocity_x[0]) {
      switch(direction) {
        case 'up':
          this.velocity_y[0] = -speed;
          this.velocity_x[0] = 0;
          break;
        case 'down':
          this.velocity_y[0] = speed;
          this.velocity_x[0] = 0;
          break;
      }
    }
    if (this.velocity_y[0]) {
      switch(direction) {
        case 'right':
          this.velocity_x[0] = speed;
          this.velocity_y[0] = 0;
          break;
        case 'left':
          this.velocity_x[0] = -speed;
          this.velocity_y[0] = 0;
          break;
      }
    }
  }

  draw(context) {
    for (var i = 0; i < this.x.length; i++) {
      context.beginPath();
      context.rect(this.x[i], this.y[i], this.tile_size, this.tile_size);
      context.fillStyle   = '#008000';
      context.strokeStyle = '#000000';
      context.fill();
      context.stroke();
      context.closePath();
    }
  }

  updateVelocity() {
    this.velocity_x = Snake.unshift(this.velocity_x);
    this.velocity_y = Snake.unshift(this.velocity_y);
  }

  pushBody(iteration) {
    for (var i = 0; i < iteration; i++) {
      const lastDX  = this.velocity_x[this.velocity_x.length - 1]
      const lastDY  = this.velocity_y[this.velocity_y.length - 1]
      this.x.push(this.x[this.x.length - 1] - (Math.sign(lastDX) * this.tile_size));
      this.y.push(this.y[this.y.length - 1] - (Math.sign(lastDY) * this.tile_size));
      this.velocity_x.push(lastDX);
      this.velocity_y.push(lastDY);
    }
  }

  isEatingFruit(foodX, foodY) {
    return this.x[0] == foodX && this.y[0] == foodY;
  }

  isOnWall() {
    if (this.x[0] < 0)
      return true;
    if (this.x[0] + this.tile_size > this.width * this.tile_size)
      return true;
    if (this.y[0] < 0)
      return true;
    if (this.y[0] + this.tile_size > this.height * this.tile_size)
      return true;
    return false;
  }

  isEatingItself() {
    for (var i = 1; i < this.x.length; i++)
      if (this.x[0] == this.x[i] && this.y[0] == this.y[i])
        return true;
    return false;
  }

  move() {
    for (var i = 0; i < this.x.length; i++) {
      this.x[i] += this.velocity_x[i];
      this.y[i] += this.velocity_y[i];
    }
  }

  reset(speed) {
    this.x          = [0];
    this.y          = [0];
    this.velocity_y = [0];
    this.velocity_x = [speed];
  }

  static unshift(arr) {
    var result = arr.slice();
    return result.map(function(el, i) {
      if (!i)
        return arr[0];
      return arr[i - 1];
    });
  }
}

class Fruit {
  constructor(width, height, tile_size) {
    this.x          = 0;
    this.y          = 0;
    this.tile_size  = tile_size;
    this.width      = width / this.tile_size;
    this.height     = height / this.tile_size;
  }

  generatePos(posX, posY) {
    var pos_taken = false;
    this.x = Fruit.getRandomInt(this.width);
    this.y = Fruit.getRandomInt(this.height);
    for (var i = 0; i < posX.length; i++) {
      var x = Math.floor(posX[i] / this.tile_size);
      var y = Math.floor(posY[i] / this.tile_size);
      if (x == this.x && y == this.y)
        pos_taken = true;
    }
    if (pos_taken)
      this.generatePos(posX, posY);
    else {
      this.x *= this.tile_size;
      this.y *= this.tile_size;
    }
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x + this.tile_size / 2, this.y + this.tile_size / 2, this.tile_size / 2, 0, Math.PI * 2);
    context.fillStyle = '#582900';
    context.fill();
    context.closePath();
  }

  reset() {
    this.x = 0;
    this.y = 0;
  }

  static getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}

function canvaSnake() {
  // Time variables
  var time_left = "03:00";
  document.getElementById("timer").innerText = time_left;
  var timer = document.getElementById("timer").innerText;
  var arr = timer.split(":");
  var min = arr[0];
  var sec = arr[1];

  // HTML Variables
  var canvas      = document.getElementById('GameCanvas');
  var context     = canvas.getContext('2d');
  var message     = document.getElementById('message');
  var score_text  = document.getElementById('score');
  var level_text  = document.getElementById('level');

  // Game variables
  var anim_id     = 0;
  var score       = 0;
  var level       = 1;
  var init_speed  = 1;
  var tile_size   = 6;
  var direction   = '';
  var playing     = false;
  var new_game    = true;
  var speed       = init_speed;
  var snake       = new Snake(canvas.width, canvas.height, tile_size, init_speed);
  var fruit       = new Fruit(canvas.width, canvas.height, tile_size);

  // Events
  var gamepad     = navigator.getGamepads()[0];
  var game_win    = new Event('game_win');
  var game_over   = new Event('game_over');
  var time_over   = new Event('time_over');
  document.addEventListener('keydown', gameStart, false);
  window.addEventListener("gamepadconnected", gameStartGamepad, false);
  document.addEventListener('game_win', gameWin, false);
  document.addEventListener('game_over', gameOver, false);
  document.addEventListener('time_over', timeOver, false);

  function startTimer() {
    if (!playing)
      return;
    var timer = document.getElementById("timer").innerText;
    var arr = timer.split(":");
    var min = arr[0];
    var sec = arr[1];

    if (sec == 0) {
      if (min == 0) {
        document.dispatchEvent(time_over);
        return;
      }
      min--;
      if (min < 10)
        min = "0" + min;
      sec = 59;
    }
    else
      sec--;
    if (sec < 10)
      sec = "0" + sec;

    document.getElementById("timer").innerText = min + ":" + sec;
    setTimeout(startTimer,1000);
  }

  // Handling inputs player
  function getInputDirection(e) {
    if (!new_game) {
      switch (e.keyCode) {
        case 40:
          direction = 'down';
          break;
        case 39:
          direction = 'right';
          break;
        case 38:
          direction = 'up';
          break;
        case 37:
          direction = 'left';
          break;
        default:
      }
    }
  }

  function getJoystickDirection(buttons) {
    if (!new_game) {
      if (buttons[15].pressed) {
        direction = 'right';
        console.log(buttons[15], "pressed");
      }
      else if (buttons[12].pressed) {
        direction = 'up';
        console.log(buttons[12], "pressed");
      }
      else if (buttons[14].pressed) {
        direction = 'left'
        console.log(buttons[14], "pressed");
      }
      else if (buttons[13].pressed) {
        direction = 'down';
        console.log(buttons[13], "pressed");
      }
    }
  }

  // Event start game
  function gameStart(e) {
    if (e.keyCode == 32) {
      if (!playing) {
        document.getElementById("timer").innerText = time_left;
        timer   = document.getElementById("timer").innerText;
        arr     = timer.split(":");
        min     = arr[0];
        sec     = arr[1];
        playing = true;
        gamepad = navigator.getGamepads()[0];
        startTimer();
        message.innerText = 'Go!';
        document.addEventListener('keydown', getInputDirection, false);
        fruit.generatePos(snake.x, snake.y);
        anim_id = window.requestAnimationFrame(play);
      }
    }
  }

  function gameStartGamepad(e) {
    if (!playing) {
      document.getElementById("timer").innerText = time_left;
      timer   = document.getElementById("timer").innerText;
      arr     = timer.split(":");
      min     = arr[0];
      sec     = arr[1];
      playing = true;
      gamepad = navigator.getGamepads()[0];
      startTimer();
      message.innerText = 'Go!';
      document.addEventListener('keydown', getInputDirection, false);
      fruit.generatePos(snake.x, snake.y);
      anim_id = window.requestAnimationFrame(play);
    }
  }

  // Main Loop
  function play() {
    if (gamepad)
        getJoystickDirection(gamepad.buttons);
    new_game = false;
    context.clearRect(0, 0, canvas.width, canvas.height);

    if ((snake.x[0] % tile_size == 0) && (snake.y[0] % tile_size == 0)) {
      snake.updateVelocity();
      snake.updateDirection(direction, speed);
    }

    snake.move();

    if (snake.isEatingFruit(fruit.x, fruit.y)) {
      snake.pushBody(1);
      fruit.generatePos(snake.x, snake.y);
      score += 1;
      if (score > 9 && level == 1)
        upLevel();
    }

    fruit.draw(context);
    snake.draw(context);
    level_text.innerText = '' + level;
    score_text.innerText = '' + score;

    if (score >= 20)
      document.dispatchEvent(game_win);
    else if (snake.isOnWall() || snake.isEatingItself())
      document.dispatchEvent(game_over);
    else
      anim_id = window.requestAnimationFrame(play);
  }

  // Increase difficulty of the game
  function upLevel() {
    level++;
    speed++;
    new_game    = true;
    direction   = '';
    snake_size  = snake.getSize();
    snake.reset(speed);
    fruit.reset();
    snake.pushBody(snake_size - 1);
    fruit.generatePos(snake.x, snake.y);
  }

  // Event game win
  function gameWin(e) {
    if (playing) {
      message.innerHTML = 'You win! Press <em>Space</em> to start a new game';
      resetGame();
    }
  }

  // Event game over
  function gameOver(e) {
    if (playing) {
      message.innerHTML = 'Game Over! Press <em>Space</em> to start a new game';
      resetGame();
    }
  }

  // Event game over
  function timeOver(e) {
    if (playing) {
      message.innerHTML = 'Time is Over! Press <em>Space</em> to start a new game';
      resetGame();
    }
  }

  // Reset params to restart the game
  function resetGame() {
    window.cancelAnimationFrame(anim_id);
    playing   = false;
    score     = 0;
    level     = 1;
    new_game  = true;
    speed     = init_speed
    direction = ''
    snake.reset(init_speed);
    fruit.reset();
  }
}

// BONUS
/*function GamePad(){
  if (buttons[13].pressed) {
    bx+=mov;
    bola.style.top = bx+"px";
    console.log(buttons[15], "pressed");
  }
  if (buttons[12].pressed) {
    bx-=mov;
    bola.style.top = bx+"px";
    console.log(buttons[14], "pressed");
  }
  if (buttons[15].pressed) {
    by+=mov;
    bola.style.left = by+"px";
    console.log(buttons[12], "pressed");
  }
  if (buttons[14].pressed) {
    by-=mov;
    bola.style.left = by+"px";
    console.log(buttons[13], "pressed");
  }
}*/
