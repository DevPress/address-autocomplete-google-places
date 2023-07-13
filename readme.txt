=== Address Autocomplete Google Places ===

Contributors: devpress
Tags: woocommerce
Requires at least: 6.0
Tested up to: 6.2.2
Stable tag: 1.1.1
Requires PHP: 7.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Enables address autocomplete with Google Places API for WooCommerce.

== Description ==

Enables address autocomplete with the Google Places API for WooCommerce.

* Help customers save time in the checkout process.
* Provides more consistent addresses formatting.
* Autofills address results for both shipping and billing.
* Restricts autocomplete suggestions to the country selected.
* Optimized API calls to keep costs low.

== Frequently Asked Questions ==

= What countries are supported? =

This extension should work for any country Google Places supports. It has been tested with:

* Canada (CA)
* Mexico (MX)
* Portugal (PT)
* Puerto Rico (PR)
* United Kingdom (UK)
* United States (US)

If you find a bug or issue with address parsing for a specific country, please reach out to support!

= How do I get a Google Places API Key? =

You will need to sign up for a Google Cloud Platform (GCP) account. Then [create an API key following these instructions](https://developers.google.com/maps/documentation/places/web-service/get-api-key).

= Does Google Places autocomplete cost money? =

If your usage exceeds the credit amount, this service does cost money. See this page for the [latest pricing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing#places-details).

Place Details charges start at .017 USD per autocomplete session (or $17 per 1000 sessions).

This plugin only requests data needed to autofill address results which keeps costs at a minimum.

= Why should I use this plugin over others? =

I built this plugin after trying a number of other ones that didn't work great. Some made inefficent API calls which resulted in additional costs. Some had bugs which caused address results to be provided for countries that were not available. Others had additional features like maps, which weren't needed.

This plugin does one thing, and it does it well.

== Screenshots ==

1. Autocomplete dropdown.
2. Settings page.

== Changelog ==

= 1.1.1 =

* Update: Support for Mexico.

= 1.1.0 =

* Update: Declare compatibility for High Performance Order Storage.
* Update: Improves methods for parsing address components.

= 1.0.1 =

* Update: Improve country targeting.

= 1.0 =

* Initial release.
