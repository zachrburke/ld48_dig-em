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

	Graphics.Systems.sprite = function(e, c) {
		var sprite = Graphics.sprites[c.name],
			anim = sprite.anims[c.anim],
			frame,
			context = Graphics.context,
			scale = Level.level / c.level;

		// need a better way to expose delta times
		c.elapsed += Physics.delta;

		if (c.elapsed > anim.throttle) {
			c.index = c.index >= anim.length - 1 ? 0 : c.index + 1;
			c.elapsed = 0;
		}

		frame = sprite.frames[anim.frames[c.index]];

		context.save();
		context.scale(scale, scale);
		context.translate(-Graphics.offset.x, -Graphics.offset.y);

		context.globalAlpha = c.alpha ? c.alpha : 1.0;

		context.drawImage(sprite.image,
			frame.x, frame.y,
			frame.w, frame.h, 
			e.body.x, e.body.y, 
			frame.w, frame.h
		);

		context.restore();
	};

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

	Graphics.Systems.pattern = function(e, c) {
		var pattern = Graphics.patterns[c.name],
			context = Graphics.context,
			scale = Level.level / c.level;

		context.save();
		context.scale(scale, scale);
		context.fillStyle = pattern.pattern;
		context.translate(e. body.x - Graphics.offset.x, e.body.y - Graphics.offset.y);

		context.globalAlpha = c.alpha ? c.alpha : 1.0;

		context.fillRect(0, 0, e.body.bounds.w, e.body.bounds.h);

		context.restore();
	};

	Graphics.Systems.text = function(e, c) {
		if (c.level !== Level.level)
			return;

		var offset = Graphics.offset,
			context = Graphics.context,
			scale = Level.level / c.level;

		context.save();
		context.scale(scale, scale);
		context.translate(-offset.x, -offset.y);

		context.font = c.font;
		context.fillText(c.text, e.body.x, e.body.y);

		context.restore();
	};

	Graphics.Systems.lava = function(e, c) {
		var i, length = c.width * c.height,
			xOffset = 0,
			yOffset = 0,
			scale = Level.level / c.level,
			sprite = Graphics.sprites[c.name],
			anim = sprite.anims[c.anim],
			frame;

		c.elapsed += Physics.delta;

		if (c.elapsed > anim.throttle) {
			c.index = c.index >= anim.length - 1 ? 0 : c.index + 1;
			c.elapsed = 0;
		}

		frame = sprite.frames[anim.frames[c.index]];

		Graphics.context.save();
		Graphics.context.scale(scale, scale);
		Graphics.context.translate(-Graphics.offset.x, -Graphics.offset.y);

		for(i = 0; i < length; i++) {

			Graphics.context.drawImage(sprite.image,
				frame.x, frame.y,
				frame.w, frame.h,
				e.body.x + xOffset,
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

	Graphics.Systems.player = function(e, c) {
		var context = Graphics.context,
			i = e.components.health;

		context.save();

		context.font = '14pt monospace';
		context.fillStyle = 'green';
		context.fillText('health', 10, 20);

		while(i--) {
			context.fillRect(100 + i * 15, 10, 10, 10);
		}

		context.restore();
	};

	Graphics.Systems.dig_grid = function(e, c) {
		var i, length = c.width * c.height,
			xOffset = 0,
			yOffset = 0,
			scale = Level.level / c.level,
			sprite = Graphics.sprites[c.tile],
			frame;

		Graphics.context.save();
		Graphics.context.scale(scale, scale);
		Graphics.context.translate(-Graphics.offset.x, -Graphics.offset.y);
		Graphics.context.fillStyle = '#572F1C';

		for(i = 0; i < length; i++) {

			frame = sprite.frames[c.pattern[i % c.pattern.length]];

			if (!c.map[i])
				Graphics.context.drawImage(sprite.image,
					frame.x, frame.y,
					frame.w, frame.h,
					e.body.x + xOffset,
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

		context.restore();
	};

	return Systems;
});