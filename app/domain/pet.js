var startLevel = 0;
var Pet = function(opts) {
	this.quality = opts.quality;
	this.level = startLevel;
	this.status = [0,0,0];
	this.name = opts.name;
	this.id = opts.id;
}
exports.Pet = Pet;