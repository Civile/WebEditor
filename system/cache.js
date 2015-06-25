/*
==========================================
Cache
Author: http://www.edoardocasella.it
Notes:
This is where all the buffered data is stored
==========================================
*/

Cache = function() {

	this._Data = {
		_Sounds:  {},
		_Images:  {},
		_JSON:    {},
		_Txt:     {},
		_Op: 	  {}
	};
	

	this.Total  = 0;

};


/*Constructor*/
Cache.prototype.constructor = Cache;


/*
 * AddSound
*/
Cache.prototype.AddSound = function( bufferedData, name ) {

	if(NULL(bufferedData) || NULL(name))
	{
		throw "Cache.AddSound: undefined sound " + name;
	}

	this._Data._Sounds[name] = bufferedData;

	this.Total++;

	return bufferedData;
};

/*Generic data*/
Cache.prototype.SetData = function(n,f) {
	this._Data._Op[n] = f;
	return this;
};

Cache.prototype.GetData = function(n) {
	return this._Data._Op[n];
};

Cache.prototype.DelData = function(n) {
	delete this._Data._Op[n];
	return this;
};

Cache.prototype.HasData = function(n) {
	if(this._Data._Op[n] !== "undefined")
		return true;
	return false;
};

/*
 * Get
 * Return a cached object
 * Slow. Better to use the specific function: like GetSound for sounds etc...
*/
Cache.prototype.Get = function (name) {
	
	for (var i in this._Data)
		if (!NULL(this._Data[i][name]))
			return this._Data[i][name];

	return null;
};


/*
 * GetSound
*/
Cache.prototype.GetSound = function( name ) {

	return this._Data._Sounds[name];

};


/*
 * RemoveSound
*/
Cache.prototype.RemoveSound = function( name ) {

	delete this._Data._Sounds[name];
	this.Total--;
};


/*
 * AddImage
*/
Cache.prototype.AddImage = function( bufferedData, name ) {

	if(NULL(bufferedData) || NULL(name))
	{
		throw "Cache.AddImage: undefined image " + name;
	}

	this._Data._Images[name] = bufferedData;

	this.Total++;

	return bufferedData;

};



/*
 * GetImage
*/
Cache.prototype.GetImage = function( name ) {

	return this._Data._Images[name];

};


/*
 * RemoveImage
*/
Cache.prototype.RemoveImage = function( name ) {

	delete this._Data._Images[name];
	this.Total--;
};


/*
 * AddJSON
*/
Cache.prototype.AddJSON = function( bufferedData, name ) {

	if(NULL(bufferedData) || NULL(name))
	{
		throw "Cache.AddJSON: undefined JSONData " + name;
	}

	this._Data._JSON[name] = bufferedData;

	this.Total++;

	return bufferedData;

};



/*
 * GetJSON
*/
Cache.prototype.GetJSON = function( name ) {
		
	return this._Data._JSON[name];

};



/*
 * RemoveJSON
*/
Cache.prototype.RemoveJSON = function( name ) {

	delete this._Data._JSON[name];
	this.Total--;
};


/*
 * AddTxt
*/
Cache.prototype.AddTxt = function( bufferedData, name ) {

	if(NULL(bufferedData) || NULL(name))
	{
		throw "Cache.AddTxt: undefined txt " + name;
	}

	this._Data._Txt[name] = bufferedData;

	this.Total++;

	return bufferedData;

};


/*
 * GetTxt
*/
Cache.prototype.GetTxt = function( name ) {
	
	return this._Data._Txt[name];

};



/*
 * RemoveTxt
*/
Cache.prototype.RemoveTxt = function( name ) {

	delete this._Data._Txt[name];
	this.Total--;
};



/*
 * Destroy
 * Destroy all the cache contents
*/
Cache.prototype.Destroy = function() {

	for (var i in this._Data._Sounds)
	{
		delete this._Data._Sounds[i];
	}

	for (var i in this._Data._Images)
	{
		delete this._Data._Images[i];
	}

	for (var i in this._Data._JSON)
	{
		delete this._Data._JSON[i];
	}

	for (var i in this._Data._Txt)
	{
		delete this._Data._Txt[i];
	}


	this.Total = 0;

};