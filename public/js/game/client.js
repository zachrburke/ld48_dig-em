define([
	'game/systems', 
	'game/graphics',
	'game/input',
	'shared/game/physics'
	], function(Systems, Graphics, Input, Physics) {

	// RAF shim
	window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	var Client = {

		lastFrameDelta: 0,
		lastFrameTime: new Date(),

		entities: [],

		Preload: function(callback) {
			// var requestedAssets = 0;
			// var loadedAssets = 0;
			// var onAssetLoad = function() {
			// 	loadedAssets++;
			// 	if (requestedAssets === loadedAssets && callback)
			// 		callback();
			// };

			callback();
		},

		Start: function(id, w, h) {
			Graphics.InitCanvas(id, w, h);
			Input.Initialize();
			Client.Loop();	
		},

		Loop: function() {
			var now = new Date();
			Client.lastFrameDelta = now - Client.lastFrameTime;
			Client.lastFrameTime = now;
			Physics.delta = Client.lastFrameDelta;

			Client.ClearCanvas(Graphics.context);
			Client.Update();
			Client.Draw();

			requestAnimationFrame(Client.Loop);
		},

		Update: function() {
			var i = Client.entities.length;
			var component;
			var entity;

			Physics.Update();
			Input.Update();

			while(i--) {
				entity = Client.entities[i];
				for(component in entity.components) {
					if (Systems[component]) {
						Systems[component](entity, entity.components[component]);
					}
				}
			}

		},

		Draw: function() {
			var i = Client.entities.length;
			var component;
			var entity;

			while(i--) {
				entity = Client.entities[i];
				for(component in entity.components) {
					if (Graphics.Systems[component]) {
						Graphics.Systems[component](entity, entity.components[component]);
					}
				}
			}
		},

		ClearCanvas: function(context) {
			context.clearRect(0, 0, Graphics.canvas.width, Graphics.canvas.height);
		},

		LoadLevel: function(path, callback) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState < 4 || xhr.status !== 200)
					return;

				if (xhr.readyState == 4 && callback) {
					callback(JSON.parse(xhr.response));
				}
			};
			xhr.open('GET', path, true);
			xhr.send('');
		},

		OnLevelLoad: function(levelObj) {
			var key;

			Client.entities.length = 0;
			Physics.dynamics.length = 0;
			Physics.statics.length = 0;

			for(key in levelObj) {
				Client.entities.push(new Entity(levelObj[key]));
			}
		}
	};

	var Entity = function(entityObj) {
		this.body = entityObj.body;
		this.components = entityObj.components;
		this.name = entityObj.name;
		this.hits = [];

		if (this.body.bounds) {
			var bounds = this.body.bounds;

			this.body.bounds = new Physics.AABB(this.body.x, this.body.y, bounds.w, bounds.h);
		}

		if (this.body.type == 'dynamic') {
			Physics.dynamics.push(this);
		}
		else if (this.body.type == 'static') {
			Physics.statics.push(this);
		}
	};

	Entity.prototype.Touches = function(component) {
		var i = this.hits.length, touches = [];
		while(i--) {
			if (this.hits[i].entity.components.hasOwnProperty(component))
				touches.push(this.hits[i]);
		}

		return touches;
	};

	Entity.prototype.Kill = function() {
		var index = Client.entities.indexOf(this);
		Client.entities.splice(index, 1);

		Physics.RemoveBody(this);

		if (this.components.hasOwnProperty('platformer')) {
			var is_player = this.components.platformer.is_player;
			if (is_player) 
				Client.LoadLevel('/shared/levels/leveltest.json', Client.OnLevelLoad);
		}
	};

	Client.Entity = Entity;

	return Client;
});