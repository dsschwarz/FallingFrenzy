define(function() {

	// v1 should be shorter than v2
	function eachV (v1, v2, operator) {
		var a = [];
		if (v1.length > v2.length) {
			console.error("Vector 1 is longer than vector 2");
			return v1;
		}
		if (operator.length > 1) {
			console.error("Only basic operators allowed");
			return v1;
		}
		_.each(v1, function(el, index) {
			if(v2.length) {
				a.push(eval("el" + operator + "v2[index]"));
			} else {
				a.push(eval("el" + operator + "v2"));
			}
		})
		return a;
	}

	function sum (vec) {
		var sum = 0;
		_.each(vec, function (val) {
			sum += val;
		})
		return sum;
	}

	function magnitude (vec) {
		var sum = 0;
		_.each(vec, function (val) {
			sum += val * val;
		})
		return Math.sqrt(sum);
	}

	function normalize(vec) {
		var mag = magnitude(vec);
		var array = [];
		_.each(vec, function (val, index) {
			array.push(val/mag);
		});
		return array;
	}
	function collideCircleRectangle (circleSprite, rectSprite) {
		var radius = circleSprite.radius || Math.max(circleSprite.rect.width, circleSprite.rect.height);
		// Get distance between centers
		var xDist  = Math.abs(circleSprite.rect.left - (rectSprite.rect.left + rectSprite.rect.width/2)); 
		var yDist  = Math.abs(circleSprite.rect.top - (rectSprite.rect.top + rectSprite.rect.height/2)); 

		// If circle is completely out of range of overlapping the rectangle
		if (xDist >= rectSprite.rect.width/2 + radius) { return false;}
		if (yDist >= rectSprite.rect.height/2 + radius) { return false;}

		// Then, handle cases where circle is close enough to garauntee an overlap
		if (xDist < (rectSprite.rect.width/2)) { return true; } 
		if (yDist < (rectSprite.rect.height/2)) { return true; }

		// Final case: circle might overlap corner of rectangle
		var cornerDistance_sq = Math.pow(xDist - rectSprite.rect.width/2, 2) + Math.pow(yDist - rectSprite.rect.height/2, 2); // Distance from circle center to corner

		return (cornerDistance_sq < (radius * radius));
	}
	return {
		addV: function (v1, v2) {
			return eachV(v1, v2, "+");
		},
		subV: function (v1, v2) {
			return eachV(v1, v2, "-");
		},
		multV: function (v1, v2) {
			return eachV(v1, v2, "*");
		},
		divV: function (v1, v2) {
			return eachV(v1, v2, "/");
		},
		sum: sum,
		mag: magnitude,
		normalize: normalize,
		collideCircleRectangle: collideCircleRectangle
	}

});