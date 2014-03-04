define(["gamejs"], function(gamejs) {
	var gravity = 2200;
	var terminalVelocity = 10 * gravity;
	var stageHeight = 600;
	var stageWidth = 800;

	// Handles applying gravity to objects, and lets them jump
	function GravityModule (target) {
		this.target = target; // Careful about potential circular ref
		this.jumpCharge = 0;
		this.maxJump = 1200;
		this.chargeRate = 800;
		this.charging = false;
		this.inAir = false;
		this.slowId = undefined;
		
		return this;

	}

	GravityModule.prototype.update = function (ms) {
		this.target.rect.moveIp([0, this.target.vel[1] * ms / 1000]);

		if (this.target.radius) { // Dis not rectangle
			this.inAir = (this.target.rect.top + this.target.radius !== stageHeight);
		} else {
			this.inAir = (this.target.rect.bottom !== stageHeight);
		}

		if (this.charging) {
			var chargeMod = this.inAir ? 10 : 1; // Helps double/triple jumping. Needs tweaking
			this.jumpCharge = Math.min(this.maxJump, this.jumpCharge + this.chargeRate * chargeMod * ms / 1000);
		}

		if (this.inAir) {
			this.target.vel[1] += gravity * ms / 1000;
			if (this.target.radius) { // Dis not rectangle
				if (this.target.radius + this.target.rect.top > stageHeight) {
					this.target.rect.top = stageHeight - this.target.radius;
					this.inAir = false;
					this.target.vel[1] = 0;
				}
			}
			else // Dis a rectangle
			{
				if (this.target.rect.bottom > stageHeight) {
					this.target.rect.bottom = stageHeight;
					this.inAir = false;
					this.target.vel[1] = 0;
				}
			}
		}
	}
	GravityModule.prototype.handle = function (event) {
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
			console.log("Jumping: " + this.jumpCharge)
			this.target.vel[1] -= this.jumpCharge; // Negative velocity is 'up'
			this.jumpCharge = 0;
			this.charging = false;
			this.target.removeMod("slow", this.slowId);
			this.slowId = undefined;
			break;
		default:
			console.warn("Incorrect event: ", event);
		}
	}

	// Returns false if target has a disable
	GravityModule.prototype.canJump = function() {
		var mods = this.target.modifiers;
		if(mods && mods.jump) {
			return mods.jump.length > 0;
		} else {
			return true;
		}
	};
	return {
		GravityModule: GravityModule,
		gravity: gravity,
		stageHeight: stageHeight,
		stageWidth: stageWidth
	}
});