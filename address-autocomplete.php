<?php
/**
 * Plugin Name: Address Autocomplete with Google Places
 * Plugin URI: https://github.com/devpress/address-autocomplete-google-places
 * Description: Enables address autocomplete with Google Places API for WooCommerce.
 * Version: 1.1.1
 * Author: DevPress
 * Author URI: https://devpress.com
 * Text Domain: address-autocomplete-google-places
 * Requires at least: 6.0
 * Requires PHP: 7.2
 * Tested up to: 6.2.2
 *
 * WC requires at least: 5.6.0
 * WC tested up to: 7.8.2
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
	public static $version = '1.1.0';

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

		// Declares compatibility with High Performance Order Storage.
		add_action( 'before_woocommerce_init', array( $this, 'declare_custom_order_table_compatibility' ) );

		// Adds link to settings from plugins page.
		$base_name = plugin_basename( __FILE__ );
		add_filter( 'plugin_action_links_' . $base_name, array( $this, 'plugin_action_links' ) );

		// Load this plugin after WooCommerce.
		add_action( 'plugins_loaded', array( $this, 'init' ) );
	}

	/**
	 * Declares compatibility with High Performance Order Storage.
	 * https://github.com/woocommerce/woocommerce/wiki/High-Performance-Order-Storage-Upgrade-Recipe-Book
	 */
	public function declare_custom_order_table_compatibility() {
		if ( ! class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
			return;
		}
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
	}


	/**
	 * Loads plugin functionality after WooCommerce version check.
	 */
	public function init() {
		if ( ! defined( 'WC_VERSION' ) || version_compare( WC_VERSION, self::$required_woo, '<' ) ) {
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
		echo '<div class="error"><p>' . sprintf( __( 'Address Autocomplete requires at least WooCommerce v%1$s in order to function.', 'address-autocomplete-google-places' ), self::$required_woo ) . '</p></div>';
	}

	/**
	 * Plugin action links.
	 *
	 * @since 1.0.0
	 *
	 * @param  array $links List of existing plugin action links.
	 * @return array List of modified plugin action links.
	 */
	public function plugin_action_links( $links ) {
		$settings_url = admin_url( 'admin.php?page=wc-settings&tab=integration&section=address_autocomplete' );
		$custom_links = array(
			'<a href="' . esc_url( $settings_url ) . '">' . esc_html__( 'Settings', 'address-autocomplete-google-places' ) . '</a>',
		);

		return array_merge( $custom_links, $links );
	}
}

Address_Autocomplete::instance();
