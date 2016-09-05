var mainStyles = require("./style/main.scss");

var CustomEvents = require("./js/custom_events.js");
var ApiEvents = new CustomEvents();

var DefaultModel = function() {};
DefaultModel.prototype.onModelReady = function() {
	if(!this.modelReady) {
		return this.modelReady = ko.observable(true);
	}

	this.modelReady(true);
};

var SearchViewModel = function SearchViewModel() {
	var model = this;
	model.modelReady = ko.observable(false);
	model.activeService = ko.observable(-1);
	model.activeView = ko.observable();
	model.servicesList = ko.observable();

	model.services = ko.computed(function() {
		if(!model.modelReady || !model.modelReady()) {
			return [];
		}

		return (model.servicesList() || JSON.parse(localStorage.getItem("services")) || []);
	});

	ApiEvents.subscribe("ON_SERVICE_ADD", function(newService) {
		var services = JSON.parse(localStorage.getItem("services")) || [];
		services.push(newService);
		localStorage.setItem("services", JSON.stringify(services));
		model.servicesList(services);
		var selectedService = model.activeService();
		if(selectedService != -1) {
			model.handleServiceClick(services[selectedService], selectedService);
		} else {
			ApiEvents.fire("ON_VIEW_CHANGED", "DEFAULT");
		}
	});
	model.selectedServiceIndex = ko.computed(function() {
		return model.activeService();
	});
	model.showAddServiceForm = function() {
		model.activeView("SERVICE_FORM");
		ApiEvents.fire("ON_VIEW_CHANGED", "SERVICE_FORM");
	};
	model.handleServiceClick = function(data, index) {
		if(model.activeView() !== "SERVICE_DETAILS") {
			model.activeView("SERVICE_DETAILS");
			ApiEvents.fire("ON_VIEW_CHANGED", "SERVICE_DETAILS");
		}
		model.activeService(index);

		ApiEvents.fire("ON_SERVICE_SELECTED", data);
	};
	setTimeout(model.onModelReady.bind(model), 100); //fake api request
	return model;
};
SearchViewModel.prototype = Object.create(DefaultModel.prototype);

var ServiceDetailsViewModel = function ServiceDetailsViewModel() {
	var model = this;
	model.activeView = ko.observable(false);
	model.modelReady = ko.observable(false);
	model.selectedService = ko.observable();

	ApiEvents.subscribe("ON_VIEW_CHANGED", function(view) {
		model.activeView(view === "SERVICE_DETAILS");
	});
	ApiEvents.subscribe("ON_SERVICE_SELECTED", function(response) {
		model.selectedService(response);
	});

	model.onModelReady();
	return model;
};
ServiceDetailsViewModel.prototype = Object.create(DefaultModel.prototype);
Object.prototype.koToJSON = function() {
	var json = {};
	for(var key in this) {
		if(this.hasOwnProperty(key)) {
			json[key] = (typeof this[key] == "function" ? this[key]() : this[key])
		}
	}

	return json;
};
var ServiceFormViewModel = function ServiceFormViewModel() {
	var model = this;
	model.activeView = ko.observable(false);
	model.modelReady = ko.observable(false);
	model.newServiceForm = ko.observable();
	model.formMessage = ko.observable("");
	var required = ["displayName", "price"];

	model.addService = function addService() {
		//todo: validate new service
		var formData = model.newServiceForm().koToJSON();
		var valid = true;
		model.formMessage("");

		for(var key in formData) {
			if(required.indexOf(key) != -1 && (!formData[key] || formData[key].trim() === "")) {
				valid = false;
				model.formMessage("invalid input: " + key);
				break;
			}
		}
		if(!valid) {
			return false;
		}

		ApiEvents.fire("ON_SERVICE_ADD", formData);
	};

	ApiEvents.subscribe("ON_VIEW_CHANGED", function(view) {
		model.activeView(view === "SERVICE_FORM");

		if(model.activeView()) {
			model.newServiceForm({
				displayName: ko.observable(""),
				price: ko.observable(""),
				description: ko.observable(""),
				media: ko.observable("")
			});
		}
	});
	model.onModelReady();
	return model;
};
ServiceFormViewModel.prototype = Object.create(DefaultModel.prototype);

ko.applyBindings(new SearchViewModel(), document.getElementById("search-model"));
ko.applyBindings(new ServiceDetailsViewModel(), document.getElementById("service-details-model"));
ko.applyBindings(new ServiceFormViewModel(), document.getElementById("service-form-model"));