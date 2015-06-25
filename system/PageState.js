



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
			pageName: this.Name
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
			name: n || new Date().toJSON().slice(0,10) + " - " + (new Date().getTime() + 15*60*1000),
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
			file: n,
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
	PageState.prototype.LoadProject = function(n, c) {
		ctx = this;

		this.App.EmptyBody()
			.EmptyStyle();

		$.ajax({
		  type: "POST",
		  url: AppUrl(n),
		  data: null,
		  success: function(data) {
		  	ctx.PreloadDocument.call(ctx, AppUrl(n), data);
		  },
		  dataType: "html"
		});		
	};	
	
	/*
	 * PreloadDocument
	*/
	PageState.prototype.PreloadDocument = function(n, r) {
		this.SetCurrentFile(n, r)
			.CreateTempView(this.CurrentFile().data)
			.GetAndAppendCSS(this.CurrentFile().data)
			//.GetScripts()
			.LoadInView()
			.AttachClass("#_canvas", ["_potential", "_caption-chained"])
			.RemoveTempView();
			this.App.UpdateChainID("#_canvas");
			this.App.UpdateUID("#_canvas");
			//$("body").append(r);
	};







	/*
	 * ClearCurlyBrackets
	*/
	PageState.prototype.ClearCurlyBrackets = function(s) {
		//TODO
	    //return s.replace(/{.*}/g, 'HS')
	    return s.replace(/{(.*?)}/g, "$13$2")
	};

	PageState.prototype.AttachClass = function(w, classes) {
		for(var i in classes) {
			$(w + " *").addClass(classes[i]);
		}
		return this;
	};


	PageState.prototype.CreateTempView = function(d) {
		$("body").append('<div style="display:none;" class="__tempview"></div>');
		if(!NULL(d)) 
			$(".__tempview").html(d);
		return this;
	};

	PageState.prototype.LoadInView = function() {
		$("#_canvas").append($(".__tempview").html());
		return this;
	};

	PageState.prototype.RemoveTempView = function() {
		$(".__tempview").remove();
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

	/*
	 * GetAndAppendCSS
	*/
	PageState.prototype.GetAndAppendCSS = function(tmp) {
		var ctx = this;
	
		//<link>
		$(".__tempview").find("link").each(function() {
			var href = $(this).attr("href");
			var lastseg = href.split("/").pop();
			console.log(lastseg);
			href = ctx.CurrentFile().url + "/" + href.replace(lastseg, "").replace("./", "") + lastseg;

			ctx.LoadCSS(href);
		});
		//<style>
		$(tmp).find("style").each(function() {
			var s = $(this).clone();
			$("head").append(s);
			$(this).remove();
		});
		return this;
	};

	/*
	 * ParseHead
	*/
	PageState.prototype.ParseHead = function(tmp) {
		var ctx = this;

		$(tmp).find("meta, title, style").each(function() {
			$(this).remove();
		});

		//Save head
		ctx.SaveTempData("head", $(tmp).find("head").clone());

		$(tmp).find("head").remove();
		return this;
	};


	PageState.prototype.SaveTempData = function(n, v) {
		this._TmpData[n] = v;
	};
