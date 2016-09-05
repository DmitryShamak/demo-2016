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

var convertToCurrency = function(valueAccessor) {
	var data = ko.unwrap(valueAccessor());

	var decimals = data.decimals || false;
	var price = parseFloat(typeof data.value === "function" ? data.value() : data.value);
	var currency = data.currency || "";
	return (currency +  (decimals ? price.toFixed(decimals) : price));
};
ko.bindingHandlers.currency = {
	init: function(element, valueAccessor, allBindings) {
		$(element).text( convertToCurrency(valueAccessor) );
	},
	update: function(element, valueAccessor, allBindings) {
		$(element).text( convertToCurrency(valueAccessor) );
	}
};

var SearchViewModel = function SearchViewModel() {
	var model = this;
	model.modelReady = ko.observable(false);
	model.activeService = ko.observable(-1);
	model.activeView = ko.observable();
	model.servicesList = ko.observable();
	model.searchFilters = ko.observable({
		contentSearchValue: ko.observable(""),
		priceMinValue: ko.observable(0),
		priceMaxValue: ko.observable(0),
		minPrice: ko.observable(0),
		maxPrice: ko.observable(0)
	});

	model.getData = function getData(updateFilters) {
		var minPrice = 0,
			maxPrice = 0;

		var data = JSON.parse(localStorage.getItem("services")) || [];

		if(updateFilters) {
			data.forEach(function(item) {
				var price = parseFloat(item.price);
				if(price > maxPrice) {
					maxPrice = price;
				}
				if(price < minPrice) {
					minPrice = price;
				}
			});

			model.searchFilters().priceMinValue(Math.round(minPrice));
			model.searchFilters().minPrice(Math.round(minPrice));
			model.searchFilters().priceMaxValue(Math.round(maxPrice));
			model.searchFilters().maxPrice(Math.round(maxPrice));
		}


		return data;
	};

	model.searchByContent = function searchByContent(value) {
		var searchText = model.searchFilters().contentSearchValue().trim().toLowerCase();
		var searchRange = {
			min: parseFloat(model.searchFilters().priceMinValue()),
			max: parseFloat(model.searchFilters().priceMaxValue())
		};

		var data = model.getData();
		model.activeService(-1);
		ApiEvents.fire("ON_VIEW_CHANGED", "DEFAULT");

		var searchResult = data.filter(function(item) {
			var contentMatch = true,
				price = parseFloat(item.price),
				priceMatch = searchRange.min <= price && price <= searchRange.max;

			if(searchText) {
				var title = item.title.toLowerCase();
				var description = (item.description || "").toLowerCase();
				contentMatch = title.search(searchText) !== -1 || description.search(searchText) !== -1;
			}

			return contentMatch && priceMatch;
		});

		return model.servicesList(searchResult);
	};

	model.services = ko.computed(function() {
		if(!model.modelReady || !model.modelReady()) {
			return [];
		}

		return (model.servicesList() || model.getData(true));
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
	var required = ["title", "price"];

	model.handleDropMedia = function(form, event) {
		console.log(event.target.value);
	};

	model.uploadImagePreview = ko.computed(function() {
		if(!model.newServiceForm() || !model.newServiceForm().media()) {
			return {};
		}

		//todo: validate image url
		return {
			backgroundImage: 'url{' + model.newServiceForm().media() + ")"
		}
	});

	model.convertPrice = function(value) {
		var result = (parseFloat(value) || 0).toFixed(2);
		return result;
	};

	model.addService = function addService() {
		//todo: validate new service
		var formData = model.newServiceForm().koToJSON();
		var valid = true;
		model.formMessage("");
		if(formData.price) {
			formData.price = model.convertPrice(formData.price);
		}

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

		model.newServiceForm(null);
		ApiEvents.fire("ON_SERVICE_ADD", formData);
	};

	ApiEvents.subscribe("ON_VIEW_CHANGED", function(view) {
		model.activeView(view === "SERVICE_FORM");

		if(model.activeView()) {
			model.newServiceForm({
				title: ko.observable(""),
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