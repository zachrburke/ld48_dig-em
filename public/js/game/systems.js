define(['game/graphics', 
		'shared/game/physics',
		'game/input',
		'data/level',
		'systems/ai',
		'systems/player',
		'systems/dig_grid'], 
function(Graphics, Physics, Input, Level) {
	var Systems = {};

	for (var i = 4; i < 7; i++) {
		var arg = arguments[i];

		for(var key in arg) {
			if (typeof arg[key] === 'function')
				Systems[key] = arg[key];
		}
	}

	Graphics.Systems.box = function(e, c) {
		var offset = Graphics.offset,
			context = Graphics.context,
			scale = Level.level / c.level;

		context.save();
		context.scale(scale, scale);
		context.fillStyle = c.color;
		context.translate(-offset.x, -offset.y);

		context.globalAlpha = c.alpha ? c.alpha : 1.0;

		context.fillRect(e.body.x, e.body.y, e.body.bounds.w, e.body.bounds.h);

		context.restore();
	};

	Graphics.Systems.player = function(e, c) {
		var context = Graphics.context,
			i = e.components.health;

		context.save();

		while(i--) {
			context.fillRect(10 + i * 15, 10, 10, 10);
		}

		context.restore();
	};

	Graphics.Systems.dig_grid = function(e, c) {
		var i, length = c.width * c.height,
			xOffset = 0,
			yOffset = 0,
			scale = Level.level / c.level;

		Graphics.context.save();
		Graphics.context.scale(scale, scale);
		Graphics.context.translate(-Graphics.offset.x, -Graphics.offset.y);
		Graphics.context.fillStyle = '#572F1C';

		for(i = 0; i < length; i++) {
			if (!c.map[i])
				Graphics.context.fillRect(e.body.x + xOffset,
					e.body.y + yOffset,
					c.node_size.w,
					c.node_size.h
				);

			if ((i + 1) % c.width === 0) {
				xOffset = 0;
				yOffset += c.node_size.h;
			}
			else
				xOffset += c.node_size.w;
		}

		Graphics.context.restore();
	};

	Graphics.Systems.lighting = function(e, c) {
		var context = Graphics.context,
			i, length = c.width * c.height,
			xOffset = 0,
			yOffset = 0,
			scale = Level.level / c.level;

		context.save();
		context.scale(scale, scale);
		context.translate(-Graphics.offset.x, -Graphics.offset.y);

		// if (c.level === Level.level) {
			for(i = 0; i < length; i++) {
				context.globalAlpha = c.map[i] ? c.map[i] : c.dimness;
				context.fillRect(e.body.x + xOffset,
					e.body.y + yOffset,
					c.node_size.w,
					c.node_size.h
				);

				if ((i + 1) % c.width === 0) {
					xOffset = 0;
					yOffset += c.node_size.h;
				}
				else
					xOffset += c.node_size.w;
			}
		// }
		// else {
		// 	context.globalAlpha = c.dimness / 2;
		// 	context.fillRect(e.body.x, e.body.y, e.body.bounds.w, e.body.bounds.h);
		// }

		context.restore();
	};

	return Systems;
});