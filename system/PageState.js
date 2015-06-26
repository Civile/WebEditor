



	/* =========================
	 * Page
	*/
	PageState = function(a) {
		ParentState.call(this);
		this.Name;
		this.App = null;
		this.State = StatesState.INACTIVE;
		this.Stylesheet; //json

		this._AllowedFiles = ["html", "twig", "htm"];
		this._CurrentFile = {name:null, data:null};
		this._TmpData = {};
		this.Metas = [];
		this.__Extensions = [
			"LoadProject",
			"SaveProject"
		]
		this._Init(a);
	};

	PageState.prototype = Object.create(ParentState.prototype);
	PageState.prototype.constructor = PageState;

	/*
	 * _Init
	*/
	PageState.prototype._Init = function(a) {
		this.ParentInit();
		this.App = a || null;
		if(NULL(this.App))
			throw({message: "PageState: undefined app"});
		else 
		{	
			try 
			{
				this._ExtendsApp();
				/*Load tools then run*/
				this.LoadTools(function() {
					this.Run();
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
	 * LoadTools
	*/
	PageState.prototype.LoadTools = function() {
		var ctx = this;
		$("footer ._tools-temp").append('<div class="pge-tools"></div>');
		$("footer ._tools-temp .pge-tools").load(this.App.Conf.Paths.Partials + "PageStateTools.php", function(d) {
			$("footer").append(d);
			$(".pge-tools").remove();
			if(typeof c === "function") {
				c.call(ctx);
			}
		});
	};
	
	PageState.prototype.Run = function() {
		
	};

	/*
	 * SetName
	*/
	PageState.prototype.SetName = function(n) {
		this.Name = n;
		return this;
	};

	
	/*
	 * Save
	 * modal
	*/
	PageState.prototype.Save = function() {
		this.App.OpenPageModal(TwigGen.Conf.Paths.Partials + "PageSave.php", null, {
			pageName: decodeURIComponent(this.Name)
		});
	};

	/*
	 * SaveLayout
	 * TODO: css e meta
	*/
	PageState.prototype.SaveLayout = function(n, suc, er) {
		var tree = this.App.GetChainTree();

		//Attach css
		var css = this.App.GetProjectStyle("project-style");
		
		var d = {
			cmd: "saveLayout",
			tree: this.App.ClearFromPrivate(tree),
			css: css,
			head: "<head></head>",
			meta: null,
			name: decodeURIComponent(n) || new Date().toJSON().slice(0,10) + " - " + (new Date().getTime() + 15*60*1000),
			where: "projects/"
		};

		//Call server-side script
		$.ajax({
		  type: "POST",
		  url: AppUrl("/server/index.php"),
		  data: d,
		  success: function(data) {
		  	if(typeof suc === "function") {
		  		suc.call(this, data);
		  	}
		  },
		  error: function(e) {
		  	if(typeof suc === "function") {
		  		er.call(this, e);
		  	}
		  },
		  dataType: "html"
		});
	};



	/*
	 * Load
	 * modal
	*/
	PageState.prototype.Load = function() {
		//Prepare ExplorerCallback
		this.App.Cache.SetData("ExplorerCallback", function(file) {
		   	if(this.App.GetState("Page").FileAllowed(file)) {
		   		this.App.LoadProject.call(this.App.GetState("Page"), file.replace("../", '/'), null);
   			} else alert("Loader: file " + file + "not allowed");
		}).SetData("ExplorerContext", this);
		
		//Open file explorer
		this.App.OpenPageModal(TwigGen.Conf.Paths.Partials + "Explorer.php", null);
	};

	/*
	 * FileAllowed
	*/
	PageState.prototype.FileAllowed = function(file) {
		var _ext = file.split(".").pop();
		if(this._AllowedFiles.indexOf(_ext) !== -1) {
			return true;
		} else return false;
	};

	/*
	 * SetCurrentFile
	*/
	PageState.prototype.SetCurrentFile = function(n, d) {
		var u = null;
		var lastseg = n.split("/").pop();
		u = n.replace("/" + lastseg, "");

		this._CurrentFile = {
			file: decodeURIComponent(n),
			url: u,
			data:  $($.parseHTML(d))
		};

		//Save name
		var tn = n.split("/");
		this.Name = tn[tn.length - 2];

		return this;
	};

	/*
	 * CurrentFileUrl
	*/
	PageState.prototype.CurrentFileUrl = function() {
		return this._CurrentFile.url;
	};

	/*
	 * CurrentFileData
	*/
	PageState.prototype.CurrentFile = function() {
		return this._CurrentFile;
	};

	/*
	 * LoadProject
	*/
	PageState.prototype.LoadProject = function(file, c) {
		ctx = this;

		this.App.EmptyBodyFromEverything();
		
		if(file.indexOf("/") !== -1) {
			var page = file.split("/").pop();
			var _tmp = file.split("/");
			var project = _tmp[_tmp.length - 2];
		} else {
			page = "index.html";
			project = file;
		}
		
		this.App.AjaxCall(AppUrl("/server/index.php"), {cmd:"loadLayout", project:project, page:page }, function(d) {
			d = JSON.parse(d);
			if(d.error) {
				alert("Error while loading project " + project);
			} else {

				//Load body content
				$("#_canvas").html(d.body);

				//Load css
	   			if(d.css_content) {
	   				ctx.App.AppendStyle(d.css_content, "project-style");
	   			}

	   			ctx.App.EmpowerContainer("#_canvas");

	   			ctx.SetCurrentFile(file, d.html);
	   			$("._preview-link").attr("href", AppUrl(ctx.CurrentFile().url));
			}
			
		});
	};	
	

	/*
	 * ClearCurlyBrackets
	*/
	PageState.prototype.ClearCurlyBrackets = function(s) {
		//TODO
	    //return s.replace(/{.*}/g, 'HS')
	    return s.replace(/{(.*?)}/g, "$13$2")
	};

	/*
	 * AttachClass
	*/
	PageState.prototype.AttachClass = function(w, classes) {
		for(var i in classes) {
			$(w + " *").addClass(classes[i]);
		}
		return this;
	};


	/*
	 * LoadCSS
	 * Appends a project's stylesheet 
	*/
	PageState.prototype.LoadCSS = function(href) {
		var cssLink = $("<link rel='stylesheet' _origin='_project' type='text/css' href='"+href+"'>");
     	$("head").append(cssLink); 
	};

	


	PageState.prototype.SaveTempData = function(n, v) {
		this._TmpData[n] = v;
	};
