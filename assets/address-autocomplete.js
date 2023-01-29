/**
 * Address Autocomplete.
 *
 * Loads Google Maps API and initializes autocomplete on address fields.
 */
class AddressAutocomplete {
	constructor() {
		document.addEventListener("DOMContentLoaded", this.initFields, false);
	}

	/**
	 * If the address fields exist, initialize autocomplete.
	 */
	initFields = () => {
		const billingField = document.getElementById("billing_address_1");
		if (billingField) {
			this.initAutocomplete(billingField, "billing");
		}

		const shippingField = document.getElementById("shipping_address_1");
		if (shippingField) {
			this.initAutocomplete(shippingField, "shipping");
		}
	};

	/**
	 * Initizalizes Google Places Autocomplete on the address field.
	 *
	 * Adds listeners for country selector changes and autocomplete selection.
	 */
	initAutocomplete = (field, type) => {
		const fieldInputs = {
			address1: field,
			city: document.getElementById(`${type}_city`),
			state: document.getElementById(`${type}_state`),
			country: document.getElementById(`${type}_country`),
			postcode: document.getElementById(`${type}_postcode`),
		};

		// Gets supported countries for the address type (billing or shipping).
		// Returns an array if 5 or less countries are supported, otherwise null.
		const supportedCountries = this.getSupportedCountries(
			fieldInputs.country
		);

		// Initialize Places Autocomplete on Address 1.
		const address = new google.maps.places.Autocomplete(field, {
			types: ["address"],
			// Scoping the fields help reduce API charges.
			fields: ["address_component"],
			country: supportedCountries ?? null,
		});

		if (fieldInputs.country.value) {
			this.setCountryRestriction(
				address,
				fieldInputs.country.value,
				supportedCountries
			);
		}

		// If the country selector is a select2 field, we need to use jQuery to listen for changes.
		if (window.jQuery) {
			jQuery(`#${type}_country`).on("change", () => {
				this.setCountryRestriction(
					address,
					fieldInputs.country.value,
					supportedCountries
				);
			});
		} else {
			fieldInputs.country.addEventListener("change", () => {
				this.setCountryRestriction(
					address,
					fieldInputs.country.value,
					supportedCountries
				);
			});
		}

		// Listen for an autocomplete selection and set new values.
		google.maps.event.addListener(address, "place_changed", () => {
			this.parsePlace(address, fieldInputs);
		});
	};

	/**
	 * Sets the countries that address results will be returned for.
	 */
	setCountryRestriction = (address, country, countryAllowList = []) => {
		if (country) {
			countryAllowList = [country];
		}

		address.setComponentRestrictions({
			country: countryAllowList,
		});
	};

	/**
	 * Parse the address components returned by Google Places.
	 */
	parsePlace = (address, fieldInputs) => {
		console.log("place change");
		let place = address.getPlace();
		let streetNumber = "";
		let route = "";

		for (let i = 0; i < place.address_components.length; i++) {
			const type = place.address_components[i].types[0];
			const shortName = place.address_components[i].short_name;
			const longName = place.address_components[i].long_name;
			console.log(type, shortName, longName);

			// Street number.
			if (type === "street_number") {
				streetNumber = longName;
				continue;
			}

			// Street name.
			if (type === "route") {
				route = longName;
				continue;
			}

			// City.
			if (type === "sublocality_level_1" || type === "locality") {
				fieldInputs.city.value = longName;
				continue;
			}

			// State.
			if (type === "administrative_area_level_1") {
				const stateField = fieldInputs.state;
				if (stateField.tagName == "SELECT") {
					stateField.value = shortName;
					Array.prototype.forEach.call(
						stateField.options,
						function (option) {
							if (shortName == option.value) {
								option.selected = true;
								return true;
							}
						}
					);
				} else {
					stateField.value = longName;
				}
				stateField.dispatchEvent(new Event("change"));
				continue;
			}

			// Country.
			if (type === "country") {
				const countryField = fieldInputs.country;
				countryField.value = shortName;
				countryField.dispatchEvent(new Event("change"));
				continue;
			}

			// Postal code.
			if (type === "postal_code") {
				fieldInputs.postcode.value = longName;
				continue;
			}
		}

		// Populate address1 field.
		fieldInputs.address1.value = streetNumber + " " + route;
	};

	/**
	 * Returns the supported countries.
	 *
	 * If only one country is available, we'll return that.
	 * If multiple countries are supported, we'll return those.
	 *
	 * Google Places only supports country restrictions to 5 or less,
	 * so if supported countries is more than 5 we need to allow autcomplete for all countries.
	 */
	getSupportedCountries = (countryField) => {
		// If there's only one country, this field should be an INPUT element.
		if (countryField.tagName === "INPUT") {
			return countryField.value ?? null;
		}

		// Otherwise we expect this field to be a SELECT element.
		if (countryField.tagName !== "SELECT") {
			return null;
		}

		let countries = [];
		Array.prototype.forEach.call(countryField.options, (option) => {
			if (option.value) {
				countries.push(option.value);
			}
		});

		// Google Places only supports 5 countries at a time.
		if (countries.length > 1 && countries.length <= 5) {
			return countries;
		}

		return null;
	};
}

initAddressAutocomplete = () => {
	new AddressAutocomplete();
};
