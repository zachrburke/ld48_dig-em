define(['game/graphics'], function(Graphics) {
	var Input = {

		keysDown: {},
		keysPressed: {},

		mouse: {},
		mouseButtons: {},

		Initialize: function() {
			window.addEventListener('keydown', _onKeyDown);
			window.addEventListener('keyup', _onKeyUp);

			// todo: maybe pass the canvas as a function param?
			Graphics.canvas.addEventListener('mousemove', _onMouseMove);
			Graphics.canvas.addEventListener('mousedown', _onMouseDown);
			Graphics.canvas.addEventListener('mouseup', _onMouseUp);
		},

		KeyDown: function(key) {
			if (typeof key === 'string') key = key.charCodeAt(0);

			return Input.keysDown.hasOwnProperty(key);
		},

		KeyPressed: function(key) {
			if (typeof key === 'string') key = key.charCodeAt(0);

			return Input.keysPressed.hasOwnProperty(key);
		},

		MouseDown: function(button) {
			return Input.mouseButtons.hasOwnProperty(button);
		},

		Update: function() {
			Input.keysPressed = {};
		}
	};

	function _onMouseMove(e) {
		Input.mouse.x = e.offsetX + Graphics.offset.x;
		Input.mouse.y = e.offsetY + Graphics.offset.y;
	}

	function _onMouseDown(e) {
		Input.mouseButtons[e.button] = true;
	}

	function _onMouseUp(e) {
		delete Input.mouseButtons[e.button];
	}

	function _onKeyDown(e) {
		if (!Input.keysDown.hasOwnProperty(e.keyCode)) {
			Input.keysDown[e.keyCode] = true;
			Input.keysPressed[e.keyCode] = true;
		}
	}

	function _onKeyUp(e) {
		delete Input.keysDown[e.keyCode];
	}

	// todo: temp solution till I find good way to share node and browser js modules
	window.Input = Input;

	return Input;
});