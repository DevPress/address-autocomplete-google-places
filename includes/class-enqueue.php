<?php
namespace Address_Autocomplete;

use Address_Autocomplete;

/**
 * Class Enqueue.
 */
class Enqueue {

	public static $instance;

	/**
	 * Main Enqueue Instance.
	 *
	 * Ensures only one instance of the Enqueue is loaded or can be loaded.
	 *
	 * @return Enqueue - Main instance.
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * Enqueue styles and scripts.
	 *
	 * @return void
	 */
	public function enqueue_scripts() {

		// We only need this on the checkout page.
		if ( ! is_checkout() ) {
			return;
		}

		$settings = get_option( 'woocommerce_address_autocomplete_settings' );
		$api_key  = $settings['api_key'] ?? false;

		// We need the API to continue.
		if ( ! $api_key ) {
			return;
		}

		// Loads autocomplete functionality for WooCommerce.
		wp_register_script(
			'address-autocomplete-google-places',
			Address_Autocomplete::$url . 'assets/address-autocomplete.js',
			array(),
			Address_Autocomplete::$version,
			true
		);

		// Google API library.
		wp_enqueue_script(
			'address-autocomplete-google-places-api',
			'https://maps.googleapis.com/maps/api/js?key=' . esc_attr( $api_key ) . '&libraries=places&callback=initAddressAutocomplete',
			array( 'address-autocomplete-google-places' ),
			'1.0.0',
			true
		);
	}
}
