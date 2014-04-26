define(['game/graphics'], function(Graphics) {

	var Tileset = {

		tilemap: null,

		highlighted: null,
		selected: [],
		selectedSize: {},

		InitCanvas: function(id, w, h) {
			this.canvas = document.getElementById(id);

			if (!this.canvas)
				throw "Could not find canvas with id of " + id;

			this.context = this.canvas.getContext('2d');
			this.canvas.width = w;
			this.canvas.height = h;

			this.canvas.addEventListener('mousemove', _onMouseMove);
			this.canvas.addEventListener('mousedown', _onMouseDown);
			this.canvas.addEventListener('mouseup', _onMouseUp);
		},

		ClearCanvas: function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},

		Draw: function() {
			if (!this.tilemap)
				return;

			_highlightSquare(this.context);
			_highlightSelected(this.context);
		}
	};

	var _onDrag = null,
		start = {};

	function _highlightSquare(context) {
		if (!Tileset.highlighted)
			return;

		var sprite = Graphics.sprites[Tileset.tilemap.sprite],
			frame = sprite.frames[Tileset.highlighted];

		context.save();
		context.fillStyle = 'rgba(200, 200, 90, 0.7)';

		context.fillRect(frame.x, frame.y, frame.w, frame.h);

		context.restore();
	}

	function _highlightSelected(context) {
		var sprite = Graphics.sprites[Tileset.tilemap.sprite],
			i = Tileset.selected.length,
			frame;

		context.save();
		context.fillStyle = 'rgba(90, 200, 90, 0.7)';

		while(i--) {
			frame = sprite.frames[Tileset.selected[i]];
			context.fillRect(frame.x, frame.y, frame.w, frame.h);
		}

		context.restore();
	}

	function _onMouseMove(e) {
		if (!Tileset.tilemap)
			return;

		var sprite = Graphics.sprites[Tileset.tilemap.sprite],
			index = sprite.GetFrameIndex(e.offsetX, e.offsetY);

		Tileset.highlighted = index;

		if (_onDrag) 
			_onDrag(e);
	}

	function _onMouseDown(e) {
		start.x = e.offsetX;
		start.y = e.offsetY;

		_onDrag = _selectSquares;
	}

	function _onMouseUp(e) {
		_onDrag = null;
	}

	function _selectSquares(e) {
		var sprite = Graphics.sprites[Tileset.tilemap.sprite],
			startX = start.x - (start.x % sprite.w),
			startY = start.y - (start.y % sprite.h),
			endX = e.offsetX + sprite.w - (e.offsetX % sprite.w),
			endY = e.offsetY + sprite.h - (e.offsetY % sprite.h),
			x = startX, y = startY,
			size, i;

		Tileset.selected.length = 0;
		Tileset.selectedSize.x = Math.abs(endX - startX) / sprite.w;
		Tileset.selectedSize.y = Math.abs(endY - startY) / sprite.h;
		size = Tileset.selectedSize.x * Tileset.selectedSize.y;

		for (i = 0; i < size; i++) {
			Tileset.selected.push(sprite.GetFrameIndex(x, y));

			if ((i + 1) % Tileset.selectedSize.x === 0) {
				x = startX;
				y += sprite.h;
			}
			else
				x += sprite.w;
		}
	}

	window.Tileset = Tileset;

});