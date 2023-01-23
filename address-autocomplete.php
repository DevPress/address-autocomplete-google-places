<?php
/**
 * Plugin Name: Address Autocomplete with Google Places
 * Plugin URI: https://devpress.com/products/address-autocomplete-woocommerce
 * Description: Enables address autocomplete with Google Places API for WooCommerce.
 * Version: 1.0.0
 * Author: DevPress
 * Author URI: https://devpress.com
 *
 * WC requires at least: 5.6.0
 * WC tested up to: 7.2.2
 *
 * License: GNU General Public License v3.0
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 */

/**
 * Class Address_Autocomplete
 * @package Address_Autocomplete
 */
class Address_Autocomplete {

	/** @var Address_Autocomplete */
	public static $instance;

	/** @var string */
	public static $version = '1.0.0';

	/** @var string */
	public static $required_woo = '5.6.0';

	/** @var URL for loading assets. **/
	public static string $url;

	/** @var PATH for plugin directory. **/
	public static string $dir;

	/**
	 * Main Address_Autocomplete Instance.
	 * Ensures only one instance of the Address_Autocomplete is loaded.
	 *
	 * @return Address_Autocomplete - Main instance.
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
		self::$url = plugin_dir_url( __FILE__ );
		self::$dir = plugin_dir_path( __FILE__ );

		if ( ! defined( 'WC_VERSION' ) || version_compare( WC_VERSION, self::required_woo, '<' ) ) {
			add_action( 'admin_notices', array( $this, 'woocommerce_compatibility_notice' ) );
			return;
		}

		// Enqueue scripts and styles.
		require_once self::$dir . '/includes/class-enqueue.php';
		new Address_Autocomplete\Enqueue();

		// Loads the settings page.
		add_filter( 'woocommerce_integrations', array( $this, 'add_integration' ) );
	}

	/**
	 * Adds a new section to the WooCommerce integration settings.
	 */
	public function add_integration( $integrations ) {
		require_once self::$dir . '/includes/class-settings.php';
		new Address_Autocomplete\Settings_Page();
		$integrations[] = 'Address_Autocomplete\Settings_Page';
		return $integrations;
	}

	/**
	 * Display a warning message if minimum version of WooCommerce check fails.
	 *
	 * @since  1.0.0
	 * @return void
	 */
	public function woocommerce_compatibility_notice() {
		echo '<div class="error"><p>' . sprintf( __( 'Address Autocomplete requires at least WooCommerce v%1$s in order to function.', 'address-autocomplete' ), self::$required_woo ) . '</p></div>';
	}

}

Address_Autocomplete::instance();
