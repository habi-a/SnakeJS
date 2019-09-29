class Snake {
  constructor(tile_size, speed) {
    this.x = [0];
    this.y = [0];
    this.dx = [speed];
    this.dy = [0];
    this.tile_size = tile_size;
  }
 
  updateDirection(direction, speed) {
    if (this.dx[0]) {
      switch(direction) {
        case 'up':
          this.dy[0] = -speed;
          this.dx[0] = 0;
          break;
        case 'down':
          this.dy[0] = speed;
          this.dx[0] = 0;
          break;
      }
    }
    if (this.dy[0]) {
      switch(direction) {
        case 'right':
          this.dx[0] = speed;
          this.dy[0] = 0;
          break;
        case 'left':
          this.dx[0] = -speed;
          this.dy[0] = 0;
          break;
      }
    }
  }

  draw (context) {
    for (var i = 0; i < this.x.length; i++) {
      context.beginPath();
      context.rect(this.x[i], this.y[i], this.tile_size, this.tile_size);
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
      this.x.push(lastX - (Math.sign(lastDX) * this.tile_size));
      this.y.push(lastY - (Math.sign(lastDY) * this.tile_size));
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
    if (x < 0 || x + this.tile_size > width || y < 0 || y + this.tile_size > height)
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

class Fruit {
  constructor(width, height, tile_size) {
    this.x = 0;
    this.y = 0;
    this.tile_size = tile_size
    this.width = width / this.tile_size;
    this.height = height / this.tile_size;
  }
  
  spawn(posX, posY) {
      // Init arrays of the maps
      var cells = [];
      var free_cells = [];
      for (var i = 0; i < this.height; i++) {
        cells[i] = Array(this.width).fill(0);
      }

      // Find snake body
      for (var i = 0; i < posX.length; i++) {
        var x = Math.floor(posX[i] / this.tile_size);
        var y = Math.floor(posY[i] / this.tile_size);
        cells[y][x] = 1;
      }

      // Push free_cells cells into a new array
      for (var i = 0; i < this.height; i++) {
        for (var j = 0; j < this.width; j++) {
          if (!cells[i][j])
            free_cells.push([i, j]);
        }
      }

      // choose a random pos throught the free_cells array
      var foodPos = Math.floor(Math.random() * free_cells.length);
      this.x = free_cells[foodPos][1] * this.tile_size;
      this.y = free_cells[foodPos][0] * this.tile_size;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x + 5, this.y + 5, 5, 0, Math.PI * 2);
    context.fillStyle = '#EDE916';
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
  var score_text  = document.getElementById('score');
  var level_text  = document.getElementById('level');
  var anim        = 0;
  var game_on     = 0;
  var score       = 0;
  var level       = 1;
  var init_speed  = 1;
  var tile_size   = 10;
  var direction   = '';
  var new_game    = true;
  var speed       = init_speed;
  var win         = new Event('win');
  var game_over   = new Event('game_over');
  var snake       = new Snake(tile_size, init_speed);
  var fruit       = new Fruit(canvas.width, canvas.height, tile_size);

  document.addEventListener('keydown', game, false);
  document.addEventListener('win', win, false);
  document.addEventListener('game_over', gameOver, false);


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

  function game(e) {
    if (e.keyCode === 32) {
      if (!game_on) {
        msg.innerHTML = 'Go!';
        game_on = 1;
        document.addEventListener('keydown', getInputDirection, false);
        fruit.spawn(snake.x, snake.y);
        anim = window.requestAnimationFrame(play);      
      }
    }
  }

  function play() {
    new_game = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if ((snake.x[0] % tile_size === 0) && (snake.y[0] % tile_size === 0)) {
      snake.update();
      snake.updateDirection(direction, speed);
    }
    snake.move();
    if (snake.isEating(fruit.x, fruit.y)) {
      fruit.spawn(snake.x, snake.y);
      snake.grow(1);
      score += 1;
    }

    fruit.draw(context);
    snake.draw(context);

    if (score >= 50)
      document.dispatchEvent(win);
    else if (snake.collides(canvas.width, canvas.height))
      document.dispatchEvent(game_over);
    else
      anim = window.requestAnimationFrame(play);

    level_text.innerText = '' + level;
    score_text.innerText = '' + score;
  }

  function win(e) {
    if (game_on) {
      msg.innerHTML = 'You win! Press <em>Space</em> to start a new game';
      resetGame();
    }
  }

  function gameOver(e) {
    if (game_on) {
      msg.innerHTML = 'Game Over! Press <em>Space</em> to start a new game';
      resetGame();
    }
  }

  function resetGame() {
    window.cancelAnimationFrame(anim);
    game_on       = 0;
    score         = 0;
    level         = 1;
    new_game      = true;
    speed         = init_speed
    direction     = ''
    snake.reset(init_speed);
    fruit.reset();
  }
})()
