define(function() {
	var Model = function(obj){
		var dependents = {};
		this.subscribe = function(key, subscriber){
			if(dependents[key] === undefined) dependents[key] = [];
			dependents[key].push(subscriber);
		};
		this.unsubscribe = function(subscriber){
			for(var key in dependents){
				var i = 0;
				var ubounds = dependents[key].length;				
				for(i; i < ubounds; i++){
					if(dependents[key][i] === subscriber){
						dependents[key].splice(i, 1);
						if(dependents[key].length === 0) delete dependents[key];
						break;
					}
				}
			}
		};
		this.changed = function(key, old, v){
			if(dependents[key] === undefined) return;
			var i = 0;
			var ubounds = dependents[key].length;
			for(i; i<ubounds; i++){
				dependents[key][i](key, old, v, this);
			}
		};
		this.observe = function(val, key) {
			Object.defineProperty(this, key, {
				get: function() { return val; },
				set: function(v) {
					var old = val;
					this.changed(key, old, v);
					val = v;
				}
			});
		};
		return this;
	};
	var View = function(container, model){
		this.container = container;
		this.model = model;
		this.release = function(){
			
		};
		return this;
	};
	var Controller = function(delegate, view, model){
		this.model = model;
		this.delegate = delegate;
		this.view = view;
		this.release = function(){
			
		};
		return this;
	};

	return {
		Controller: Controller,
		Model: Model,
		View: View
	};
});