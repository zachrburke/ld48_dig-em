define(['shared/game/physics'], function(Physics) {

	var Systems = {};

	Systems.hurts_player = function(e, c) {
		var players = e.Touches('player'),
			i = players.length,
			mtd, player;

		while(i--) {
			mtd = _normalize(players[i].mtd);
			player = players[i].entity;

			if (player.components.stun)
				continue;

			if (mtd.x)
				player.body.x -= mtd.x * c.pushback;
			if (mtd.y)
				player.body.y -= mtd.y * c.pushback;

			if (player.components.health)
				player.components.health -= c.damage;

			if (player.components.box)
				player.components.box.alpha = 0.7;

			player.components.stun = {
				elapsed: 0,
				interval: 300
			};
		}
	};

	Systems.ai_controlled = function(e, c) {
		if (c.last_pos) {
			var traveledDistance = {
				x: e.body.x - c.last_pos.x,
				y: e.body.y - c.last_pos.y
			};

			c.last_pos.x = e.body.x;
			c.last_pos.y = e.body.y;

			c.steps_taken += _magnitude(traveledDistance);

			if (c.steps_taken >= c.step_size) {
				c.last_pos = null;
				c.steps_taken = 0;

				e.body.vel.x = 0;
				e.body.vel.y = 0;
			}

			var collision_map = e.Touches('collision_map')[0];

			if (collision_map) {
				e.body.vel.x = -e.body.vel.x;
				e.body.vel.y = -e.body.vel.y;
			}
		}
		else {
			c.elapsed += Physics.delta;

			if (c.elapsed >= c.interval) {
				c.last_pos = {
					x: e.body.x,
					y: e.body.y
				};
				c.elapsed = 0;
				c.steps_taken = 0;

				var speed = Math.random() > 0.5 ? -c.speed : c.speed;

				if (Math.random() > 0.5)
					e.body.vel.x = speed;
				else
					e.body.vel.y = speed;
			}
		}
	};


	function _normalize(v) {
		var magnitude = _magnitude(v);

		if (magnitude > 0)
			return {
				x: v.x / magnitude,
				y: v.y / magnitude
			};
		else
			return { x: 0, y: 0 };
	}

	function _magnitude(v) {
		var magnitude;

		magnitude = Math.pow(v.x, 2) + Math.pow(v.y, 2);
		magnitude = Math.sqrt(magnitude);

		return magnitude;
	}

	return Systems;
});