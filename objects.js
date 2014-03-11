define(["gamejs", "modules", "lib/utils"], function(gamejs, _modules, _utils) {
	var Fry = function (pos) {
		pos = pos || [Math.random() * _modules.stageWidth, 0];
  		Fry.superConstructor.apply(this);
		this.image = gamejs.image.load("images/french_fries.png");
		this.rect = new gamejs.Rect(pos, this.image.getSize());
		this.vel = [0, 200];
		this.mass = 100;
		this.gravityModule = new _modules.GravityModule(this);
		return this;
	}
	gamejs.utils.objects.extend(Fry, gamejs.sprite.Sprite);

	Fry.prototype.onCollide = function(target) {
		target.points = target.points || 0;
		target.points += 10;
		this.kill();
	};

	Fry.prototype.update = function(ms) {
		if (this.dying) {
			superKill.apply(this); // Queue deletion till next update loop
		}
		this.gravityModule.update(ms);
		this.rect.moveIp(_utils.multV(this.vel, ms/1000));
	};
	var superKill = Fry.superClass.kill;
	Fry.prototype.kill = function() {
		this.dying = true;
	};

	/* BoundingRect - extends off rect, has an onCollide fn */
	function BoundingRect (rectPos, rectDim, bounce, thresh, dir) {
  		Fry.superConstructor.apply(this);
		this.rect = new gamejs.Rect(rectPos, rectDim);
		this.bounce = bounce || 0.5; // 0 to 1
		this.bounceThreshold = thresh || 100; // Velocity at which to bounce
		this.direction = dir || null;
	}

	gamejs.utils.objects.extend(BoundingRect, gamejs.sprite.Sprite);
	BoundingRect.prototype.draw = function(display) {
		if (this.color) {
			gamejs.draw.rect(display, this.color, this.rect);
		}
	};
	BoundingRect.prototype.onCollide = function (target, ms) {
		var tb = target.rect,
			bb = this.rect;

			// center = [bb.left + bb.width/2, bb.top + bb.height/2];

		if (target.radius) {
			// Target is a circle
			// var diff = _utils.subV([tb.left, tb.top], center);
			var normal; // Direction vector between circle and contact surface

			// Bound is uni directional
			if (this.direction) {
				// if (_utils.sum(_utils.multV(target.vel, this.direction)) <= 0) {
					// Moving against bounding direction
					normal = this.direction;
				// }
			} else {
				// Find side to push object to
				if (tb.left > bb.left && tb.left < bb.right && tb.top > bb.top && tb.top < bb.bottom) {
					// Circle is inside rect
					// Push it out based on velocity
					if (Math.abs(target.vel[0]) > Math.abs(target.vel[1])) {
						if (target.vel[0] > 0) {
							normal = [-1, 0];
						} else {
							normal = [1, 0];
						}
					} else {
						if (target.vel[1] < 0) {
							normal = [0, 1];
						} else {
							normal = [0, -1];
						}

					}
				} else {
					// Circle is overlapping an edge or corner of the rect
					var overlap = {
						left: tb.left < bb.left,
						right: tb.left > bb.right,
						top: tb.top < bb.top,
						bot: tb.top > bb.bottom
					}
					
					if (overlap.left) {
						if (overlap.top) {
							normal = [tb.left - bb.left, tb.top - bb.top]; // [-,-]
						} else if (overlap.bot) {
							normal = [tb.left - bb.left, tb.top - bb.bottom]; // [-,+]
						} else {
							normal = [-1, 0];
						}
					} else if (overlap.right) {
						if (overlap.top) {
							normal = [tb.left - bb.right, tb.top - bb.top]; // [+,-]
						} else if (overlap.bot) {
							normal = [tb.left - bb.right, tb.top - bb.bottom]; // [+,+]
						} else {
							normal = [1, 0];
						}
					} else if (overlap.top) {
						normal = [0, -1];
					} else if (overlap.bot) {
						normal = [0, 1];
					}
				}
			}
			var tangentVel;
			var tangent;
			var normalVel;
			var scalarTangV;

			if (normal[0] && normal[1]) {
				// Corner

				var dist = normal; // Store it for calcs that rely on distance from circle to point of contact
				normal = _utils.normalize(normal); // Convert to unit vector

				// Find dot product
				var dot = _utils.sum(_utils.multV(target.vel, normal));

				// Find circle velocity in normal and tangential directions
				var normalVel = _utils.multV(normal,  dot);
				tangentVel = _utils.subV(target.vel, normalVel);
				tangent = _utils.normalize(tangentVel);

				if (dot < 0) { // Moving against normal
					normalVel = _utils.multV(normalVel, -this.bounce);
				}

				target.rect.moveIp( _utils.subV(_utils.multV(normal, target.radius), dist) );

			} else {
				tangent = [normal[1], -normal[0]];
				tangentVel = _utils.multV(tangent, target.vel);

				if (normal[1]) {
					// Vertical
					if (normal[1] > 0) { // Pointing down
						tb.top = bb.bottom + target.radius;

					} else if (normal[1] < 0) { // Pointing up
						tb.top = bb.top - target.radius;
					}

					normalVel = [0, target.vel[1]];

					if (normalVel[1]/normal[1] < 0) { // Opposite directions
						if (Math.abs(normalVel[1]) > this.bounceThreshold) {
							normalVel[1] *= -this.bounce;
						} else {
							normalVel[1] = 0;
						}
					}
				} else if (normal[0]) {
					// Horizontal
					if (normal[0] < 0) {
						tb.left = bb.left - target.radius;

					} else if (normal[0] > 0) {
						tb.left = bb.right + target.radius;
					}

					normalVel = [target.vel[0], 0];

					if (normalVel[0]/normal[0] < 0) { // Opposite directions
						if (Math.abs(normalVel[0]) > this.bounceThreshold) {
							normalVel[0] *= -this.bounce;
						} else {
							normalVel[0] = 0;
						}
					}
				}
			}

			// Handle tangent velocity
			scalarTangV = _utils.mag(tangentVel);

			var vDiff = target.angVel * target.radius - scalarTangV;
			if (vDiff !== 0) {
				var friction = target.friction * ms / 1000;
				var sign = vDiff > 0 ? -1 : 1;
				target.angVel += friction / target.radius * sign;
				scalarTangV += friction * -sign;
			}
			tangentVel = _utils.multV(tangent, scalarTangV);

			
			// Set total velocity
			target.vel = _utils.addV(tangentVel, normalVel);
			

		} else {
			// Target is a rectangle
			var normal;
			if (this.direction) {
				// if (_utils.sum(_utils.multV(target.vel, this.direction)) <= 0) {
					// Moving against bounding direction
					normal = this.direction;
				// }
			} else {
				// Find side to push object to
				// Circle is inside rect
				// Push it out based on velocity
				if (Math.abs(target.vel[0]) > Math.abs(target.vel[1])) {
					if (target.vel[0] > 0) {
						normal = [-1, 0];
					} else {
						normal = [1, 0];
					}
				} else {
					if (target.vel[1] < 0) {
						normal = [0, 1];
					} else {
						normal = [0, -1];
					}

				}
			}
			if (normal[1]) {
				// Vertical
				if (normal[1] > 0) { // Pointing down
					tb.top = bb.bottom;

				} else if (normal[1] < 0) { // Pointing up
					tb.bottom = bb.top;
				}

				if (Math.abs(target.vel[1]) > this.bounceThreshold) {
					target.vel[1] *= -this.bounce;
				} else {
					target.vel[1] = 0;
				}
			} else {
				// Horizontal
				if (normal[0] < 0) {
					tb.right = bb.left;

				} else if (normal[0] > 0) {
					tb.left = bb.right;
				}

				if (Math.abs(target.vel[0]) > this.bounceThreshold) {
					target.vel[0] *= -this.bounce;
				} else {
					target.vel[0] = 0;
				}
			}
		}
		// If Rect
		// Calc normal
		// Bounce it off
		// 
		// Reposition
	}


	return {
		Fry: Fry,
		BoundingRect: BoundingRect
	}
})