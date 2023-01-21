<?php
namespace Address_Autocomplete;

/**
 * Class Settings_Page.
 */
class Settings_Page extends \WC_Integration {

	/**
	 * Initialize the integration.
	 */
	public function __construct() {
		$this->id                 = 'address_autocomplete';
		$this->method_title       = __( 'Address Autocomplete', 'address-autocomplete' );
		$this->method_description = __( 'An integration with Google Places API for address autocomplete on checkout page.', 'address-autocomplete' );

		// Load the settings.
		$this->init_form_fields();
		$this->init_settings();

		// Actions.
		add_action( 'woocommerce_update_options_integration_' . $this->id, array( $this, 'process_admin_options' ) );
	}

	/**
	 * Initialize integration settings form fields.
	 */
	public function init_form_fields() {
		$this->form_fields = array(
			'api_key' => array(
				'id'          => 'address-autocomplete-api-key',
				'title'       => __( 'Google Places API Key', 'address-autocomplete' ),
				'type'        => 'password',
				'description' => sprintf(
					__( 'Generate a <a href="%s" target="_blank">Google Places API Key</a>.', 'address-autocomplete' ),
					'https://developers.google.com/maps/documentation/javascript/get-api-key',
				),
				'css'         => 'min-width:300px;',
			),
		);
	}
}
