define(["gamejs", "modules"], function(gamejs, _modules) {
	var Fry = function (pos) {
		pos = pos || [Math.random() * _modules.stageWidth, 0];
  		Fry.superConstructor.apply(this, arguments);
		this.image = gamejs.image.load("images/french_fries.png");
		this.rect = new gamejs.Rect(pos, this.image.getSize());
		this.vel = [0, 200];
		this.gravityModule = new _modules.GravityModule(this);
		return this;
	}
	gamejs.utils.objects.extend(Fry, gamejs.sprite.Sprite);

	Fry.prototype.onCollide = function(target) {
		target.points = target.points || 0;
		target.points += 10;
	};

	Fry.prototype.update = function(ms) {
		if (this.dying) {
			superKill.apply(this); // Queue deletion till next update loop
		}
		this.gravityModule.update(ms);
	};
	var superKill = Fry.superClass.kill;
	Fry.prototype.kill = function() {
		this.dying = true;
	};

	return {
		Fry: Fry
	}
})