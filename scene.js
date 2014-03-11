swag = false;
define(["gamejs", "lib/utils", "event", "player", "objects", "modules"], function(gamejs, _utils, _event, _player, _objects, _modules) {

  /* GAME SCENE */
  var GameScene = function () {
    this.players = new gamejs.sprite.Group();
    this.players.add(new _player.Player("#522"));
    this.players.add(new _player.Player("#252"));
    this.players.add(new _player.Player("#225"));
    this.objects = new gamejs.sprite.Group();

    this.boundingRects = new gamejs.sprite.Group();

    this.nextSpawn = 0;
    this.font = new gamejs.font.Font('20px monospace');

    return this;
  }

  GameScene.prototype.update = function(ms) {
    if (ms > 200) {
      console.warn("Loop too long - ms: " + ms);
      return;
    }
    this.nextSpawn -= ms;
    if (this.nextSpawn <= 0) {
      this.nextSpawn = 1000;
      this.objects.add(new _objects.Fry());
    }
    this.players.update(ms);
    this.objects.update(ms);

    _.each(gamejs.sprite.groupCollide(this.players, this.boundingRects, false, false, _utils.collideCircleRectangle), function (sprites) {
      sprites.b.onCollide(sprites.a, ms); // Important! ms must be passed in
    });
    _.each(gamejs.sprite.groupCollide(this.objects, this.boundingRects), function (sprites) {
      sprites.b.onCollide(sprites.a)
    });
    _.each(gamejs.sprite.groupCollide(this.players, this.objects, false, false, _utils.collideCircleRectangle), function (sprites) {
      sprites.b.onCollide(sprites.a);
    });
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
    this.boundingRects.draw(surface);
    for (var i = 0; i < this.players.sprites().length; i++){
      surface.blit(this.font.render("Points"), [700, 30]);
      surface.blit(this.font.render("Player " + (i + 1) + ": " + this.players.sprites()[i].points, "#000"), [600, 50 + i * 15]);
    }

    if (swag) {
      if (!playing) {
        audio.play();
        playing = true;
      };

      // Trippy lights
      _.each(color, function(value, key){
        color[key] += 20 - Math.random() * 40;
        if (color[key] < 80) {
          color[key] += 5;
        }
        if (color[key] < 20) { color[key] = 20};
        if (color[key] >  256) { color[key] = 256};
        color[key] = Math.floor(color[key]); 
      })
      var dest = [10 - Math.random() * 20, 10 - Math.random() * 20]; // Screen shake

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



  return {
    Director: Director,
    GameScene: GameScene
  }

});