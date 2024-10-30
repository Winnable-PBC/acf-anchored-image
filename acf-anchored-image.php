<?php
/*
 * Plugin Name:         Advanced Custom Fields: Anchored Image Field Type
 * Plugin URI:          https://github.com/winnable-pbc/acf-anchored-image
 * Description:         An ACF field type that prompts the user to select an anchor point on the image. Useful for images that will be used as backgrounds, or might otherwise be cropped.
 * Version:             1.0
 * Author:              Winnable
 * Author URI:          https://winnable.app/
 * License:             Proprietary
 * GitHub Plugin URI:   winnable-pbc/acf-anchored-image
 * GitHub Plugin URI:   https://github.com/winnable-pbc/acf-anchored-image
 * GitHub Branch:       main
 */

if (!defined('ABSPATH')) {
    exit();
}

if (!class_exists('acf_plugin_anchored_image')):
    class acf_plugin_anchored_image
    {
        public function __construct()
        {
            add_action('acf/include_field_types', [
                $this,
                'include_field_types',
            ]);
        }

        public function include_field_types($version = false)
        {
            include_once 'fields/class-acf-anchored-image-v5.php';
        }
    }

    new acf_plugin_anchored_image();
endif;
