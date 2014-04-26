define(['shared/game/physics', 'game/graphics'], function(Physics, Graphics) {
	var Systems = {};

	Systems.player_controlled = function(e, c) {
		e.body.vel = { x: 0, y: 0 };

		if (Input.KeyDown(c.up)) 
			e.body.vel.y = -c.speed;
		if (Input.KeyDown(c.down))
			e.body.vel.y = c.speed;
		if (Input.KeyDown(c.left))
			e.body.vel.x = -c.speed;
		if (Input.KeyDown(c.right))
			e.body.vel.x = c.speed;
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

	Systems.stun = function(e, c) {
		var box = e.components.box;

		e.body.vel.x = 0;
		e.body.vel.y = 0;

		c.elapsed += Physics.delta;

		if (c.elapsed >= c.interval) {
			delete e.components.stun;

			if (box)
				box.alpha = 1.0;
		}
	};

	Systems.center = function(e, c) {
		var center = { 
			x: Graphics.canvas.width / 2, 
			y: Graphics.canvas.height / 2 
		};

		Graphics.offset.x = e.body.x - center.x;
		Graphics.offset.y = e.body.y - center.y;

		if (Graphics.offset.x < c.view.x)
			Graphics.offset.x = c.view.x;

		if (Graphics.offset.y < c.view.y)
			Graphics.offset.y = c.view.y;

		if (Graphics.offset.x + Graphics.canvas.width > c.view.width) 
			Graphics.offset.x = c.view.width - Graphics.canvas.width;

		if (Graphics.offset.y + Graphics.canvas.height > c.view.height) 
			Graphics.offset.y = c.view.height - Graphics.canvas.height;

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