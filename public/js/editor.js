require.config({
	paths: {
		shared: "../shared/js"
	}
});

require([
	'game/client', 
	'game/graphics',
	'editor/ui',
	'editor/systems',
	'editor/tileset'
	], function(Client, Graphics, EditorUI, Systems) {

	Graphics.Systems.player = function(e, c) { };
	Graphics.Systems.lighting = function(e, c) { };

	// Override loop to perform only Draw calls
	Client.Loop = function() {
		var now = new Date();
		Client.lastFrameDelta = now - Client.lastFrameTime;
		Client.lastFrameTime = now;

		Tileset.ClearCanvas();
		Client.ClearCanvas(Graphics.context);

		Input.Update();
		Client.Draw();

		var i = Client.entities.length;
		var component;
		var entity;

		Graphics.context.beginPath();

		while(i--) {
			entity = Client.entities[i];
			DisplayEntityInfo(entity);
		}

		Graphics.context.stroke();

		if (selectedEntity) {
			for(component in selectedEntity.components) {
				if (Systems[component]) {
					Systems[component](selectedEntity, selectedEntity.components[component]);
				}
			}
		}

		Tileset.Draw();

		requestAnimationFrame(Client.Loop);
	};

	Client.Preload(function() {
		Tileset.InitCanvas('TileSelection', 776, 256);
		Client.Start('GameCanvas', 800, 600);
		Client.LoadLevel('/shared/levels/level1.json', Client.OnLevelLoad);

		Graphics.canvas.addEventListener('mousemove', OnMouseMove);
		Graphics.canvas.addEventListener('mousedown', OnMouseDown);
		Graphics.canvas.addEventListener('mouseup', OnMouseUp);

		EditorUI.Start();
	});

	var start = {},
		lastOffset = {},
		selectedEntity = null,
		entityStart = {};

	function DisplayEntityInfo (e) {
		Graphics.context.fillStyle = 'rgba(0, 0, 0, 1.0)';
		Graphics.context.font = 'bold 12pt sans-serif';
		if (e.name)
			Graphics.context.fillText(e.name,
				e.body.x - Graphics.offset.x, 
				e.body.y - Graphics.offset.y - 12
			);

		if (e.body.bounds && e === selectedEntity) {
			Graphics.context.rect(
				e.body.x - Graphics.offset.x, 
				e.body.y - Graphics.offset.y, 
				e.body.bounds.w, e.body.bounds.h);
		}

		Graphics.context.fillStyle = 'rgba(239, 90, 90, 0.7)';
		Graphics.context.fillRect(
			e.body.x - Graphics.offset.x, 
			e.body.y - Graphics.offset.y, 
			16, 16
		);
	}

	function CheckMouseHit (x, y) {
		var i = Client.entities.length,
			body,
			box;

		while(i--) {
			body = Client.entities[i].body;
			box = new Box(body.x, body.y, 16, 16);

			if (box.Contains(x + Graphics.offset.x, y + Graphics.offset.y)) {
				return Client.entities[i];
			}
		}
	}

	function OnMouseMove (e) {
		if (_onMouseMove)
			_onMouseMove(e);		
	}

	function OnMouseDown (e) {
		if (e.button === 2)
			_onMouseMove = _dragScreen;

		if (e.button === 0) 
			_selectEntity(e);
			
		start.x = e.offsetX;
		start.y = e.offsetY;

		lastOffset.x = Graphics.offset.x;
		lastOffset.y = Graphics.offset.y;
	}

	function OnMouseUp (e) {
		_onMouseMove = null;
	}

	var _onMouseMove = null;

	function _selectEntity (e) {
		var entity = CheckMouseHit(e.offsetX, e.offsetY);

		if (entity) {
			selectedEntity = entity;
			_onMouseMove = _dragEntity;

			entityStart.x = selectedEntity.body.x;
			entityStart.y = selectedEntity.body.y;

			EditorUI.controllers.body.entity = entity;

			_selectTileset(selectedEntity);
		}
	}

	function _selectTileset (entity) {
		var tilemap = entity.components.tilemap;

		if (tilemap)
			Tileset.tilemap = tilemap;
		else
			Tileset.tilemap = null;
	}

	function _dragEntity (e) {
		if (selectedEntity) {
			selectedEntity.body.x = entityStart.x + (e.offsetX - start.x);
			selectedEntity.body.y = entityStart.y + (e.offsetY - start.y);

			EditorUI.controllers.body.model.x = selectedEntity.body.x;
			EditorUI.controllers.body.model.y = selectedEntity.body.y;
		}
	}

	function _dragScreen (e) {
		Graphics.offset.x = lastOffset.x + start.x - e.offsetX;
		Graphics.offset.y = lastOffset.y + start.y - e.offsetY;
	}

	var Box = function(x, y, w, h) {
		this.x = x || 0;
		this.y = y || 0;
		this.w = w || 0;
		this.h = h || 0;
	};

	Box.prototype.Contains = function(x, y) {
		if (x < this.x || x > this.x + this.w) return false;
		if (y < this.y || y > this.y + this.h) return false;

		return true;
	};

});