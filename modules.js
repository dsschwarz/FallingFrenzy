define(["gamejs"], function(gamejs) {
	var gravity = 1;
	var terminalV = 600; //pixels/second
	var stageHeight = 600;
	var stageWidth = 800;

	// Handles applying gravity to objects
	function GravityModule (target) {
		this.target = target; // Careful about potential circular ref
		
		return this;

	}

	GravityModule.prototype.update = function (ms) {
		if (this.target.vel[1] < terminalV) {
			this.target.vel[1] += gravity * this.target.mass * ms / 1000; // Hacked to make heavier objects fall faster
		} else {
			this.target.vel[1] = terminalV;
		}

		if (this.target.rect.top > stageHeight * 2) {
			this.target.rect.top = stageHeight; // Bring it back into range, kinda
		}
	}

	function JumpModule(target) {
  		JumpModule.superConstructor.apply(this, arguments);
		this.jumpCharge = 0;
		this.maxJump = 850;
		this.chargeRate = 1000;
		this.charging = false;
		this.slowId = undefined;

		return this;
	}
	gamejs.utils.objects.extend(JumpModule, GravityModule);

	// Returns false if target has a disable
	JumpModule.prototype.canJump = function() {
		var mods = this.target.modifiers;
		if(mods && mods.jump) {
			return mods.jump.length > 0;
		} else {
			return true;
		}
	};

	JumpModule.prototype.handle = function (event) {
		if (event.command !== "jump") {
			console.warn("Jump module - handle() expects event.command 'jump'");
			return;
		}
		switch (event.type) {
		case gamejs.event.KEY_DOWN:
			if (!this.charging && this.canJump()) {
				this.charging = true;
				this.jumpCharge = 0;
				if (this.slowId === undefined) {
					this.slowId = this.target.addMod("slow", {amount: 0.7, timer: NaN}); // Unlimited timer 
				}
			}
			break;
		case gamejs.event.KEY_UP:
			console.log("Jumping: " + this.jumpCharge);
			this.target.vel[1] -= this.jumpCharge; // Negative velocity is 'up'
			this.jumpCharge = 0;
			this.charging = false;
			this.target.removeMod("slow", this.slowId);
			this.slowId = undefined;
			break;
		default:
			console.warn("Incorrect event: ", event);
		}
	};

	JumpModule.prototype.update = function(ms) {
		JumpModule.superClass.update.apply(this, arguments);
		if (this.charging && this.jumpCharge < this.maxJump) {
			this.jumpCharge += this.chargeRate * ms / 1000;
		}
	};
	return {
		GravityModule: GravityModule,
		JumpModule: JumpModule,
		gravity: gravity,
		stageHeight: stageHeight,
		stageWidth: stageWidth
	}
});