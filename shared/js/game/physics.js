define(function() {

	var global = typeof window !== 'undefined' ? window : exports;

	// Physics is responsible for movement and collisionts
	var Physics = {

		statics: [],
		dynamics: [],
		delta: 0,

		Update: function() {
			var i = Physics.dynamics.length;
			while(i--) {
				Physics.CalcVelocity(Physics.dynamics[i]);
				Physics.MoveEntity(Physics.dynamics[i]);
			}

			Physics.CheckCollisions();
		},

		CalcVelocity: function(e) {
			var maxVel = e.body.maxVel;

			e.body.vel.x += e.body.accel.x;
			e.body.vel.y += e.body.accel.y;

			e.body.vel.x = Math.min(maxVel.x, Math.max(-maxVel.x, e.body.vel.x));
			e.body.vel.y = Math.min(maxVel.y, Math.max(-maxVel.y, e.body.vel.y));
		},

		MoveEntity: function(e) {
			e.body.x += Physics.delta * e.body.vel.x;
			e.body.y += Physics.delta * e.body.vel.y;
		},

		CheckCollisions: function() {
			var all = Physics.dynamics.concat(Physics.statics),
				i, j, b1, b2;

			for(i in Physics.dynamics) {
				b2 = Physics.dynamics[i];

				b2.hits.length = 0;
				Physics.UpdateBounds(b2);

				for(j in all) {
					b1 = all[j];

					if (b1 == b2)
						continue;

					Physics.CheckCollision(b1, b2);
				}
			}

		},

		CheckCollision: function(b1, b2) {
			if (b2.body.bounds.Intersects(b1.body.bounds)) {
				b2.hits.push({ 
					entity: b1, 
					mtd: b2.body.bounds.MinTranslationVector(b1.body.bounds)
				});
			}
		},

		UpdateBounds: function(entity) {
			entity.body.bounds.x = entity.body.x;
			entity.body.bounds.y = entity.body.y;
		},

		RemoveBody: function(entity) {
			var index;
			if (entity.body.type == 'dynamic') {
				index = Physics.dynamics.indexOf(entity);
				Physics.dynamics.splice(index, 1);
			}
			else if (entity.body.type == 'static') {
				index = Physics.statics.indexOf(entity);
				Physics.statics.splice(index, 1);
			}
		}

	};

	Physics.AABB = function(x, y, w, h) {
		this.x = x || 0;
		this.y = y || 0;
		this.w = w || 0;
		this.h = h || 0;
	};

	Physics.AABB.prototype.GetCenter = function() {
		return {
			x: this.x + this.w / 2,
			y: this.y + this.h / 2
		};
	};

	Physics.AABB.prototype.Contains = function(x, y) {
		if (x < this.x || x > this.x + this.w) return false;
		if (y < this.y || y > this.y + this.h) return false;

		return true;
	};

	Physics.AABB.prototype.Intersects = function(box) {
		var c0 = this.GetCenter();
		var c1 = box.GetCenter();

		if (Math.abs(c0.x - c1.x) > (this.w / 2 + box.w / 2)) return false;
		if (Math.abs(c0.y - c1.y) > (this.h / 2 + box.h / 2)) return false;

		return true;
	};

	Physics.AABB.prototype.MinTranslationVector = function(box) 
	{
		var left = box.x - (this.x + this.w);
		var right = (box.x + box.w) - this.x;
		var top = box.y - (this.y + this.h);
		var bottom = (box.y + box.h) - this.y;

		var mtd = {
			x: 0,
			y: 0
		};

		if (left > 0 || right < 0) return mtd;
		if (top > 0 || bottom < 0) return mtd;

		if (Math.abs(left) < right)
			mtd.x = left;
		else
			mtd.x = right;

		if (Math.abs(top) < bottom)
			mtd.y = top;
		else
			mtd.y = bottom;

		if (Math.abs(mtd.x) < Math.abs(mtd.y))
			mtd.y = 0;
		else
			mtd.x = 0;

		return mtd;
	};

	return Physics;
});