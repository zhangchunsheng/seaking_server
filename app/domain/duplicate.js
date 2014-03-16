var getData = function(info) {
	var data = {};
	for(var i in info.induData) {
		if(info.induData[i]) {
			data[info.induData[i].eventId] = false;
		}	
	}
	return data;
}
function duplicate(info) {
	this.id  = info.id;
	this.data = this.data || getData(info);
	
}
exports.duplicate = duplicate;