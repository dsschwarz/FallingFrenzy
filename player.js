define(["gamejs", "modules"], function(gamejs, _modules){
	var acceleration = 550,
		friction = 250,
		resistance = 0.75;
	var Player = function(color) {
  		Player.superConstructor.apply(this, arguments);
		this.rect = new gamejs.Rect([400, _modules.stageHeight - 10]); // (x, y) coordinates
		this.vel = [0, 0];
		this.direction = 0; // Direction player is trying to move
		this.modifiers = {};
		this.points = 0;
		this.radius = 20;
		this.color = color;
		this.jumpModule = new _modules.GravityModule(this);
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
		that.jumpModule.update(ms);

		var slowAmount = 1;
		_.each(that.modifiers.slow, function(slow) {
			slowAmount *= slow.amount;
		})
		if (!slowAmount) {
			console.warn("Undefined slow amount - defaulting to 1");
			slowAmount = 1;
		}
		that.vel[0] += acceleration * that.direction * slowAmount * ms / 1000;
		if (that.vel[0] === 0) {
			//pass
		} else {
			var dir = that.vel[0] > 0 ? 1 : -1;
			var frictionApplied = this.jumpModule.inAir ? 0 : friction;

			that.vel[0] -= (frictionApplied * dir + that.vel[0] * resistance) * ms / 1000; // Slow by amount that scales with current velocity
			if (that.vel[0] * dir < 0) {
				that.vel[0] = 0; // If vel is now in the other direction
			}
			that.rect.moveIp([that.vel[0] * ms / 1000, 0]);
			if (that.rect.left < 0) {
				that.rect.left = 0;
				that.vel[0] *= -1;
			} else if (that.rect.right > _modules.stageWidth) {
				that.rect.right = _modules.stageWidth;
				that.vel[0] *= -1;
			}
		}

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