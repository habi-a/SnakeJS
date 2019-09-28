class Snake {
  constructor(speed) {
    this.x = [0];
    this.y = [0];
    this.dx = [speed];
    this.dy = [0];
  }
 
  changeDir(nextDir, speed) {
    if (this.dx[0] && nextDir === 'up') {
      this.dx[0] = 0;
      this.dy[0] = -speed;
    }
    if (this.dx[0] && nextDir === 'down') {
      this.dx[0] = 0;
      this.dy[0] = speed;
    }
    if (this.dy[0] && nextDir === 'right') {
      this.dx[0] = speed;
      this.dy[0] = 0;
    }
    if (this.dy[0] && nextDir === 'left') {
      this.dx[0] = -speed;
      this.dy[0] = 0;
    }
  }

  draw (context) {
    for (var i = 0; i < this.x.length; i++) {
      context.beginPath();
      context.rect(this.x[i], this.y[i], 10, 10);
      context.fillStyle = '#2B823A';
      context.strokeStyle = '#012E34';
      context.fill();
      context.stroke();
      context.closePath();
    }
  }

  update() {
    this.dx = Snake.unshiftAndCut(this.dx);
    this.dy = Snake.unshiftAndCut(this.dy);
  }

  grow(iteration) {
    for (var i = 0; i < iteration; i++) {
      var lastX = this.x[this.x.length - 1];
      var lastY = this.y[this.y.length - 1];
      var lastDX = this.dx[this.dx.length - 1]
      var lastDY = this.dy[this.dy.length - 1]
      this.x.push(lastX - (Math.sign(lastDX) * 10));
      this.y.push(lastY - (Math.sign(lastDY) * 10));
      this.dx.push(lastDX);
      this.dy.push(lastDY);
    }
  }

  isEating(foodX, foodY) {
    return this.x[0] === foodX && this.y[0] === foodY;
  }

  move() {
    for (var i = 0; i < this.x.length; i++) {
      this.x[i] += this.dx[i];
      this.y[i] += this.dy[i];
    }
  }

  collides(width, height) {
    var x = this.x[0], y = this.y[0];
    // Check collision with the wall
    if (x < 0 || x + 10 > width || y < 0 || y + 10 > height)
      return true;
    // Check collision with itself
    for (var i = 1; i < this.x.length; i++) {
      if (x === this.x[i] && y === this.y[i])
        return true;
    }
    return false;
  }

  reset(speed) {
    this.x = [0];
    this.y = [0];
    this.dx = [speed];
    this.dy = [0];
  }

  static unshiftAndCut(arr) {
    var result = arr.slice();
    return result.map(function(el, i) {
      if (!i)
        return arr[0];
      return arr[i - 1];
    });
  }
}

class Food {
  constructor(width, height, color) {
    this.x = 0;
    this.y = 0;
    this.color = color;
  }
  
  spawn(posX, posY) {
      var matrix = [];
      var free = [];
      for (var i = 0; i < 20; i++) {
        matrix[i] = Array(20).fill(0);
      }
      for (var i = 0; i < posX.length; i++) {
        var x = Math.floor(posX[i] / 10);
        var y = Math.floor(posY[i] / 10);
        matrix[y][x] = 1;
      }
      for (var i = 0; i < 20; i++) {
        for (var j = 0; j < 20; j++) {
          if (!matrix[i][j])
            free.push([i, j]);
        }
      }
      var foodPos = Math.floor(Math.random() * free.length);
      this.x = free[foodPos][1] * 10;
      this.y = free[foodPos][0] * 10;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x + 5, this.y + 5, 5, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
  }

  reset() {
    this.x = 0;
    this.y = 0;
  }
}

(function() {
  var canvas      = document.getElementById('myCanvas');
  var context     = canvas.getContext('2d');
  var msg         = document.getElementById('msg');
  var actualScore = document.getElementById('actual-score');
  var levelScore  = document.getElementById('level');
  var anim        = 0;
  var new_game    = true;
  var game_on     = 0;
  var score       = 0;
  var level       = 1;
  var init_speed  = 2;
  var speed       = 2;
  var nextDir     = '';
  var endGame     = new Event('endGame');
  var snake       = new Snake(init_speed);
  var food        = new Food(canvas.width, canvas.height, "#EDE916");

  document.addEventListener('endGame', resetGame, false);
  document.addEventListener('keydown', game, false);


  function getInputDirection(e) {
    if (!new_game) {
      switch (e.keyCode) {
        case 40:
          nextDir = 'down';
          break;
        case 39:
          nextDir = 'right';
          break;
        case 38:
          nextDir = 'up';
          break;
        case 37:
          nextDir = 'left';
          break;
        default:
      }
    }
  }

  function game(e) {
    if (e.keyCode === 32) {
      if (!game_on) {
        msg.innerHTML = 'Go!';
        game_on = 1;
        document.addEventListener('keydown', getInputDirection, false);
        food.spawn(snake.x, snake.y);
        anim = window.requestAnimationFrame(play);      
      }
    }
  }

  function play() {
    new_game = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if ((snake.x[0] % 10 === 0) && (snake.y[0] % 10 === 0)) {
      snake.update();
      snake.changeDir(nextDir, speed);
    }
    snake.move();
    if (snake.isEating(food.x, food.y)) {
      food.spawn(snake.x, snake.y);
      snake.grow(1);
      score += 1;
    }

    food.draw(context);
    snake.draw(context);

    if (snake.collides(canvas.width, canvas.height)) {
      document.dispatchEvent(endGame);
    } else {
      anim = window.requestAnimationFrame(play);
    }
    levelScore.innerText  = '' + level;
    actualScore.innerText = '' + score;
  }

  function resetGame() {
    window.cancelAnimationFrame(anim);
    game_on        = 0;
    score         = 0;
    level         = 1;
    new_game      = true;
    speed         = init_speed
    nextDir       = ''
    msg.innerHTML = 'Game Over! Press <em>Space</em> to start a new game';
    snake.reset(init_speed);
    food.reset();
  }
})()
