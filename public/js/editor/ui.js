define(['game/client', 'editor/mvc', 'shim/template'], function(Client, MVC) {

	var EditorUI = {
		selectedEntity: null,
		controllers: {},

		Start: function() {
			$('.Body').html(bodyTemplate.content.cloneNode(true));

			this.controllers.body = _newBodyController(this, '#Controls .Body');
			this.controllers.bodyNew = _newBodyController(this, '#NewEntity .Body');

			$('#Save').click(_onSave);
			$('a.Close').click(_onClose);
			$('#Delete').click(function(e) {
				_onDelete.call(EditorUI, e);
			});
			$('#NewButton').click(_onNewEntity);
			$('#NewEntity button').click(function(e) {
				_onCreate.call(EditorUI, e);
			});

			tabIndent.renderAll();
		}

	};

	var bodyTemplate = document.getElementById('BodyTemplate');

	var _bodyTypes = {
		'none': 0,
		'dynamic': 1,
		'static': 2
	};

	function _onSave (e) {
		_hideAll();
		var output = JSON.stringify(Client.entities, null, 4);
		$('#Output').show().find('textarea').html(output);
	}

	function _onClose (e) {
		var target = $(e.target);
		target.parents('.Panel').hide();
	}

	function _onDelete (e) {
		var index = Client.entities.indexOf(this.controllers.body.entity);
		if (index !== -1)
			Client.entities.splice(index, 1);

		this.controllers.body.entity = null;

		EditorUI.selectedEntity = null;
	}

	function _onNewEntity (e) {
		_hideAll();
		$('#NewEntity').show();
	}

	function _onCreate (e) {
		_hideAll();
		var newEntity = {
			body: {
				x: this.controllers.bodyNew.model.x,
				y: this.controllers.bodyNew.model.y,
				type: this.controllers.bodyNew.model.type,
				maxVel: {
					x: this.controllers.bodyNew.model.maxVelX,
					y: this.controllers.bodyNew.model.maxVelY
				},
				accel: {
					x: 0,
					y: 0
				},
				bounds: { 
					w: this.controllers.bodyNew.model.width, 
					h: this.controllers.bodyNew.model.height
				}
			},
			components: this.controllers.bodyNew.model.components
		};

		Client.entities.push(new Client.Entity(newEntity));
	}

	function _hideAll() {
		$('.Fixed').hide();
	}

	function _newBodyController(delegate, selector) {
		var bodyTest = document.querySelector(selector),
			model = new Body.Model(),
			view = new Body.View(bodyTest, model);

		return new Body.Controller(delegate, view, model);
	}

	var Body = {};

	Body.Model = function() {
		var self = MVC.Model.apply(this);

		var x = 0,
			y = 0,
			type = 0,
			maxVelX = 0,
			maxVelY = 0,
			width = 0,
			height = 0,
			components = '';

		this.clear = function() {
			this.x = 0;
			this.y = 0;
			this.width = 0;
			this.height = 0;
			this.type = 0;
		};

		self.observe(x, 'x');
		self.observe(y, 'y');
		self.observe(type, 'type');
		self.observe(width, 'width');
		self.observe(maxVelX, 'maxVelX');
		self.observe(maxVelY, 'maxVelY');
		self.observe(height, 'height');
		self.observe(components, 'components');
	};

	Body.View = function(container, model) {
		var self = MVC.View.apply(this, [container, model]);

		var position = container.getElementsByClassName('Position'),
			size = container.getElementsByClassName('Size'),
			maxVel = container.getElementsByClassName('MaxVel');

		this.elems = {};

		this.elems.x = position[0];
		this.elems.y = position[1];
		this.elems.width = size[0];
		this.elems.height = size[1];
		this.elems.maxVelX = maxVel[0];
		this.elems.maxVelY = maxVel[1];

		this.bounds = container.querySelector('.Bounds');
		this.maxVel = container.querySelector('.Speed');
		this.type = container.querySelector('select');
		this.components = container.querySelector('.Components textarea');

		$(this.bounds).hide();
		$(this.maxVel).hide();

		function bodyChanged(key, old, v) {
			self.elems[key].value = v;
		}

		function typeChanged(key, old, v) {
			self.type.selectedIndex = _bodyTypes[v];
			toggleFields();
		}

		function componentChanged(key, old, v) {
			self.components.value = JSON.stringify(v, null, 4);
		}

		function toggleFields() {
			switch (self.type.selectedIndex) {
				case 0:
					$(self.bounds).hide();
					$(self.maxVel).hide();
					break;
				case 1:
					$(self.bounds).show();
					$(self.maxVel).show();
					break;
				case 2:
					$(self.bounds).show();
					$(self.maxVel).hide();
					break;
			}
		}

		model.subscribe('x', bodyChanged);
		model.subscribe('y', bodyChanged);
		model.subscribe('type', typeChanged);
		model.subscribe('maxVelX', bodyChanged);
		model.subscribe('maxVelY', bodyChanged);
		model.subscribe('width', bodyChanged);
		model.subscribe('height', bodyChanged);
		model.subscribe('components', componentChanged);
	};

	Body.Controller = function(delegate, view, model) {
		var self = MVC.Controller.apply(this, [delegate, view, model]),
			key;

		var entity = null;

		Object.defineProperty(this, 'entity', {
			get: function() { return entity; },
			set: function(v) {
				if (!v) {
					this.model.clear();
					return;
				}
				entity = v;
				this.model.x = v.body.x;
				this.model.y = v.body.y;
				this.model.type = v.body.type;
				if (v.body.type !== 'none') {
					this.model.width = v.body.bounds.w;
					this.model.height = v.body.bounds.h;
				}
				if (v.body.type === 'dynamic') {
					this.model.maxVelX = v.body.maxVel.x;
					this.model.maxVelY = v.body.maxVel.y;
				}
				this.model.components = v.components;
			}
		});

		$.each(view.elems, function(index, el) {
			$(el).change(function(e) {
				onBodyChange(index);
			});
		});

		$(view.type).change(updateEntityType);
		$(view.components).change(updateComponents);

		function onBodyChange(key) {
			model[key] = parseInt(view.elems[key].value);

			if (self.entity) {
				updateEntityBody(self.entity, key, model[key]);
			}
		}

		function updateEntityBody(entity, key, value) {
			switch(key) {
				case 'x': 
					entity.body.x = value;
					break;
				case 'y':
					entity.body.y = value;
					break;
				case 'width':
					entity.body.bounds.w = value;
					break;
				case 'height':
					entity.body.bounds.h = value;
					break;
				case 'maxVelX':
					entity.body.maxVel.x = value;
					break;
				case 'maxVelY':
					entity.body.maxVel.y = value;
					break;
			}
		}

		function updateEntityType(e) {
			model.type = view.type.options[view.type.selectedIndex].text;

			if (!entity)
				return;

			switch (view.type.selectedIndex) {
				case 0:
					entity.body.type = 'none';
					break;
				case 1:
					entity.body.type = 'dynamic';
					entity.body.bounds = { w: 0, h: 0 };
					entity.body.maxVel = { x: 0, y: 0 };
					break;
				case 2:
					entity.body.type = 'static';
					entity.body.bounds = { w: 0, h: 0 };
					break;
			}
		}

		function updateComponents(e) {

			try {
				model.components = JSON.parse(view.components.value);
				if (entity)
					entity.components = model.components;

				$(view.components).removeClass('Error');
			}
			catch (exception) { 
				console.log(exception);
				$(view.components).addClass('Error');
			}
		}
	};

	window.EditorUI = EditorUI;

	return EditorUI;

});