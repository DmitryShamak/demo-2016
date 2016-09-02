var SearchViewModel = function SearchViewModel() {
	var model = {
		modelReady: ko.observable(false),

		onModelReady: function() {
			this.modelReady(true);
		}
	};

	setTimeout(model.onModelReady.bind(model), 2000);

	return model;
};
var ServiceDetailsViewModel = function ServiceDetailsViewModel() {
	return {
		modelReady: ko.observable(false)
	}
};
var ServiceFormViewModel = function ServiceFormViewModel() {
	return {
		modelReady: ko.observable(false)
	}
};


ko.applyBindings(new SearchViewModel(), document.getElementById("search-model"));
ko.applyBindings(new ServiceDetailsViewModel(), document.getElementById("service-details-model"));
ko.applyBindings(new ServiceFormViewModel(), document.getElementById("service-form-model"));