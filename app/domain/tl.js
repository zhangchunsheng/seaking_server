function TL(opts) {
	opts = opts || {};
	this.value = opts.value || 100;
	this.lastUpdate = opts.lastUpdate|| Date.now();
}
TL.prototype = {
	update: function() {
		var interval = 1000*60*20;
		var time = Date.now();
		if(time - this.lastUpdate > interval) {
			var num = Math.floor((time - this.lastUpdate  )/interval);		
			this.value += num*5;
			this.value =   (this.value > 100? 100:this.value);
			this.lastUpdate += interval*num;
			return true;
		}
		return false;
	},
	db: function() {
		return {
			value: this.value,
			lastUpdate: this.lastUpdate
		};
	}
}
exports.TL = TL;