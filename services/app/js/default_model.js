var DefaultModel = function() {};
DefaultModel.prototype.onModelReady = function() {
	if(!this.modelReady) {
		return this.modelReady = ko.observable(true);
	}

	this.modelReady(true);
};

module.exports = DefaultModel;