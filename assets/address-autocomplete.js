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

		// If a country is already selected, use that to limit the results.
		let initalSupportCountries = supportedCountries;
		if (fieldInputs.country.value) {
			initalSupportCountries = [fieldInputs.country.value];
		}

		// Initialize Places Autocomplete on Address 1.
		const address = new google.maps.places.Autocomplete(field, {
			types: ["address"],
			// Scoping the fields help reduce API charges.
			fields: ["address_component"],
			componentRestrictions: {
				country: initalSupportCountries ?? null,
			},
		});

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
		// If a specific country is selected, that's the only one allowed.
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
		const place = address.getPlace();
		const addressComponents = place.address_components;

		// Useful for debugging.
		if (false) {
			for (const component of place.address_components) {
				const componentType = component.types[0];
				console.log(componentType);
				console.log(component);
			}
		}

		// Get country first since address components vary by country.
		const country = this.getAddressComponentShortName(
			addressComponents,
			"country"
		);

		// Set the country field.
		const countryField = fieldInputs.country;
		countryField.value = country;
		countryField.dispatchEvent(new Event("change"));

		// Set the address1 field.
		fieldInputs.address1.value = this.parseStreetAddress(addressComponents);

		// Set the city field.
		// Requires the country to properly parse.
		fieldInputs.city.value = this.parseCity(addressComponents, country);

		// Set the state field.
		const stateField = fieldInputs.state;
		const stateComponent = this.getAddressComponent(
			addressComponents,
			"administrative_area_level_1"
		);
		if (stateField.tagName == "SELECT") {
			Array.prototype.forEach.call(stateField.options, function (option) {
				// We can generally assume the shortname will be the value.
				if (option.value == stateComponent.short_name) {
					stateField.value = stateComponent.short_name;
					option.selected = true;
					return true;
				}

				// But if there isn't a match, we can try the long name.
				// This was implemented for Mexico.
				if (option.text == stateComponent.long_name) {
					stateField.value = stateComponent.long_name;
					option.selected = true;
					return true;
				}
			});
		} else {
			stateField.value = stateComponent.long_name;
		}
		stateField.dispatchEvent(new Event("change"));

		// Set the postal code field.
		fieldInputs.postcode.value = this.getAddressComponentLongName(
			addressComponents,
			"postal_code"
		);
	};

	/**
	 * Parse address1 from address components.
	 *
	 * @return {string} The street address.
	 */
	parseStreetAddress = (addressComponents) => {
		const streetNumber = this.getAddressComponentLongName(
			addressComponents,
			"street_number"
		);
		const route = this.getAddressComponentLongName(
			addressComponents,
			"route"
		);
		return `${streetNumber} ${route}`.trim();
	};

	/**
	 * Parse city from address components.
	 *
	 * @return {string} The city.
	 */
	parseCity = (addressComponents, country) => {
		// Different countries use different address components for city.
		let city = "";

		// GB has some oddities with city names.
		if ("GB" === country) {
			city = this.getAddressComponentLongName(
				addressComponents,
				"postal_town"
			);
			if (city === "") {
				city = this.getAddressComponentLongName(
					addressComponents,
					"administrative_area_level_2"
				);
			}
			return city;
		}

		const locality = this.getAddressComponentLongName(
			addressComponents,
			"locality"
		);

		if (locality !== "") {
			return locality;
		}

		const sublocality = this.getAddressComponentLongName(
			addressComponents,
			"sublocality_level_1"
		);

		if (sublocality !== "") {
			return sublocality;
		}

		return "";
	};

	/**
	 * Gets the shortname for the address component.
	 *
	 * @return {string} The shortname.
	 */
	getAddressComponentShortName = (addressComponents, key) => {
		const component = this.getAddressComponent(addressComponents, key);
		return component.short_name ?? "";
	};

	/**
	 * Gets the longname for the address component.
	 *
	 * @return {string} The shortname.
	 */
	getAddressComponentLongName = (addressComponents, key) => {
		const component = this.getAddressComponent(addressComponents, key);
		return component.long_name ?? "";
	};

	/**
	 * Filters the address components by type key.
	 *
	 * @return {object} The address component.
	 */
	getAddressComponent = (addressComponents, key) => {
		const component = addressComponents.filter((address) =>
			address.types.includes(key)
		);
		return component[0] ?? [];
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
