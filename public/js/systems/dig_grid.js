define(['shared/game/physics'], function(Physics) {
	var Systems = {};

	Systems.dig = function(e, c) {
		var grid = e.Touches('dig_grid')[0],
			dig_grid;

		if (grid && Input.KeyPressed(c.command)) {
			dig_grid = grid.entity.components.dig_grid;

			_createHole(e, grid.entity);
			_changeLighting(dig_grid.level + 1, grid.entity);
		}
	};

	Systems.falls = function(e, c) {
		var grid = e.Touches('dig_grid')[0],
			dig_grid;

		if (grid) {
			grid = grid.entity;
			dig_grid = grid.components.dig_grid;

			if(_willFallInGap(e, dig_grid, grid)) {
				var start_point = _findStartPoint(dig_grid.level + 1);
				_dropEntity(e, start_point, grid);
			}
		}	
	};

	Systems.falling = function(e, c) {
		var box = e.components.box,
			center = e.components.center,
			step = Physics.delta / c.interval;

		c.elapsed += Physics.delta;

		if (box)
			box.level += step;

		if (center) {
			center.view.x += c.tween.view.x * step;
			center.view.y += c.tween.view.y * step;
			center.view.width += c.tween.view.width * step;
			center.view.height += c.tween.view.height * step;
		}

		e.body.x += c.tween.body.x * step;
		e.body.y += c.tween.body.y * step;

		if (c.elapsed > c.interval) {
			e.components.falls = true;
			e.components.physical = true;

			delete e.components.falling;

			e.body.x = c.new_pos.x;
			e.body.y = c.new_pos.y;

			if (box) {
				box.alpha = 1.0;
				box.level = Math.round(box.level);
			}

			if (center) {
				center.view = c.view;
			}

		}
	};

	function _createHole(e, grid) {
		var translation = {},
			dig_grid = grid.components.dig_grid,
			x, y, index;

		translation.x = e.body.x - grid.body.x;
		translation.y = e.body.y - grid.body.y;

		x = Math.floor(translation.x / dig_grid.node_size.w);
		y = Math.floor(translation.y / dig_grid.node_size.h);

		index = x + (y * dig_grid.width);
		_createHolesRecursive(index, dig_grid, 0);
	}

	function _createHolesRecursive(index, dig_grid, level) {
		if (!dig_grid.map[index]) {
			dig_grid.map[index] = true;
			dig_grid.holes++;
		}
		else if (level > 3)
			return;
		else {
			var left = index - 1;
			var right = index + 1;
			var up = index + dig_grid.width;
			var down = index - dig_grid.width;

			if (right % dig_grid.width !== 0)
				_createHolesRecursive(right, dig_grid, level + 1);

			if (left % dig_grid.width !== 0)
				_createHolesRecursive(left, dig_grid, level + 1);

			if (up % dig_grid.height !== 0)
				_createHolesRecursive(up, dig_grid, level + 1);

			if (down % dig_grid.height !== 0)
				_createHolesRecursive(down, dig_grid, level + 1);
		}
	}

	function _willFallInGap(e, c, dig_grid) {
		var i, maplength = c.map.length,
			width, height, length,
			xOffset = 0, yOffset = 0,
			x, y, index,
			translation = {};

		translation.x = e.body.x - dig_grid.body.x;
		translation.y = e.body.y - dig_grid.body.y;

		x = Math.floor(translation.x / c.node_size.w);
		y = Math.floor(translation.y / c.node_size.h);
		xOffset = x;

		width = e.body.bounds.w / c.node_size.w;
		height = e.body.bounds.h / c.node_size.h;
		length = width * height;

		for(i = 0; i < length; i++) {
			index = y * c.width + xOffset;

			if ((i + 1) % width === 0) {
				xOffset = x;
				y++;
			}
			else
				xOffset++;

			if (index > maplength || !c.map[index])
				return false;
		}

		return true;
	}

	function _updateLightmap(lighting, body, dig_grid, start) {
		var x, y,
			xOffset = 0, yOffset = 0,
			lightmapLength = lighting.width * lighting.height,
			dgLength = dig_grid.width * dig_grid.height,
			i, index,
			translation = {};

		translation.x = start.x - body.x;
		translation.y = start.y - body.y;

		for (i = 0; i < dgLength; i++) {
			x = Math.floor((translation.x + xOffset)/ lighting.node_size.w);
			y = Math.floor((translation.y + yOffset) / lighting.node_size.h);

			index = y * lighting.width + x;

			if (index > lightmapLength)
				break;

			if (dig_grid.map[i]) {
				lighting.map[index] = 0.1;
			}

			if ((i + 1) % dig_grid.width === 0) {
				xOffset = 0;
				yOffset += dig_grid.node_size.h;
			}
			else
				xOffset += dig_grid.node_size.w;
		}
		
	}

	function _findStartPoint(level) {
		var start_point, i = Client.entities.length;

		while(i--) {
			start_point = Client.entities[i].components.start_point;
			if (start_point && start_point.level === level)
				return Client.entities[i];
		}
	}

	function _dropEntity(e, start_point, grid) {
		var center = e.components.center,
			box = e.components.box;

		e.components.falling = {
			interval: 500,
			elapsed: 0,
			new_pos: {
				x: (e.body.x - grid.body.x) + start_point.body.x,
				y: (e.body.y - grid.body.y) + start_point.body.y
			},
			view: start_point.components.start_point.view
		};

		e.components.falling.tween = {
			body: {
				x: e.components.falling.new_pos.x - e.body.x,
				y: e.components.falling.new_pos.y - e.body.y
			}			
		};

		if (center) {
			start_point = start_point.components.start_point;

			e.components.falling.tween.view = {
				x: start_point.view.x - center.view.x,
				y: start_point.view.y - center.view.y,
				width: start_point.view.width - center.view.width,
				height: start_point.view.height - center.view.height
			};
		}

		delete e.components.falls;
		delete e.components.physical;

		if (box)
			box.alpha = 0.5;
	}

	function _changeLighting(level, dig_grid) {
		var lighting, 
			i = Client.entities.length,
			gridComp = dig_grid.components.dig_grid,
			gridSize = gridComp.width * gridComp.height,
			coverage = gridComp.holes / gridSize,
			body;

		while(i--) {
			lighting = Client.entities[i].components.lighting;
			body = Client.entities[i].body;

			if (lighting && lighting.level === level) {
				var start_point = _findStartPoint(level);
				lighting.dimness = (1 - coverage);
				_updateLightmap(lighting, body, gridComp, start_point.body);
			}
		}
	}

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