define(function() {
	var Graphics = {

		images: {},
		sprites: {},
		offset: { x: 0, y: 0 },

		Systems: {},

		InitCanvas: function(id, w, h) {
			Graphics.canvas = document.getElementById(id);

			if (!Graphics.canvas)
				throw "Could not find canvas with id of " + id;

			Graphics.context = Graphics.canvas.getContext('2d');
			Graphics.canvas.width = w;
			Graphics.canvas.height = h;
		},

		LoadImage: function(url, name, callback) {
			Graphics.images[name] = new Image();
			Graphics.images[name].src = url;
			Graphics.images[name].onload = callback;
		},

		LoadSprite: function(url, name, w, h, callback) {
			Graphics.sprites[name] = new Graphics.Sprite(url, w, h, callback);
			return Graphics.sprites[name];
		},

		
	};

	Graphics.Sprite = function(url, w, h, callback) {
		this.image = new Image();
		this.image.src = url;
		this.w = w;
		this.h = h;
		this.anims = {};
		this.currentAnim = null;
		this.frames = [];

		var self = this;

		this.image.onload = function() {
			for (var y = 0; y < self.image.height; y += self.h) {
				for(var x = 0; x < self.image.width; x += self.w) {
					self.frames.push({
						x: x,
						y: y,
						w: w,
						h: h
					});
				}
			}
			self.currentFrame = 0;
			if (callback)
				callback.apply(self);
		};
	};

	Graphics.Sprite.prototype.AddAnimation = function(name, throttle, frames) {
		this.anims[name] = {
			throttle: throttle,
			frames: frames,
			elapsed: 0,
			index: 0,
			length: frames.length
		};
	};

	Graphics.Sprite.prototype.Update = function() {
		if (!this.currentAnim)
			return;

		this.currentAnim.elapsed += Physics.delta;

		if (this.currentAnim.elapsed > this.currentAnim.throttle) {
			this.currentAnim.index = this.currentAnim.index >= this.currentAnim.length - 1 ? 0 : this.currentAnim.index + 1;
			this.currentAnim.elapsed = 0;
		}		

		this.currentFrame = this.frames[this.currentAnim.frames[this.currentAnim.index]];
	};

	Graphics.Sprite.prototype.GetFrameIndex = function(x, y) {
		var frameX = Math.floor(x / this.w),
			frameY = Math.floor(y / this.h),
			width = this.image.width / this.w,
			index = (frameY * width) + frameX;

		return index;
	};

	Graphics.Sprite.prototype.GetCoordFromIndex = function(index) {
		var frame = this.frames[index];

		return {
			x: frame.x / this.w,
			y: frame.y / this.h
		};
	};

	return Graphics;
});