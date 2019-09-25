(function() {
  var canvas      = document.getElementById("myCanvas");
  var msg         = document.getElementById('msg');
  var actualScore = document.getElementById('actual-score');
  var ctx         = canvas.getContext("2d");
  var gameOn      = 0;
  var level       = 0
  var speed       = 2;
  var endGame     = new Event('endGame');
  var score       = 0;
  var anim;

  document.addEventListener('endGame', function endGameHandler(e) {
    msg.innerHTML = 'Game Over! Press <em>Space</em> to start a new game'
    gameOn = 0;
    window.cancelAnimationFrame(anim);
    score = 0;
  }, false);

  document.addEventListener("keydown", function spaceHandler(e) {
    if (e.keyCode === 32) {
      e.preventDefault();
      if (!gameOn) {
        msg.innerHTML = 'Go!'
        gameOn = 1;
        game();
      }
    }
  }, false);

  function game() {
    var snake = createSnake(speed);
    var food = createFood(canvas.width, canvas.height, "#EDE916");
    var candy = createCandy(canvas.width, canvas.height)
    var nextDir = '';
    var fps = 0;

    document.addEventListener('keydown', getInputDirection, false);

    function getInputDirection(e) {
      switch (e.keyCode) {
        case 40:
          e.preventDefault();
          nextDir = 'down';
          break;
        case 39:
          e.preventDefault();
          nextDir = 'right';
          break;
        case 38:
          e.preventDefault();
          nextDir = 'up';
          break;
        case 37:
          e.preventDefault();
          nextDir = 'left';
          break;
        default:
      }
    }

    function play() {
      fps++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if ((snake.x[0] % 10 === 0) && (snake.y[0] % 10 === 0)) {
        snake.update();
        snake.changeDir(nextDir);
      }
      snake.move();
      if (snake.isEating(food.x, food.y)) {
        food.spawn(snake.x, snake.y);
        snake.grow();
        if (snake.x.length % 7 === 0) {
          candy.active = true;
          candy.spawn(snake.x, snake.y);
          setTimeout(function() {
            candy.active = false;
          }, 3000);
        }
        score += 1;
      }

      if (candy.active && snake.isEating(candy.x, candy.y)) {
        candy.active = false;
        snake.grow();
        snake.grow();
        snake.grow();
        score += 3;
      }
      if (candy.active) candy.draw(ctx);
      food.draw(ctx);
      snake.draw(ctx);

      if (snake.collides(canvas.width, canvas.height)) {
        document.dispatchEvent(endGame);
      } else {
        anim = window.requestAnimationFrame(play);
      }
      actualScore.innerText = '' + score;
    }

    food.spawn(snake.x, snake.y);
    anim = window.requestAnimationFrame(play);
  }

  function createCandy(width, height) {
    var _candy = createFood(width, height, "#ED0916");
    _candy.active = false;
    return _candy;
  }

  function createFood(width, height, color) {
    return {
      x: 0,
      y: 0,
      // spawn the food in a random free space
      spawn: function(posX, posY) {
        var matrix = [],
          free = [],
          x, y, foodPos, i, len;
        for (i = 0; i < 20; i++) {
          matrix[i] = Array(20).fill(0);
        }
        for (i = 0, len = posX.length; i < len; i++) {
          x = Math.floor(posX[i] / 10);
          y = Math.floor(posY[i] / 10);
          matrix[y][x] = 1;
        }

        for (i = 0; i < 20; i++) {
          for (var j = 0; j < 20; j++) {
            if (!matrix[i][j])
              free.push([i, j]);
          }
        }

        foodPos = Math.floor(Math.random() * free.length);
        this.x = free[foodPos][1] * 10;
        this.y = free[foodPos][0] * 10;
      },
      draw: function(ctx) {
        ctx.beginPath();
        ctx.arc(this.x + 5, this.y + 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
      }
    }
  }

  function createSnake(speed) {
    function unshiftAndCut(arr) {
      var result = arr.slice();
      return result.map(function(el, i) {
        if (!i)
          return arr[0];
        return arr[i - 1];
      });
    }

    return {
      x: [0],
      y: [0],
      dx: [speed],
      dy: [0],
      changeDir: function(nextDir) {
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
      },
      draw: function(ctx) {
        for (var i = 0, len = this.x.length; i < len; i++) {
          ctx.beginPath();
          ctx.rect(this.x[i], this.y[i], 10, 10);
          ctx.fillStyle = '#2B823A';
          ctx.strokeStyle = '#012E34';
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        }
      },
      update: function() {
        this.dx = unshiftAndCut(this.dx);
        this.dy = unshiftAndCut(this.dy);
      },
      grow: function() {
        var lastX = this.x[this.x.length - 1];
        var lastY = this.y[this.y.length - 1];
        var lastDX = this.dx[this.dx.length - 1]
        var lastDY = this.dy[this.dy.length - 1]
        this.x.push(lastX - (Math.sign(lastDX) * 10));
        this.y.push(lastY - (Math.sign(lastDY) * 10));
        this.dx.push(lastDX);
        this.dy.push(lastDY);
      },
      isEating: function(foodX, foodY) {
        return this.x[0] === foodX && this.y[0] === foodY;
      },
      move: function() {
        for (var i = 0, len = this.x.length; i < len; i++) {
          this.x[i] += this.dx[i];
          this.y[i] += this.dy[i];
        }
      },
      collides: function(width, height) {
        var x = this.x[0],
          y = this.y[0];
        // Check collision with the wall
        if (x < 0 || x + 10 > width || y < 0 || y + 10 > height)
          return true;
        // Check collision with itself
        for (var i = 1, len = this.x.length; i < len; i++) {
          if (x === this.x[i] && y === this.y[i])
            return true;
        }
        return false;
      }
    }
  }
})()
