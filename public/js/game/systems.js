define(['game/graphics', 
		'shared/game/physics',
		'game/input'], 
		function(Graphics, Physics, Input) {
	var Systems = {};

	Graphics.Systems.box = function(e, c) {
		var offset = Graphics.offset,
			context = Graphics.context;

		context.save();
		context.fillStyle = c.color;
		context.translate(-offset.x, -offset.y);

		if (e.components.stun)
			context.globalAlpha = 0.3;

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

	Systems.player_controlled = function(e, c) {
		e.body.vel = { x: 0, y: 0 };

		if (Input.KeyDown(c.up)) 
			e.body.vel.y = -1;
		if (Input.KeyDown(c.down))
			e.body.vel.y = 1;
		if (Input.KeyDown(c.left))
			e.body.vel.x = -1;
		if (Input.KeyDown(c.right))
			e.body.vel.x = 1;
	};

	Systems.physical = function(e, c) {
		var touches = e.Touches('collision_map'),
			i = touches.length;

		while(i--) {
			e.body.x += touches[i].mtd.x;
			e.body.y += touches[i].mtd.y;
		}
	};

	Systems.health = function(e, health) {
		if (health <= 0) {
			e.Kill();
		}
	};

	Systems.hurts_player = function(e, c) {
		var players = e.Touches('player'),
			i = players.length,
			mtd, player;

		while(i--) {
			mtd = _normalize(players[i].mtd);
			player = players[i].entity;

			if (mtd.x)
				player.body.x -= mtd.x * c.pushback;
			if (mtd.y)
				player.body.y -= mtd.y * c.pushback;

			if (player.components.health)
				player.components.health -= c.damage;

			player.components.stun = {
				elapsed: 0,
				interval: 300
			};
		}
	};

	Systems.stun = function(e, c) {
		e.body.vel.x = 0;
		e.body.vel.y = 0;

		c.elapsed += Physics.delta;

		if (c.elapsed >= c.interval) {
			delete e.components.stun;
		}
	};

	function _normalize(v) {
		var magnitude;

		magnitude = Math.pow(v.x, 2) + Math.pow(v.y, 2);
		magnitude = Math.sqrt(magnitude);

		return {
			x: v.x / magnitude,
			y: v.y / magnitude
		};
	}

	return Systems;
});