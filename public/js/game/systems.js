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

		context.fillRect(e.body.x, e.body.y, e.body.bounds.w, e.body.bounds.h);

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

	return Systems;
});