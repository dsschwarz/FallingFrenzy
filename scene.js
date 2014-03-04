swag = false;
define(["gamejs", "event", "player", "objects"], function(gamejs, _event, _player, _objects) {
  var Director = function() {
    this.onAir = false;
    this.activeScene = null;
    this.sceneStack = [];

    return this;
  };

  Director.prototype.update = function(msDuration) {
    if (!this.onAir) return;

    if (this.activeScene.update) {
      this.activeScene.update(msDuration);
    }
  };

  Director.prototype.draw = function(display) {
    if (!this.onAir) return;
    if (this.activeScene.draw) {
      this.activeScene.draw(display);
    }
  };

  Director.prototype.handle = function(event) {
    if (!this.onAir) return;
    if (this.activeScene.handle) {
      this.activeScene.handle(event);
    } else {
      console.warn("Director handle, no map handle");
    }
  };

  Director.prototype.start = function(scene) {
    this.onAir = true;
    this.replaceScene(scene);
    return;
  };

  Director.prototype.replaceScene = function(scene) {
    this.activeScene = scene;
    this.sceneStack.pop();
    this.sceneStack.push(scene);
  };

  Director.prototype.push = function(scene) {
    this.sceneStack.push(scene);
    this.activeScene = scene;
  };

  Director.prototype.pop = function() {
    this.sceneStack.pop();
    if (this.sceneStack.length >= 1) {
      this.activeScene = this.sceneStack[this.sceneStack.length - 1];
    } else {
      this.activeScene = null;
      console.warn("Warn: No scenes left in stack");
      this.onAir = false;
    }
  };

  Director.prototype.popAll = function () {
    this.sceneStack = [];
    this.activeScene = null;
    this.onAir = false;
  }

  Director.prototype.getScene = function() {
    return this.activeScene;
  };

  function handleCollisions (players, objects) {
    // Check players against objects, remove objects on collision
    _.each(gamejs.sprite.groupCollide(players, objects, false, true, collideCircleRectangle), function (sprites) {
      sprites.b.onCollide(sprites.a);
    });
  }
  function collideCircleRectangle (circleSprite, rectSprite) {
    var radius = circleSprite.radius || Math.max(circleSprite.rect.width, circleSprite.rect.height);
    // Get distance between centers
    var xDist  = Math.abs(circleSprite.rect.left - (rectSprite.rect.left + rectSprite.rect.width/2)); 
    var yDist  = Math.abs(circleSprite.rect.top - (rectSprite.rect.top + rectSprite.rect.height/2)); 

    // If circle is completely out of range of overlapping the rectangle
    if (xDist > rectSprite.rect.width/2 + radius) { return false;}
    if (yDist > rectSprite.rect.height/2 + radius) { return false;}

    // Then, handle cases where circle is close enough to garauntee an overlap
    if (xDist <= (rectSprite.rect.width/2)) { return true; } 
    if (yDist <= (rectSprite.rect.height/2)) { return true; }

    // Final case: circle might overlap corner of rectangle
    var cornerDistance_sq = Math.pow(xDist - rectSprite.rect.width/2, 2) + Math.pow(yDist - rectSprite.rect.height/2, 2); // Distance from circle center to corner

    return (cornerDistance_sq <= (radius^2));
  }
  var GameScene = function () {
    this.players = new gamejs.sprite.Group();
    this.players.add(new _player.Player("#522"));
    this.players.add(new _player.Player("#252"));
    this.players.add(new _player.Player("#225"));
    this.objects = new gamejs.sprite.Group();

    this.nextSpawn = 0;
    this.font = new gamejs.font.Font('20px monospace');

    return this;
  }

  GameScene.prototype.update = function(ms) {
    this.nextSpawn -= ms;
    if (this.nextSpawn <= 0) {
      this.nextSpawn = 1000;
      this.objects.add(new _objects.Fry());
    }
    this.players.update(ms);
    this.objects.update(ms);
    handleCollisions(this.players, this.objects);
  }
  var color = {
    red: 120,
    green: 70,
    blue: 120
  }
  var audio = new Audio('fiddlers_green.mp3');
  var playing = false;
  GameScene.prototype.draw = function(display) {
    display.fill("rgb("+color.red +"," + color.green + "," + color.blue + ")");
    var surface = display.clone();
    this.players.draw(surface);
    this.objects.draw(surface);
    for (var i = 0; i < this.players.sprites().length; i++){
      surface.blit(this.font.render("Points"), [700, 30]);
      surface.blit(this.font.render("Player " + (i + 1) + ": " + this.players.sprites()[i].points, "#000"), [600, 50 + i * 15]);
    }

    if (swag) {
      if (!playing) {
        audio.play();
        playing = true;
      };
      _.each(color, function(value, key){
        color[key] += 20 - Math.random() * 40;
        if (color[key] < 80) {
          color[key] += 5;
        }
        if (color[key] < 20) { color[key] = 20};
        if (color[key] >  256) { color[key] = 256};
        color[key] = Math.floor(color[key]);
      })
      var dest = [10 - Math.random() * 20, 10 - Math.random() * 20];
    } else {
      var dest = [0, 0];
    }

    display.blit(surface, dest);
  }

  GameScene.prototype.handle = function(event) {
    var boundEvent;
    if (event.type === gamejs.event.KEY_DOWN) {
      // Find key binding in JSON
      boundEvent = _event.findKeyEvent(event.key);

    } else if (event.type === gamejs.event.KEY_UP) {
      boundEvent = _event.findKeyEvent(event.key);
    }

    if (!boundEvent) { return; }
    boundEvent.type = event.type;

    // If player exists
    // Send parsed event to player
    var player = this.players.sprites()[boundEvent.player];
    if (player) {
      player.handle(boundEvent);
    }
  }

  return {
    Director: Director,
    GameScene: GameScene
  }

});