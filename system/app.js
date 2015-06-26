/*
 ==========================================
 APPLICATION
 ==========================================
*/


/*
 * Bug da correggere subito
 * Dopo aver creato un protocollo questo non viene utilizzato dal MainState
 *
 * LO stile di default deve apparire nel modali di modifica stile
*/



(function($, w) {

	/*
	 * App
	*/
	App = function(prroot) {
		this.Conf = {
			Paths: {
				Resources: AppUrl("/system/resources/"), 
				Partials:  AppUrl("/system/resources/partials/"),
				Projects:  prroot || null 
			}
		}

		this.Cache = null;
		this.Validator = null;
		//States
		this._States = {
			_ActualStates: {},
			_Default: "MainState",
			_ToUse: ["MainState", "ContextState", "PageState"]
		};
		//Internal support
		this._Sys = {
			Protocols: null, 
			Items:null,
			Attributes:null, 
			ID: 0,
			Styles: null
		};

		this._Errors = [];
		this.__init();
		this.Loader;

		/*Chain*/
		this.Chain;

		//..extensions
	};


	/*
	 * Initialize application
	*/
	App.prototype.__init = function() {
		window.TwigGen = this;
		this.__loadSys(function() {
			this.__afterLoad();
		});
	};

	/*
	 * LoadSys
	*/
	App.prototype.__loadSys = function(c) {
		try 
		{
			this.Cache = new Cache();
			this.Validator = new Validator();
			this.Loader = new Loader(this.Cache);
		}
		catch(e) 
		{
			this.Throw(e.message);
		}
		finally { }

		this.Loader.AddResource(this.Conf.Paths.Resources + "protocols.json");
		this.Loader.AddResource(this.Conf.Paths.Resources + "items.json");
		this.Loader.AddResource(this.Conf.Paths.Resources + "styles.json");
		this.Loader.AddResource(this.Conf.Paths.Resources + "attributes.json");
		this.Loader.AddResource(this.Conf.Paths.Resources + "projects.json");

		var scope = this;
		this.Loader.OnComplete = function() {
			//callback
			if(isFunc(c))
				c.call(scope);
		};
		this.Loader.OnError = function() {
			scope.Throw(this.Errors);
		};
		this.Loader.StartLoading();
	};

	/*
	 * StartMouseDrawer
	*/
	App.prototype.__afterLoad = function() {

		//GetCacheData
		this._Sys.Protocols  = new Protocols(JSON.parse(this.Cache.GetJSON("protocols")));
		this._Sys.Items      = new Items(JSON.parse(this.Cache.GetJSON("items")), this);
		this._Sys.Styles     = new Items(JSON.parse(this.Cache.GetJSON("styles")), this);
		//this._Sys._Attributes = this.Cache.GetJSON("attributes");

		this._InitGenericEvents();
		//Initialize the chain
		this.Chain = new ChainsTree(null);
		
		/*StartStates*/
		for(var i in this._States._ToUse) {
			var s = this._States._ToUse[i];
			var sname = s.replace("State", "");
			if(this.StartState(sname, eval(s)) === null) {
				this.RequestErrors("Si è verificato un errore. ");
			}
			var _s = this.GetState(sname);
			if(_s === null)
				this.Throw({message:"Null " + sname + " state"});
		}

		//Init canvas
		$("#_canvas").width("100%").css("minHeight", $(window).innerHeight());
	};




	/*
	 * _InitGenericEvents
	 * Minimale: Metodi senza argomenti
	*/
	App.prototype._InitGenericEvents = function() {
		var app = this;
		$(document).on("click", ".nodefault", function(e) { e.preventDefault(); });

		/*Keydown*/
		$(document).on("keydown", ':not([rules=""])', function(e) {
			if(typeof $(this).attr("rules") === "undefined")
				return;
			if( $(this).attr("rules").indexOf("|") !== -1 )
				var rules = $(this).attr("rules").split("|");
			for(var i in rules) {
				var m = "_RuleEvent"+rules[i].replace("-", "");
				if(NULL(app[m])) return true;
				app["_RuleEvent"+rules[i].replace("-", "")].call(this, e);
			}
		});
		/*Click*/
		$(document).on("click", ':not([action=""])', function(e) {
			e.stopPropagation(); e.preventDefault();
			if($(e.target).attr("action")) {
				if($(e.target).attr("action").indexOf(":") !== -1) {
					var a = $(e.target).attr("action").split(":");
					for(var i in a) {
						if(a[i].indexOf(".") !== -1) {
							var state = a[i].split(".")[0];
							console.log(state);
							if(state) app.GetState(state)[a[i].replace(state+".", "")]();
						} else {
							if(!NULL(app[a[i]])) {
								app[a[i]].call(app);
							}
						}
					}
				} else {
					var a = $(e.target).attr("action");
					if(a.indexOf(".") !== -1) {
						var state = a.split(".")[0];
						if(state) app.GetState(state)[a.replace(state+".", "")]();
					}
					else
					if(!NULL(app[a]))
						app[a].call(app);
				}
			}
		});
	};
	
	/* Input Rules
	 * ==================
	 * NoSpaces
	*/
	App.prototype._RuleEventnospaces = function(e) {
		var key = e.which || e.charCode;
		if(key === 32) {
			e.preventDefault();
			return false;
		}
	};

	/*
	 * 
	*/
	App.prototype._RuleEventno_ = function(e) {
		var key = e.which || e.charCode;
		var val = $(this).val();
		if(val[val.length - 1] === " " || NULL(val[val.length - 1])) {
			if(key === 189) {
				if($(this).next(".input-info").length)
				$(this).next(".input-info").html("Il carattere '_' non è consentito");
				e.preventDefault();
				return false;
			} else { 
				$(this).next(".input-info").html(""); 
			}
		}
	};






	/*
	 * RequestErrors
	*/
	App.prototype.RequestErrors = function(msg) {
		var r = confirm(msg + "Vuoi visualizzare il report degli errori?");
		if(r === true) {
			this.PrintErrors();
		} else { return false; }
	};

	/*
	 * PrintErrors
	*/
	App.prototype.PrintErrors = function() {
		for(var i = this._Errors.length - 1; i >= 0; i--) {
			console.log("ERROR " + (i+1) + ":");
			console.log(this._Errors[i]);
			console.log("\n");
		}
	};

	/*
	 * GetState
	*/
	App.prototype.GetState = function(name) {
		if(NULL(this._States._ActualStates[name]))
			return null;
		else return this._States._ActualStates[name];
	};

	/*
	 * StateIsRunning
	*/
	App.prototype.StateIsRunning = function(name) {
		if(this.GetState(name) === null)
			return false;
		else {
			if(this.GetState(name).State === StatesState.RUNNING)
				return true;
			else return false;
		} 
	};

	/*
	 * StopState
	*/
	App.prototype.StopState = function(name) {
		if(this.StateIsRunning(name))
			this.GetState(name).Stop(function() {
				this._DelState(name);
			}, this);
	};

	/*
	 * ErrFatal
	 * is this error e fatal?
	*/
	App.prototype.ErrFatal = function(e) {
		if(NULL(e.errorType)) return false;
		else return e.errorType === ErrorsType.FATAL;
	};

	/*
	 * _DelState
	*/
	App.prototype._DelState = function(name) {
		this._States._ActualStates[name] = null;
	};

	/*
     * StartState
	*/
	ErrorsType = {
		FATAL: 1,
		WARNING: -1
	};
	App.prototype.StartState = function(name, state) {
		try {
			return this._States._ActualStates[name] = new state(this);
		} catch(e) {
			this._Errors.push({errorType: ErrorsType.FATAL, message: e.message, method: "App.StartState", args: arguments});
			return null;
		} 
	};

	/*
	 * PauseState
	*/
	App.prototype.PauseState = function(name) {
		this.GetState(name).State = StatesState.PAUSED;
		if(this.GetState(name)["OnPause"]) {
			this.GetState(name).OnPause();
		}
		return this;
	};

	/*
	 * StateIsPaused?
	*/
	App.prototype.StateIsPaused = function(name) {
		return this.GetState(name).State === StatesState.PAUSED;
	};

	/*
	 * ResumeState
	*/
	App.prototype.ResumeState = function(name) {
		//GetOldState
		var _oldState = this.GetState(name).State;
		//Resume
		this.GetState(name).State = StatesState.RUNNING;

		if(_oldState === StatesState.PAUSED) {
			if(this.GetState(name)["OnResume"]) {
				this.GetState(name).OnResume();
			}
		}
		return this;
	};

	/*
	 * Validator
	*/
	Validator = function() {};
	Validator.prototype.IsHTML = function(s) {
		return /<[a-z\][\s\S]*>/i.test(s);
	};

	/*
	 * PEC
	 * Possible events conflicts
	 * Look for possible event's conflicts in other states: ex. on the same el
	 * sname -> the state to be compared
	*/
	App.prototype.PEC = function(sname) {
		var _test = null;
		var _wstates = [];
		var s = this.GetState(sname)._EventsNamespaces;
		for(var i in s) {
			for(var x in this._States._ActualStates) {

				if(this.StateIsPaused(x))
					continue;

				var _evs = this._States._ActualStates[x]._EventsNamespaces;
				for(var z in _evs) {
					if(s[i].w == _evs[z].w) {
						if(x !== sname) {
							if(!_test) _test = [];
							_test.push({
								State: x,
								Target: s[i].w 
							});
						} 
					}
				}
			} 
		}	

		return _test;
	};

	/*
	 * Throw
	*/
	App.prototype.Throw = function(e) {
		if(NULL(e))
			return alert("Error: no specifications");
		else {
			var _m = e.message;
			alert(_m);
		}
	};

	/*
	 * GetMouseCoord
	*/
	App.prototype.GetMouseCoord = function(event) {
		return {X: event.pageX || event.clientX, Y: event.pageY || event.clientY};
	};

	/*
	 * AppendElement
	*/
	App.prototype.AppendElement = function(tag, where, cclass, attributes, style) {

		if(NULL(tag)) tag == "div";
		var _out = '<'+tag+' class="'+cclass+'" ';
		for(var i in attributes) {
			_out += i.replace("_", "-") + '=' + '"'+attributes[i]+'" ';
		}

		if(!NULL(style)) {
			_out += 'style="';
			for(var i in style) {
				_out += i + ":" + style[i] + ";";
			}
			_out += '"';
		}
		//FIX: ricava il protocollo e controlla il tag di terminazione
		$(where).append(_out + "/>");
	};

	/*
	 * ApplyStyleJSON
	 * e = element, o = style object json
	*/
	App.prototype.ApplyStyleJSON = function(e, o) {
		for(var i in o) {
			$(e).css(i, o[i]);
		}
	};

	/*
	 * GetNextID
	*/
	App.prototype.GetNextID = function() {
		return ++this._Sys.ID;
	};

	/*
	 * CountOccurrences (of a char in a string)
	*/
	App.prototype.CountOccurrences = function(string, c) {
		return (string.length - string.replace(new RegExp(c,"g"), '').length) / c.length;
	};

	/*
	 * GetClasses
	 * 
	*/
	App.prototype.GetClasses = function(t) {
		var cs = $(t).attr("class");
		cs = cs.split(" ");
		var out = "";
		for(var i in cs) {
			if( (cs[i][0] === "_") || cs[i] === "context-menu-active") continue;
			out += cs[i] + " ";		
		}
		return out;
	};

	/*
	 * GetBodyFromHTMLString
	*/
	App.prototype.GetBodyFromHTMLString = function(s) {
		if(NULL(s.split("<body")[1]))
			return console.log("warn: no body defined");
		return s.split("<body")[1].split(">").slice(1).join(">").split("</body>")[0];
	}

	/*
	 * GetHeadFromHTMLString
	*/
	App.prototype.GetHeadFromHTMLString = function(s) {
		if(NULL(s.split("<head")[1]))
			return console.log("warn: no head defined");
		return s.split("<head")[1].split(">").slice(1).join(">").split("</head>")[0];
	}


	App.prototype.GetFromHTMLString = function(w, h) {

		var out = [];
		//Load CSS
		$("body").append('<div class="__tempview"></div>');
		
		$(".__tempview").append(h).find(w).each(function() {
			out.push($(this));
		});

		$(".__tempview").remove();

		return out;
	};

	/*
	 * GetPrivateClasses
	 * todo puo essere ricorsiva
	*/
	App.prototype.GetPrivateClasses = function(t) {
		var cs = $(t).attr("class");
		cs = cs.split(" ");
		var out = "";
		for(var i in cs) {
			if( (cs[i][0] === "_") || cs[i] === "context-menu-active")
				out += cs[i] + " ";
			else continue;
		}
		return out;
	};


	/*
	 * AddClasses
	*/
	App.prototype.AddClasses = function(ar, t) {
		for(var i in ar) {
			$(t).addClass(ar);
		}
		return this;
	};

	/*
	 * Clear from private
	 * TODO, da migliorare, dinamicizzare
	*/
	App.prototype.ClearFromPrivate = function(html) {
		var out = html;

		//Remove private classes
		var c = this.GetPrivateClasses($(html)).split(" ");
		for(var i in c) {
			var _class = c[i];
			var regex = new RegExp(_class, "g");
			out = out.replace(regex, '');
		}

		//Remove private attrs
		c = this.GetPrivateAttributes($(html));
		for(var i in c) {
			var toremove = i +'="' + c[i].val + '"';
			var regex = new RegExp(toremove, "g");
			out = out.replace(regex, '');
		}
		
		return out;
	};


	/*
	 * HasStylsheetByFileName
	*/
	App.prototype.HasStylesheetByFileName = function(n) {
		var has = false;
		$("html").find("link").each(function() {
			var href = $(this).attr("href");
			href = href.split("/").pop();
			if(href === n) {
				has = true;
			}
		});

		return has;
	}


	/*
	 * SearchItemByAliasAndName 
	*/
	App.prototype.ItemsByAliasOrNameSimilarity = function(a, limit) {
		return this._Sys.Items.ItemsByAliasOrNameSimilarity(a, limit);
	};

	/*
	 * GetItemByAlias
	*/
	App.prototype.GetItemByAlias = function(a) {
		return this._Sys.Items.GetItemByAlias(a);
	};

	/*
	 * GetAlias
	*/
	App.prototype.GetAlias = function(e) {
		return $(e).attr("_alias");
	};

	/*
	 * AllItems
	 * returns all items
	*/
	App.prototype.AllItems = function(v) {
		return this._Sys.Items.All(v);
	};

	/*
	 * GetItemByAlias
	*/
	App.prototype.GetItemByTag = function(t) {
		return this._Sys.Items.GetItemByTag(t);
	};

	/*
	 * GetElementsByAttributeValue
	*/
	App.prototype.GetElementsByAttributeValue = function(atrName,atrValue) {
	    var matchElems = [];
	    var allElems = document.getElementsByTagName('*');
	    for(var x = 0, len = allElems.length; x < len; x++) {
	        if(allElems[x].getAttribute(atrName) != atrValue) {
	            continue;
	        }

	        matchElems.push(allElems[x]);
	    }

	    return matchElems;
	}

	/*
	 * HasItemByAlias
	*/
	App.prototype.HasItemByAlias = function(v) {
		return this._Sys.Items.HasItem(v);
	};


	/*
	 * AddItem/ModItem
	*/
	App.prototype.AddItem = function(n, o, c) {
		this._Sys.Items.AddItem(n, o, c);
	};
	App.prototype.ModItem = function(oldalias, o, c) {
		this._Sys.Items.ModItem(oldalias, o, c);
	};

	/*
	 * DefaultContentOf
	*/
	App.prototype.DefaultContentOf = function(o) {

	};

	/*
	 * GetVars
	 * get url vars of type GET
	*/
	App.prototype.GetVars = function() {
		var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
	};

	/*
	 * GetChainTree
	*/
	App.prototype.GetChainTree = function(s) {
		return $("#_canvas").html();
	};

	/*
	 * OpenModal
	*/
	App.prototype.OpenModal = function(p, t, vars) {
		$(t).html("");
		if(NULL(t)) t = "#modal";
			$(t).html(p);
			$(t).modal({
				opacity:80,
				overlayCss: {backgroundColor:"rgb(180, 180, 180)"}
			});
	};

	/*
     * Close Modal
	*/
	App.prototype.CloseModal = function() {
		$.modal.close();
		$("#modal").html("");
		return this;
	};

	/*
	 * OpenPageModal
	*/
	App.prototype.OpenPageModal = function(p, t, vars) {
		if(NULL(t)) t = "#modal";

		if($(t).length && $(t).html() !== "") {
			t = "#modal" + ($(t).length + 1);
			$("body").append('<div id="'+t.replace("#", "")+'" class="_modal"></div>');
		} 

		$(t).load(p, vars, function() {
			$(t).modal({
				opacity:80,
				overlayCss: {backgroundColor:"rgb(180, 180, 180)"}
			});
		});
	};





	/*
	 * AjaxCall
	*/
	App.prototype.AjaxCall = function(u, a, s, e) {

		if(a instanceof Object) {
			a = this.SerializeObject(a);
		}

		//if(this.Cache.Has("ajax"))
		//	this.Cache.Get("ajax").abort();

		var ac = $.ajax({
			type: "post",
			data: a,
			url:  u,
			success: function(d) {
				if(typeof s === "function")
					s.call(this, d);
			},
			error: function(xhr, status, error) {
				console.log(xhr);
			},
			fail: function(e) {
				console.log("Ajax failed---");
				console.log(e);
			}
		});
	};

	/*
	 * GetJSONItemBy
	*/
	App.prototype.GetJSONItemBy = function(n, v, w) {
		for(var i in w) {
				if(w[i][n] === v)
					return w[i];
		} return null;
	};

	/*
	 * SerializeObject
	*/
	App.prototype.SerializeObject = function(params) {
		var query = "";
		var length = 0;
		for(var i in params) {
			query += (length == 0 ? "" : "&") + i + "=" + params[i];
			length++;
		}
		return query;
	};

	/*
	 * IsDollarVar
	*/
	App.prototype.IsDollarVar = function(v) {
		return v.indexOf("$") !== -1;
	};

	/*
	 * GetTag
	*/
	App.prototype.GetTag = function(e) {
		if(NULL(e)) return null;
		return $(e).prop("tagName").toLowerCase()
	};
	App.prototype.GetTagByHTMLObj = function(o) {
		return this.GetTag(o);
	};

	/*
	 * CanReceiveChildren
	 //todo migliora
	*/
	App.prototype.CanReceiveChildren = function(e) {
		var no = ["textarea", "input"];
		var tag = this.GetTag(e);
		var pr = this.GetItemByTag(tag);
		if(NULL(pr)) return true;
		pr = pr.protocol;
		if(pr.indexOf('</'+tag+'>') !== -1 && no.indexOf(tag) === -1)
			return true;
		return false;
	};

	/*
	 * GetItemByHTMLObj
	*/
	App.prototype.GetItemByHTMLObj = function($o) {
		return this.GetTag($o);
	};

	/*
	 * UpdateChainID
	*/
	App.prototype.UpdateChainID = function(p) {
		var chainid = $(p).attr("_chain-id");
		
		if(NULL(chainid)) //body
			chainid = "";
		else chainid += ".";

		var app = this;
		var id = 0;
		$(p).children().each(function(i) {
			if(!$(this).hasClass("_caption-chained")) return;
			$(this).attr("_chain-id", chainid + (id));
			if($(this).children().length)
				app.UpdateChainID(this);
			id++;
		});
	};

	/*
	 * UpdateUID
	*/
	App.prototype.UpdateUID = function(_w) {
		var app = this;
		if(NULL(_w)) _w = "body";
		$(_w).find("*").each(function() {
			$(this).attr("_uid", tg.GetNextID() );
			tg.UpdateUID($(this));
		});
	};

	/*
	 * EmpoweContainer
	 * Makes a container available for operations
	*/
	App.prototype.EmpowerContainer = function(w) {
		this.MakePotential(w);
		this.UpdateChainID(w); 
		this.UpdateUID(w);
		return this;
	};

	/*
	 * HasElement
	*/
	App.prototype.HasElementByAttr = function(i, v) {
		console.log("["+i+"='"+v+"']");
		return $("["+i+"='"+v+"']").length;
	};

	/*
	 * GetProtocolAttributes
	*/
	App.prototype.GetProtocolAttributes = function(alias) {
		var out = {variables: {}, consts: {}};
		var a = this.GetItemByAlias(alias);
		if(a) {
			var pr = a.protocol;
			var ats = $(pr)[0].attributes;
			for(var i in ats) {
				var at = ats[i];

				if(typeof at !== "function" && typeof at !== "undefined") { 
					//Get usable attributes
					var n = (typeof at.name !== "undefined" ? at.name : null);
					var v = (typeof at.value !== "undefined"? at.value : null);

					if(NULL(n) || NULL(v))
						continue;

					if(this.IsDollarVar(v) == false)
						out["consts"][n] = {
							alias: n,
							val: v
						};
					else
						out["variables"][n] = {
							alias: this.IsDollarVar(v) ? v.replace('$', '') : n, 
							val:   this.IsDollarVar(v) ? "" : v
						};
				}
			}
		}
		return out;
	};

	/*
	 * GetPublicAttributes
	*/
	App.prototype.GetPublicAttributes = function(t, alias) {
		var _pat = this.GetProtocolAttributes(alias);
		var _cats = $(t)[0].attributes;
		for(var i in _cats) {
			var cat = _cats[i];
			if(typeof cat !== "function" && typeof cat !== "undefined") { 
				
					//Get usable attributes
					var n = (typeof cat.name !== "undefined" ? cat.name : null);
					var v = (typeof cat.value !== "undefined"? cat.value : null);

					if(NULL(n) && NULL(v) 
						|| n[0] === "_" 
						|| n === "style" 
						|| n === "class"
						|| typeof _pat["consts"][n] !== "undefined")
						continue;
					
					_pat["variables"][n] = {
						alias: n,
						val: this.IsDollarVar(v) ? "" : v
					};
				}	
		}

		return _pat["variables"];

	};


	/*
	 * GetPrivateAttributes
	*/
	App.prototype.GetPrivateAttributes = function(t, alias) {
		var _pat = this.GetProtocolAttributes(alias);
		var _cats = $(t)[0].attributes;
		for(var i in _cats) {
			var cat = _cats[i];
			if(typeof cat !== "function" && typeof cat !== "undefined") { 
				
					//Get usable attributes
					var n = (typeof cat.name !== "undefined" ? cat.name : null);
					var v = (typeof cat.value !== "undefined"? cat.value : null);

					if(NULL(n) && NULL(v) || n[0] !== "_" )
						continue;
					
					_pat["variables"][n] = {
						alias: n,
						val: this.IsDollarVar(v) ? "" : v
					};
				}	
		}

		return _pat["variables"];

	};


	/*
	 * ObjLength
	*/
	App.prototype.ObjLength = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

	/*
	 * AddClassesRecursive
	*/
	App.prototype.AddClassesRecursive = function(w,classes) {
		for(var i in classes) {
			$(w + " *").addClass(classes[i]);
		}
		return this;
	};

	/*
	 * MakePotential
	*/
	App.prototype.MakePotential = function(w) {
		this.AddClassesRecursive(w, ["_potential", "_caption-chained"]);
	};

	/*
	 * ObjectIsInArray
	*/
	App.prototype.ObjectIsInArray = function(prop, val, array) {
		for(var i in array) {
			if(array[i][prop] === val)
				return true;
		} return false;
	};

	/*
	 * GetProjects
	*/
	App.prototype.GetProjects = function() {
		return JSON.parse(this.Cache.GetJSON("projects"))["Projects"];
	};

	/*
	 * EmptyBody
	*/
	App.prototype.EmptyBody = function() {
		$("html").find("._caption-chained").each(function() {
			$(this).remove();
		});
		return this;
	};

	/*
	 * EmptyStyle
	*/
	App.prototype.EmptyStyle = function() {
		 $("html").find("link[_origin='_project']").each(function() {
		 	$(this).remove();
		 });
	};

	/*
	 * Apply style from JSON
	*/
	App.prototype.AppendStyleFromJSON = function(json, name) {

		var sel = "style[_style-name='"+ name +"']";

		if($("head").find(sel)) 
			$("head").find(sel).remove();
		
		var css = "\n" + CSSJSON.toCSS(json);
		if(NULL(css) || css == "") 
			return;

		$("head").append('<style _style-name="'+ name +'"></style>')
			.find(sel).text(css);

		return this;
	};

	/*
     * AppendStyle
     * s: css string
     * n: css link name
	*/
	App.prototype.AppendStyle = function(s, n) {
		var sel = "style[_style-name='"+ n +"']";

		if(!$("head").find(sel).length) {
			$("head").append('<style _style-name="'+ n +'"></style>');
		}

		$("head").find(sel).append(s);
		return this;
	};


	/*
	 * GetProjectStyle
	*/
	App.prototype.GetProjectStyle = function(name) {
		return $("head").find("style[_style-name='"+ name +"']").text();
	};

	/*
	 * GetProjectStyleAsJSON
	*/
	App.prototype.GetProjectStyleAsJSON = function(name) {
		var css = $("head").find("style[_style-name='"+ name +"']").text();
		if(css) {
			return CSSJSON.toJSON(css);
		} else return null;
	};
	

	/* ===============================
	 * Protocols manager
	*/
	Protocols = function(data) {
		this.Data = data || null;
	};

	/*
	 * GetByName
	*/
	Protocols.prototype.GetByName = function(pn) {
		if(this.HasProtocol(pn))
			return this.Data.Protocols[pn];
		else return null;
	};

	/*
	 * HasProtocol
	*/
	Protocols.prototype.HasProtocol = function(pn) {
		return (typeof this.Data.Protocols[pn] !== "undefined");
	};

	/*
	 * AddProtocol
	*/
	Protocols.prototype.AddProtocol = function(n, s) {
		this.Data.Protocols[n] = s;
		return this;
	};

	/*
	 * RemoveProtocol
	*/
	Protocols.prototype.RemoveProtocol = function(pn) {
		return delete this.Data.Protocols[pn];
	};







	/* ===============================
	 * Items manager
	*/
	Items = function(data, app) {
		this.App = app || null;
		this.Data = data || null;
	};

	/*
	 * GetByName
	*/
	Items.prototype.GetByName = function(pn) {
		if(this.HasItem(pn))
			return this.Data.Items[pn];
		else return null;
	};

	/*
	 * HasItem
	*/
	Items.prototype.HasItem = function(pn) {
		return (typeof this.Data.Items[pn] !== "undefined");
	};

	/*
	 * RemoveItem
	*/
	Items.prototype.RemoveItem = function(pn) {
		return delete this.Data.Items[pn];
	};

	/*
	 * GetItemByAlias
	*/
	Items.prototype.GetItemByAlias = function(a) {
		var l = this.Data.Items;
		for(var i in l) {
			if(l[i].alias === a) {
				return l[i];
			}
		}
		return null;
	};

	/*
	 * All
	*/
	Items.prototype.All = function(v) {
		var out = [];
		for(var i in this.Data.Items) {
			if(v === "visible" && !this.Data.Items[i].visible)
				continue;
			
			out.push(this.Data.Items[i]);
		}
		return out;
	};

	/*
	 * GetItemByTag
	*/
	Items.prototype.GetItemByTag = function(t) {
		var l = this.Data.Items;
		for(var i in l) {
			if(l[i].tag === t) {
				return l[i];
			}
		}
		return null;
	};

	/*
	 * ItemsByAliasOrNameSimilarity
	*/
	Items.prototype.ItemsByAliasOrNameSimilarity = function(a, limit) {
		var _out = [];
		if(NULL(limit)) limit = Infinity;
		var l = this.Data.Items;
		for(var i in l) {
			if(_out.length >= limit)
				break;
			var el = l[i];
			if(i.includes(a) || el['tag'].includes(a)) {
				_out.push(el);
			} 
		}
		return _out;
	};
	
	/*
	 * AddItem
	*/
	Items.prototype.AddItem = function(n, o, c, e, overwrite) {
		//Save data via PHP
		var app = this;
		if(this.HasItem(n) && overwrite !== true) 
			return {error: "Item " + n + " already defined"};

		this.MakeCompatibleObject(o);
		this.Data.Items[n] = o;
		if(!o.icon) o.icon = "plus-square-o";
		this.App.AjaxCall(AppUrl("/server/"), {cmd: "saveItemsList", items:JSON.stringify(this.Data)}, function(d) {
			if(typeof c === "function")
				c.call(this, d);
		}, function(d) { // error, remove inserted item
			delete app.Data.Items[n];
			if(typeof e === "function")
				e.call(app.App, d);
		});	
	};

	/*
	 * ModItem
	*/
	Items.prototype.ModItem = function(oldalias, o, c) {
		if(this.HasItem(oldalias))
			delete this.Data.Items[oldalias];
		return this.AddItem(o.alias, o, c, null, true);
	};


	/*
	 * MakeCompatibleObject
	*/
	Items.prototype.MakeCompatibleObject = function(o) {
		return;
		if(NULL(o)) return;
		for(var i in o) {
			o[i.replace("-", "_")] = o[i].replace(/\"/g, '\"').replace(/\-/g, '_');
			if(i.indexOf("-") !== -1)
				delete o[i];
		}
	};
















	/* =========================
	 * ChainsTree
	*/
	ChainsTree = function(chain) {
		this.___Tree = chain || {};
	};

	/*
	 * AddBranch
	*/
	ChainsTree.prototype.AddBranch = function(c, t) {
		var tid = $(t).attr("_chain-id");
		if(!tid) {
			return { ParentRing:true, id: $("._parent-ring").length }
		} else { //computer
			var __totc        = $(t).find(" > *").length;
			var __computed_id = tid + "." + __totc;
			var __steps       = __computed_id.split(".");
			var __max_step    = __steps.pop();
			var __ring        = parseInt(__steps[0]);
			//AGGIUNGI A ALBERO
			return { ParentRing:false, id: __computed_id };
		}
	};

	/*
	 * InsertBranch
	*/
	ChainsTree.prototype.InsertBranch = function() {

	};

	/*
     * GetChainId
	*/
	ChainsTree.prototype.GetChainID = function() {

	};






	/* ====================
	 * Enum: StatesSte 
	*/
	StatesState = {
		RUNNING:  1,
		PAUSED:   2
	};





	/* =====================
     * State MainState
	*/
	MainState = function(a) {
		ParentState.call(this);
		this.App = null;
		this.State = StatesState.INACTIVE;
		this._Action = {
			Coord: {
				Start: new Vector(null ,null),
				End:   new Vector(null ,null)
			},
			Target: null,
			Item: null,
			LasItem: null
		};
		this.Conf = {
			Caption: {Class: "_caption-temp"}
		}

		/*Callbacks*/
		this.Cbacks = [
			"OnCaptionStart",
			"OnCaptionFinish",
			"OnCaptionMove"
		];
		//Function
		this.GraphicInterfaceUpdate = null;

		this._Init(a);
	};


	MainState.prototype = Object.create(ParentState.prototype);
	MainState.prototype.constructor = MainState;

	/*
	 * Init
	*/
	MainState.prototype._Init = function(a) {
		this.ParentInit();
		this.App = a || null;
		if(NULL(this.App))
			throw({message: "MainState: undefined app"});
		else 
		{	
			try 
			{
				/*Load tools then run*/
				this.LoadTools(function() {
					this.Run();
					this.UseItem(this.App.GetItemByTag("div"));
				});
			}
			catch(e) 
			{
				throw "MainState: " + e.message;
			}
			
			this.State = StatesState.RUNNING;
		}
	};

	/*
	 * Run
	*/
	MainState.prototype.Run = function() {
		if(this._ExtendsApp) {
			this._ExtendsApp.call(this);
		}
		
		var app = this.App;

		/*Drawing events*/
		this.StartEvent(document, "mousedown", "drawing", 
			this._EventMouseDown
		);
		this.StartEvent(document, "mouseup",   "drawing", 
			this._EventMouseUp
		);
		this.StartEvent(document, "mousemove", "drawing", 
			this._EventMouseMove
		);

		/*Double click - html editor*/
		var __clicks = 0, __delay = 150, __timer = null;
		$(document).on("click", "._caption-chained", function() {
			var el = this;
			__clicks++;
		    __timer = setTimeout(function() {
		        switch(__clicks) {
		            case 2:
		            	/*Get interesting content*/
		            	var par = $(el).clone();
		            	var partag = app.GetTag(par);
		            	if(partag === "body" || partag === "html")
		            		return;
		            	
		            	_c =  $(par).html().replace(/(\r\n|\n|\r)/gm,"")

	               		app.OpenPageModal(app.Conf.Paths.Partials + "ElementTiny.php", null, {
	               			content: _c.replace(/[']+/g, ''), 
            				chainid: $(el).attr('_chain-id') 
	               		});
		            break;            
		        }
		        __clicks=0;
	    	}, __delay);
		});

	};

	/*
	 * AppendTools
	*/
	MainState.prototype.LoadTools = function(c) {
		var ctx = this;
		$("footer ._tools-temp").append('<div class="dwr-tools"></div>');
		$("footer ._tools-temp .dwr-tools").load(this.App.Conf.Paths.Partials + "MainStateTools.html", function(d) {
			$("footer").append(d);
			$(".dwr-tools").remove();
			if(typeof c === "function") {
				c.call(ctx);
			}
		});
	};

	/*
	 * ClearAction
	*/
	MainState.prototype.ClearAction = function() {
		this.ClearTarget();
		return this;
	};

	/*
	 * EventMouseDown
	*/
	MainState.prototype._EventMouseDown = function(e) {	
		this.ClearAction();

		var k = e.which; 
		if(k !== 1)
			return;

		var $et = $(this.GetEventTarget(e));
		//Can't append anything inside these objects...
		if(!$et.hasClass("_potential") || !this.App.CanReceiveChildren(this.GetEventTarget(e)))
			return;

		this.SetTarget(this.GetEventTarget(e)).addClass("_caption-target");
		var app = this.App;
		var c = app.GetMouseCoord(e);
		var ac = this._Action.Coord.Start;
		
		this.SetPointerStart(c)
			.CreateCaption()
			.SetCaptionStyle({left: ac.X - 2, top: ac.Y - 2 });

		//Apply protocol
		this.ApplyProtocol(this.CurrentItem(), "._caption-temp");

		//Callbacks
		this.__CallC("OnCaptionStart");
	};

	/*
	 * EventMouseUp
	*/
	MainState.prototype._EventMouseUp = function(e, thisctx) {
		this.ReleaseCaption().ReleaseTarget().__FinalizeCaption()
			.__CallC("OnCaptionFinish");
		return this;
	};

	/*
	 * EventMouseMove
	*/
	MainState.prototype._EventMouseMove = function(e, thisctx) {
		var app = this.App;
		var c = app.GetMouseCoord(e);
		var cbox = {};
		this.SetPointerEnd(c)
			.GetCaptionBox(cbox)
			.SetCaptionStyle({width: cbox.Width, height: cbox.Height });

		this.__CallC("OnCaptionMove");
	};

	/*
	 * UseItem
	*/
	MainState.prototype.UseItem = function(i) {
		if(this._Action.LastItem != i)
			this._Action.LastItem = jQuery.extend(true, {}, this._Action.Item);
		this._Action.Item = i;
		return this;
	};

	/*
	 * ResumeLastItem
	*/
	MainState.prototype.ResumeLastItem = function() {
		this._Action.Item = jQuery.extend(true, {}, this._Action.LastItem);
		return this;
	};

	/*
	 * UpdateGraphicInterface
	 ** customized func
	*/
	MainState.prototype.UpdateGraphicInterface = function() {
		if(typeof this.GraphicInterfaceUpdate === "function") {
			this.GraphicInterfaceUpdate.call(this);
		}
	};

	/*
	 * CurrentItem
	*/
	MainState.prototype.CurrentItem = function() {
		return this._Action.Item;
	};

	/*
	 * SetTarget
	*/
	MainState.prototype.SetTarget = function(t) {
		this._Action.Target = t;
		return $(t);
	};

	/*
	 * CurrentTarget
	*/
	MainState.prototype.CurrentTarget = function() {
		return this._Action.Target;
	};

	/*
	 * ClearTarget
	*/
	MainState.prototype.ClearTarget = function() {
		this._Action.Target = null;
	};

	/*
	 * SetPointerStart
	*/
	MainState.prototype.SetPointerStart = function(obj) {
		this._Action.Coord.Start.Set(obj.X, obj.Y);
		return this;
	};

	/*
	 * SetPointerEnd
	*/
	MainState.prototype.SetPointerEnd = function(obj) {
		this._Action.Coord.End.Set(obj.X, obj.Y);
		return this;
	};

	/*
	 * CreateCaption
	*/
	MainState.prototype.CreateCaption = function() {
		if(this.CurrentItem())
			this.App.AppendElement(this.CurrentItem().tag, "#_canvas", "abs " + this.Conf.Caption.Class);
		return this;
	};

	/*
	 * GetCaptionBox
	*/
	MainState.prototype.GetCaptionBox = function(/*&*/cbox) {
		cbox.Width  = this._Action.Coord.End.X - this._Action.Coord.Start.X;
		cbox.Height = this._Action.Coord.End.Y - this._Action.Coord.Start.Y;
		return this;
	};

	/*
	 * ReleaseCaption
	*/
	MainState.prototype.ReleaseCaption = function() {
		if((c = this.GetCurrentCaption()) !== null) 
		{
			$(".__last").removeClass("__last");
			if(!this.__SatisfyMinimumDimension(c)) return this.RemoveCurrentCaption();
			c.removeClass("abs")
				.removeClass(this.Conf.Caption.Class)
				.addClass("_caption-chained")
				.addClass("_potential")
				.attr("_alias", this._Action.Item.alias)
				.appendTo(this._Action.Target);

				//Compute chain id
				var chain = this.AddAndComputeChainID("._caption-temp", this.CurrentTarget());
				c.attr("_chain-id", chain.id).addClass("__last");
				if(chain.ParentRing)
					c.addClass("_parent-ring");

				//Set default content
				//var cont = this.GetContentOfItem(this->CurrentItem());
		}
		return this;
	};

	/*
	 * ClearLastCaptionStyle
	 * rimuove gli attributi che non sono più utili
	*/
	MainState.prototype.__ClearLastCaptionStyle = function() {
		$(".__last").css("left", "").css("top", "");
		return this;
	};

	/*
	 * FinalizeCaption
	*/
	MainState.prototype.__FinalizeCaption = function() {
		this.__ClearLastCaptionStyle();
		//Default Style
		var defstyle = null;
		if(this.CurrentItem()) {
			if(!NULL(this.CurrentItem().default_style) && this.CurrentItem().default_style != "") {
				this.App.ApplyStyleJSON(".__last", this.CurrentItem()["default_style"].attributes);
			}
			if(!NULL(this.CurrentItem().protocol) && this.CurrentItem().protocol != "") {
				this.LastCaption().html($(this.CurrentItem().protocol).text());
			}
		}
		this.SetUniqueID(".__last", this.App.GetNextID());

		return this;
	};

	/*
	 * LastCaption
	 * returns last added element
	*/
	MainState.prototype.LastCaption = function() {
		return $(".__last");
	};

	/*
	 * SetUniqueID
	*/
	MainState.prototype.SetUniqueID = function(w, id) {
		$(w).attr("_uid", id);
		return this;
	};

	/*
	 * ApplyProtocol
	*/
	MainState.prototype.ApplyProtocol = function(a, w) {
		//Apply protocol
		if(NULL(this.CurrentItem())) return;
		
		var pr = $(this.CurrentItem()["protocol"]);
		if(!this.IsProtocol(pr)) return;
		var at = $(this.CurrentItem()["protocol"])[0].attributes;
		for(var i in at) {
			if(typeof at[i] !== "function" && typeof at[i] !== "undefined") {
				var n = (typeof at[i].name !== "undefined" ? at[i].name : null);
				var v = (typeof at[i].value !== "undefined"? at[i].value : null);
				if(n && !this.App.IsDollarVar(n)) {
					if(!this.App.IsDollarVar(v)) {
						if(NULL($(w).attr(n)))
							$(w).attr(n, v);
						else $(w).attr(n, $(w).attr(n) + " " + v);
					}
				}
			}
		}
	}

	/*
	 * IsProtocol
	*/
	MainState.prototype.IsProtocol = function(pr) {
		if(NULL(pr)) return false;
		if(typeof pr == "array")
			return pr.length != 0;
		return true;
	}



	/*
	 * ComputeChainID
	*/
	MainState.prototype.AddAndComputeChainID = function(c, t) {
		return this.App.Chain.AddBranch(c, t);
	};

	/*
	 * ReleaseTarget
	*/
	MainState.prototype.ReleaseTarget = function() {
		$("._caption-target").removeClass("_caption-target");
		this._Action.Target = null;
		return this;
	};

	/*
	 * SatisfyMinimumDimension
	*/
	MainState.prototype.__SatisfyMinimumDimension = function(c) {
		return ($(c).width() > 2 && $(c).height() > 2);
	}

	/*
	 * GetCurrentCaption
	*/
	MainState.prototype.GetCurrentCaption = function() {
		return $("." + this.Conf.Caption.Class);
	};

	/*
	 * RemoveCurrentCaption
	*/
	MainState.prototype.RemoveCurrentCaption = function() {
		$("." + this.Conf.Caption.Class).remove();
		return this;
	};

	/*
	 * SetCaptionStyle
	*/
	MainState.prototype.SetCaptionStyle = function(st) {
		$("."+this.Conf.Caption.Class).css(st);
		return this;
	};

	/*
     * StartEvent
     * w:where, e:event, n:namespace, f:func
 	*/
	MainState.prototype.StartEvent = function(w, e, n, f) {
		//StartEvent
		var self = this;
		var _ev = {
			w: w,
			e: e,
			n: n,
			f: function(e) {
				if(self.State !== StatesState.PAUSED) {
					f.call(self, e);
				}
			}
		};
		//Append event
		$(_ev.w).on(_ev.e +"."+ _ev.n, _ev.f);

		//SaveNamespace
		this._EventsNamespaces.push(_ev);
	};

	/*
	 * Pause
	*/
	MainState.prototype.OnPause = function() { };

	/*
	 * OnResume
	*/
	MainState.prototype.OnResume = function() { };

	/*
	 * _NullEvents
	*/
	MainState.prototype._OffEvents = function() {
		for(var i in this._EventsNamespaces) {
			var _ev = this._EventsNamespaces[i];
			$(_ev.w).off("."+_ev.n);
		}
	};

	/*
 	 * Stop
	*/
	MainState.prototype.Stop = function(c, ctx) {

		for(var i in this.__Extensions) {
			delete this.App[i];
		}

		this._OffEvents();

		//StopState
		if(isFunc(c)) {
			c.call(ctx);
		}
	};






	/* ===========================
	 * ParentState
	*/
	ContextState = function(a) {
		ParentState.call(this);
		this.App;
		this.Action = {
			Target:null,
			Copied: []
		};
		this._Init(a);
	};


	ContextState.prototype = Object.create(ParentState.prototype);
	ContextState.prototype.constructor = ParentState;

	/*
	 * _Init
	*/
	ContextState.prototype._Init = function(a) {
		this.ParentInit();
		this.App = a || null;
		if(NULL(this.App))
			throw({message: "ContextState: undefined app"});
		else 
		{	
			/*Load tools then run*/
			this.LoadTools(function() {
				this.Run();
			});

			this.State = StatesState.RUNNING;
		}
	};


	/*
	 * LoadTools
	*/
	ContextState.prototype.LoadTools = function(c) {
		var ctx = this;
		$("footer ._tools-temp").append('<div class="ctx-tools"></div>');
		$("footer ._tools-temp .ctx-tools").load(this.App.Conf.Paths.Partials + "ContextStateTools.php", function(d) {
			$("footer").append(d);
			$(".ctx-tools").remove();
			if(typeof c === "function") {
				c.call(ctx);
			}
		});
	};


	/*	
	 * Run
	*/
	ContextState.prototype.Run = function() {
		var self = this;
		
	    $.contextMenu({
	        selector: '._potential', 
	        callback: function(key, options) {

	        	if(!self.Action.Copied.length) {
	        		$("li.icon-paste").hide();
	        	} else $("li.icon-paste").show();

	        	self.ContextMainCallback(self, key, options, this);
	        },
	        items: {
	            "Zoom": {name: "Zoom", icon: "edit"},
	            "Cut": {name: "Taglia", icon: "cut"},
	            "Copy": {name: "Copia", icon: "copy"},
	            "Paste": {name: "Incolla", icon: "paste"},
	            "NullCopy": {name: "Annulla copia", icon: "null-copy"},
	            "Free": {name: "Libera", icon: "free"},
	            "Delete": {name: "Rimuovi", icon: "delete"},
	            "LoadIn": {name: "Carica", icon: ""},
	            "Attributi": {
                	"name": "Attributi",
                	"items": {
                		"Class": {"name": "Classe/ID"},
                		"Values": {"name": "Valori"},
                		"Style": {"name": "Stile"}
                	}
                },
	            "Quit": {name: "Quit", icon: "quit"}
	        }
	    });

	    //Init
		$(".context-menu-list li.icon-paste").hide(); 
		$(".context-menu-list li.icon-null-copy").hide();
	    
	};

	/*
	 * ContextMainCallback
	*/
	ContextState.prototype.ContextMainCallback = function(ctx, key, options, t) {
		//Set current target
        ctx.SetTarget(this);
        var ev = "_Event" + key;
        if(!NULL(ctx[ev])) {
        	ctx[ev].call(ctx, t);
        }
        ctx.NullTarget.call(ctx);
	}

	/*
	 * NullTarget
	*/
	ContextState.prototype.NullTarget = function() {
		this.Action.Target = null;
		return this;
	};


	ContextState.prototype._EventFree = function(t) {
		$(t).width("");
	};

	/*
	 * SetTarget
	*/
	ContextState.prototype.SetTarget = function(t) {
		this.Action.Target = t;
	};

	/*
	 * EventDelete
	*/
	ContextState.prototype._EventDelete = function(t) {
		if(confirm("Sicuro di voler eliminare l'elemento e i tutti i suoi contenuti?"))
			this.RemoveElementByChainID($(t).attr("_chain-id"));
	};

	/*
	 * EventZoom
	*/
	ContextState.prototype._EventZoom = function(t) {
		
		var item = this.GetItem(t);
		if(!item)
			return;

		var p = {
			chainid: $(t).attr("_chain-id"),
			item: JSON.stringify(item),
			content: $(t).html()
		};

		this.App.OpenPageModal(TwigGen.Conf.Paths.Partials + "ElementZoom.php", null, p);
	};

	/*
	 * EventValues
	*/
	ContextState.prototype._EventValues = function(t) {
		
		var item = this.GetItem(t);
		if(!item)
			return;

		var p = {
			chainid: $(t).attr("_chain-id"),
			item: JSON.stringify(item)
		};

		this.App.OpenPageModal(TwigGen.Conf.Paths.Partials + "ElementValues.php", null, p);
	};

	/*
	 * EventStyle
	*/
	ContextState.prototype._EventStyle = function(t) {

		var item = this.GetItem(t);
		if(!item)
			return;

		var p = {
			chainid: $(t).attr("_chain-id"),
			item: JSON.stringify(item)
		};

		this.App.OpenPageModal(TwigGen.Conf.Paths.Partials + "ElementStyle.php", null, p);
	};

	/*
	 * EventHTML
	*/
	ContextState.prototype._EventHTML = function(t) {
		
		var item = this.GetItem(t);
		if(!item)
			return;

		var p = {
			chainid: $(t).attr("_chain-id"),
			item:    JSON.stringify(item),
			uid:     $(t).attr("_uid"),
			classes: this.App.GetClasses($(t)),
			id:      $(t).attr("id") || "",
			html: $(t).html()
		};

		this.App.OpenPageModal(TwigGen.Conf.Paths.Partials + "ElementHTML.php", null, p);
	};

	/*
	 * Class
	*/
	ContextState.prototype._EventClass = function(t) {
		
		var item = this.GetItem(t);
		if(!item) {
			this.App.Cache.SetData("_EventClassItem", t);
			this.App.Cache.SetData("_EventClass", function() {
				this.GetState("Context")._EventClass(this.Cache.GetData("_EventClassItem"));
				this.Cache.DelData("_EventClass").DelData("_EventClassItem");
			});
			return this.App.OpenPageModal(TwigGen.Conf.Paths.Partials + "AddItem.php", null, {
				element: this.App.GetTag(t),
				callback: "_EventClass"
			});
		}

		var p = {
			chainid: $(t).attr("_chain-id"),
			item:    JSON.stringify(item),
			uid:     $(t).attr("_uid"),
			classes: this.App.GetClasses($(t)),
			id:      $(t).attr("id") || ""
		};
		this.App.OpenPageModal(TwigGen.Conf.Paths.Partials + "ElementClass.php", null, p);
	};

	/*
	 * EventCopy
	*/
	ContextState.prototype._EventCopy = function(t) {
		var cloned = $(t).clone();
		//ClearCloned
		$(cloned).removeClass("context-menu-active");
		//Mem
		if(!this.HasInCopy(cloned))
			this.Action.Copied.push(cloned);

		$(".context-menu-list li.icon-paste").show();
		$(".context-menu-list li.icon-null-copy").show();
	};

	/*
	 * EventCut
	*/
	ContextState.prototype._EventCut = function(t) {
		if(!this.HasInCopy(t)) {
			this.Action.Copied.push(t);
			$(t).remove();
		}

		$(".context-menu-list li.icon-paste").show();
		$(".context-menu-list li.icon-null-copy").show();
	};

	/*
	 * EventNullCopy
	*/
	ContextState.prototype._EventNullCopy = function(t) {
		this.ClearCopied();
		$(".context-menu-list li.icon-paste").hide(); 
		$(".context-menu-list li.icon-null-copy").hide();
	};

	/*
	 * EventPaste
	*/
	ContextState.prototype._EventPaste = function(t) {
		for(var i in this.Action.Copied) {
			var el = this.Action.Copied[i];
			$(t).append(el);
		}
		this.ClearCopied();
		this.App.UpdateChainID($("html"));
		
		$(".context-menu-list li.icon-paste").hide(); 
		$(".context-menu-list li.icon-null-copy").hide();
	};


	/*
	 * LoadIn
	 * TODO : scripts?
	*/
	ContextState.prototype._EventLoadIn = function(t) {
		//Prepare ExplorerCallback
		this.App.Cache.SetData("ExplorerCallback", function(file) {
		   	if(this.App.GetState("Page").FileAllowed(file)) {
		   		file = file.replace("../", '/');
		   		
		   		var page = file.split("/").pop();
				var _tmp = file.split("/");
				var project = _tmp[_tmp.length - 2];

		   		var _self = this;
		   		this.App.AjaxCall(AppUrl("/server/index.php"), {cmd:"loadLayout", project:project, page:page }, function(d) {				
					d = JSON.parse(d);
					console.log(d);
					if(!NULL(d.error)) {
						alert("Error: " + d.error);
					} else {

						//Load body content
			   			if($(t).html()) {
			   				if(confirm("L'elemento non e' vuoto. Sei sicuro di voler sovrascriverne il contenuto?"))
			   					$(t).html(d.body);
			   			} else $(t).html(d.body);

			   			//Load css
			   			if(d.css_content) {
			   				_self.App.AppendStyle(d.css_content, "project-style");
			   			}

			   			_self.App.EmpowerContainer("#_canvas");
					}    			

		   		});
   			} else alert("Loader: file " + file + "not allowed");
		}).SetData("ExplorerContext", this);
		
		//Open file explorer
		this.App.OpenPageModal(TwigGen.Conf.Paths.Partials + "Explorer.php", null);
	};

	/*
	 * HasInCopy
	*/
	ContextState.prototype.HasInCopy = function(c) {
		for(var i in this.Action.Copied) {
			var el = this.Action.Copied[i];
			if($(el).attr("_chain-id") === $(c).attr("_chain-id"))
				return true;
		}
		return false;
	};

	/*
	 * ClearCopied
	*/
	ContextState.prototype.ClearCopied = function() {
		for(var i in this.Action.Copied) {
			this.Action.Copied[i] = null;
		}
		this.Action.Copied = [];
		return this;
	};

	/*
	 * RemoveElementByChainID
	*/
	ContextState.prototype.RemoveElementByChainID = function(cid) {
		var p = $("[_chain-id='"+cid+"']").parent();
		$("[_chain-id='"+cid+"']").remove();
		this.App.UpdateChainID(p);
		return this;
	};


	/*
	 * GetItem
	 * Bugged
	 * A loaded document can't have the attribute ALIAS
	*/
	ContextState.prototype.GetItem = function(t) {

		var index = this.App.GetAlias(t); //loaded document
		if(!index) {
			index = this.App.GetTag(t);
			return this.App.GetItemByTag(index);
		}
		else {
			return this.App.GetItemByAlias(index); 
		}
	};
















	/* ====================
	 * App.XMLHTTP
	*/
	App.Xmlhttp = function() {

	};


	/* ====================
	 * App.Cache
	*/
	App.Cache = function() {
		this.Data = {};
	};

	App.Cache.prototype.Has = function(index) {
		return !NULL(this.Data[index]);
	};

	App.Cache.prototype.Get = function(index) {
		return this.Data[index];
	};

	App.Cache.prototype.Set = function(index, value) {
		this.Data[index] = value;
	};

	App.Cache.prototype.Del = function(index) {
		if(this.Has(index))
			delete this.Data[index];
		return this;
	};



	/*
	 * Vector2
	*/
	Vector = function(x, y) {
		this.X = x;
		this.Y = y;
	};

	Vector.prototype.Set = function(x, y) {
		this.X = x;
		this.Y = y;
		return this;
	};



	$(document).ready(__main);
	
})(jQuery, window);



/*
	REQUIRE E LIBS
*/


/*
 ====== REQUIRE
*/
(function() {
    
    var map = {}, root = [], reqs = {}, q = [], CREATED = 0, QUEUED = 1, REQUESTED = 2, LOADED = 3, COMPLETE = 4, FAILED = 5;
    function Requirement(url) {
        this.url = url;
        this.listeners = [];
        this.status = CREATED;
        this.children = [];
        reqs[url] = this;
    }
    Requirement.prototype = 
    {
        push: function push(child) { this.children.push(child); },
        check: function check() {
            
            var list = this.children, i = list.length, l;

            while (i) 
            { 
                if (list[--i].status !== COMPLETE) 
                    return; 
            }
 
            this.status = COMPLETE;

            for (list = this.listeners, l = list.length; i < l; ++i) 
            { 
                list[i](); 
            }
    	},
     	loaded: function loaded() {
            
            this.status = LOADED;
            this.check();

            if (q.shift() === this && q.length) 
                q[0].load();
        },
        failed: function failed() {

            this.status = FAILED;

            if (q.shift() === this && q.length) 
                q[0].load();
        },

        load: function load() { // Make request.

            var r = this, d = document, s = d.createElement('script');

            s.type = 'text/javascript';
            s.src = r.url;
            s.requirement = r;

            function cleanup() { // make sure event & cleanup happens only once.
                
                if (!s.onload) 
                    return true;

                s.onload = s.onerror = s.onreadystatechange = null;
                d.body.removeChild(s);
            }

            s.onload = function onload() { 
                if (!cleanup()) 
                    r.loaded(); 
            };

            s.onerror = function onerror() { 
                if (!cleanup()) 
                    r.failed(); 
            };

            if (s.readyState) { // for IE; note there is no way to detect failure to load.
                
                s.onreadystatechange = function () { 
                    if (s.readyState === 'complete' || s.readyState === 'loaded') 
                        s.onload(); 
                };
            }

            r.status = REQUESTED;
            d.body.appendChild(s);
        },


        request: function request(onready) {

            this.listeners.push(onready);

            if (this.status === COMPLETE) 
            { 
                onready(); return; 
            }
 
            var tags = document.getElementsByTagName('script'), i = tags.length, parent = 0;

            while (i && !parent) 
            { 
                parent = tags[--i].requirement; 
            }

            (parent || root).push(this);

            if (parent) 
                this.listeners.push(function() { parent.check(); });
 
            if (this.status === CREATED) 
            {
                this.status = QUEUED;

                if (q.push(this) === 1) 
                { 
                    this.load(); 
                }
            }
        }
    };


    function resolve(name) {

        if (/\/|\\|\.js$/.test(name)) 
            return name;

        if (map[name]) 
            return map[name];

        var parts = name.split('.'), used = [], ns;

        while (parts.length) 
        {
            if (map[ns = parts.join('.')]) 
                return map[ns] + used.reverse().join('/') + '.js';

            used.push(parts.pop());
        }

        return used.reverse().join('/') + '.js';
    }
    

    function absolutize(url) {

        if (/^(https?|ftp|file):/.test(url)) 
            return url;

        return (/^\//.test(url) ? absolutize.base : absolutize.path) + url;
    }


    (function () {
        var tags = document.getElementsByTagName('base'), href = (tags.length ? tags.get(tags.length - 1) : location).href;
        absolutize.path = href.substr(0, href.lastIndexOf('/') + 1) || href;
        absolutize.base = href.split(/\\|\//).slice(0, 3).join('/');
    })();
     

    function require(arr, onready) {

        if (typeof arr === 'string') 
            arr = [ arr ]; // make sure we have an array.

        if (typeof onready !== 'function') 
            onready = false;

        var left = arr.length, i = arr.length;

        if (!left && onready) {
            onready();
        }

        // Update or create the requirement node.
        while (i) 
        { 
            var url = absolutize(resolve(arr[--i])), req = reqs[url] || new Requirement(url);

            req.request(function check() 
                { 
                    if (!--left && onready) 
                        onready(); 
                });
        }
    }
    
    require.map = function mapto(name, loc) { map[name] = loc; };
    require.unmap = function unmap(name) { delete map[name]; };
    require.tree = root;
    App.Require = require;

})(jQuery);




/*UTILS*/
function NULL(v) { return (typeof v == "undefined" || v == null); }

function AppUrl(route) {
    pathArray = location.href.split( '/' );
    protocol = pathArray[0];
    host = pathArray[2] + "/" + pathArray[3];
    url = protocol + '//' + host;
    return url + "" + route;
}

function isFunc(func) {
	return typeof func === "function";
};

