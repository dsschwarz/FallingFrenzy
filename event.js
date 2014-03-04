define(["gamejs/event"], function(_e) { // e is gamejs.event, elsewhere it often refers to this file
	var keyBindings = [
	{
		'key'		: _e.K_a,
		'command'	: "move",
		'direction'	: -1,
		'player'	: 0
	},
	{
		'key'		: _e.K_d,
		'command'	: "move",
		'direction'	: 1,
		'player'	: 0
	},
	{
		'key'		: _e.K_w,
		'command'	: "jump",
		'direction'	: 1,
		'player'	: 0
	},
	{
		'key'		: _e.K_LEFT,
		'command'	: "move",
		'direction'	: -1,
		'player'	: 1
	},
	{
		'key'		: _e.K_RIGHT,
		'command'	: "move",
		'direction'	: 1,
		'player'	: 1
	},
	{
		'key'		: _e.K_UP,
		'command'	: "jump",
		'direction'	: 1,
		'player'	: 1
	},
	{
		'key'		: _e.K_j,
		'command'	: "move",
		'direction'	: -1,
		'player'	: 2
	},
	{
		'key'		: _e.K_l,
		'command'	: "move",
		'direction'	: 1,
		'player'	: 2
	},
	{
		'key'		: _e.K_i,
		'command'	: "jump",
		'direction'	: 1,
		'player'	: 2
	}
	];

	function findKeyEvent (key) {
		for (var i = keyBindings.length - 1; i >= 0; i--) {
			if (keyBindings[i].key === key) {
				return _.clone(keyBindings[i]);
			}
		};
	}

	return {
		findKeyEvent: findKeyEvent
	}
})
