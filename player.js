define(["gamejs", "modules", "lib/utils"], function(gamejs, _modules, _utils) {
	var angA = 10,
		resistance = 0.75;

	var Player = function(color) {
  		Player.superConstructor.apply(this, arguments);
		this.rect = new gamejs.Rect([400, _modules.stageHeight - 10]); // (x, y) coordinates. Left = x center, top = y center
		this.vel = [0, 0];
		this.angVel = 0;
		this.friction = 250;
		this.direction = 0; // Direction player is trying to move
		this.modifiers = {};
		this.points = 0;
		this.radius = 20;
		this.mass = 1000;
		this.color = color;
		this.jumpModule = new _modules.JumpModule(this);
		return this;
	}
    gamejs.utils.objects.extend(Player, gamejs.sprite.Sprite);

	Player.prototype.draw = function(display) {
		gamejs.draw.circle(display, this.color, [this.rect.left, this.rect.top], this.radius);
	};

	Player.prototype.handle = function(event) {
		switch (event.command) {
		case "move":
			if (event.type === gamejs.event.KEY_DOWN) {
				this.direction = event.direction;
			} else if (event.type === gamejs.event.KEY_UP) {
				if (this.direction === event.direction) {
					this.direction = 0;
				};
			}
			break;
		case "jump":
			this.jumpModule.handle(event);
			break;
		default:
			"Unkown type";
		}
	};

	Player.prototype.update = function(ms) {
		var that = this;

		that.angVel += that.direction * 100 * ms / 1000;
		that.jumpModule.update(ms);


		that.rect.moveIp(_utils.multV(that.vel, ms/1000));


		_.each(that.modifiers, function(modList, key) {
			for (var i = 0; i < modList.length; i++) {
				var modifier = modList[i];
				modifier.timer -= ms;
			};
			that.modifiers[key] = _.filter(modList, function(){
				return !(modList.timer <= 0); // Allows positive and NaN
			})
		});
	};

	var modId = 0; // Shared across all players
	Player.prototype.addMod = function(type, mod) {
		if (this.modifiers[type] === undefined) {
			this.modifiers[type] = [];
		}

		mod.id = modId++;
		this.modifiers[type].push(mod);

		return mod.id;
	};

	Player.prototype.removeMod = function(type, id) {
		this.modifiers[type] = _.filter(this.modifiers[type], function(mod) {
			return mod.id !== id;
		});
	};

    return {
    	Player: Player
    }
})