<?php

namespace PreciseSales\Test\Unit;

use WP_UnitTestCase;

class Precise_Sales_Test extends WP_UnitTestCase {

	public function test_sales_time() {
		$product = \WC_Helper_Product::create_simple_product();
		$product->set_props(
			[
				'date_on_sale_from' => '2022-12-01 12:12:00',
				'date_on_sale_to'   => '2022-12-20 11:11:00',
			]
		);

		$product->save();

		$sale = new \PreciseSales();

		$this->assertEquals( '12:12', $sale->get_product_sale_time( $product ) );
		$this->assertEquals( '11:11', $sale->get_product_sale_time( $product, 'to' ) );
	}

	public function test_sale() {
		$product = \WC_Helper_Product::create_simple_product();
		$time    = current_time( 'timestamp' );
		$product->set_props(
			[
				'date_on_sale_from' => date( 'Y-m-d H:i:s', $time ),
				'date_on_sale_to'   => date( 'Y-m-d 23:59:59', $time ),
				'sale_price'        => 20,
				'regular_price'     => 40,
				'price'             => 40,
			]
		);

		$product->save();

		// Let's simulate WC Sales CRON.
		wc_scheduled_sales();

		$this->assertTrue( $product->is_on_sale() );
	}

	public function test_sale_price() {
		$product = \WC_Helper_Product::create_simple_product();
		$time    = current_time( 'timestamp' );
		$product->set_props(
			[
				'date_on_sale_from' => date( 'Y-m-d 00:00:00', $time ),
				'date_on_sale_to'   => date( 'Y-m-d 23:59:59', $time ),
				'sale_price'        => 20,
				'regular_price'     => 40,
				'price'             => 40,
			]
		);

		$product->save();
		$price = $product->get_price();

		$this->assertEquals( 20, $price );
	}

	public function test_no_sale_price() {
		$product = \WC_Helper_Product::create_simple_product();
		$time    = current_time( 'timestamp' ) + MONTH_IN_SECONDS;
		$product->set_props(
			[
				'date_on_sale_from' => date( 'Y-m-d 00:00:00', $time ),
				'date_on_sale_to'   => date( 'Y-m-d 23:59:59', $time ),
				'sale_price'        => 20,
				'regular_price'     => 40,
				'price'             => 40,
			]
		);

		$product->save();
		$price = $product->get_price();

		$this->assertEquals( 40, $price );
	}

}
