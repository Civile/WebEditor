



	/* ====================
	 * ParentState
	*/
	ParentState = function() {
		this.App = null;
		this._C; //callbacks collection
		this._EventsNamespaces;
		this.State = StatesState.INACTIVE;
	};

	/*
	 * ParentInit
	*/
	ParentState.prototype.ParentInit = function() {
		this._EventsNamespaces = [];
		//Callbacks
		this._C = {};
		for(var i in this.Cbacks) {
			this._C[this.Cbacks[i]] = [];
		}
	};

	/*
	 * ExtendsApp
	*/
	ParentState.prototype._ExtendsApp = function() {
		for(var i in this.__Extensions) {
			var _ext = this.__Extensions[i];
			if(NULL(this.App[i])) {
				this.App[this.__Extensions[i]] = this[_ext];
			} else {
				this.App.Throw({message: "Warning: MainState -> trying to overwrite property " + i});
				continue; 
			}
		}
	};

	/*
	 * GetEventTarget
	*/
	ParentState.prototype.GetEventTarget = function(e) {
		if(NULL(e)) return null;
		else return e.target;
	};	

	/*
	 * AddCallback
	*/
	ParentState.prototype.AddCallback = function(n, f) {
		this._C[n].push(f);
		return this;
	};

	/*
	 * __CallC (call callbacks)
	*/
	ParentState.prototype.__CallC = function(n) {
		for(var i in this._C[n]) {
			this._C[n][i].call(this);
		}
	};




