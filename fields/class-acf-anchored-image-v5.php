<?php

if (!defined('ABSPATH')) {
    exit();
}

if (!class_exists('acf_field_anchored_image')):
    class acf_field_anchored_image extends acf_field
    {
        public function __construct()
        {
            $this->name = 'anchored_image';
            $this->label = __('Image - Anchored');
            $this->category = 'content';
            $this->defaults = [
                'return_format' => 'array',
                'preview_size' => 'medium',
            ];

            parent::__construct();
        }

        public function get_field_data($field)
        {
            $data = new stdClass();
            $data->image = '';
            $data->image_source = '';
            $data->width = '';
            $data->height = '';
            $data->anchor = new stdClass();
            $data->anchor->x = 0.5;
            $data->anchor->y = 0.5;

            if (empty($field['value'])) {
                return $data;
            }

            $raw_data = json_decode($field['value']);

            if (!is_object($raw_data)) {
                $data->image = $raw_data;
            } else {
                $data->image = $raw_data->image;

                if (is_object($raw_data->anchor)) {
                    $data->anchor = $raw_data->anchor;
                }
            }

            $src = wp_get_attachment_image_src($data->image, 'full');
            $data->image_source = $src[0];
            $data->width = $src[1];
            $data->height = $src[2];

            return $data;
        }

        public function input_admin_enqueue_scripts()
        {
            $dir = plugin_dir_url(__FILE__);

            wp_register_script(
                'acf-input-anchored_image',
                "{$dir}../dist/input.js",
                ['acf-input', 'imgareaselect']
            );

            wp_register_style(
                'acf-input-anchored_image',
                "{$dir}../dist/style.css",
                ['acf-input']
            );

            wp_enqueue_script(['acf-input-anchored_image']);
            wp_enqueue_style(['acf-input-anchored_image', 'imgareaselect']);
        }

        public function render_field($field)
        {
            acf_enqueue_uploader();
            $field_data = $this->get_field_data($field);

            $div_atts = [
                'class' => 'acf-image-uploader acf-anchored-image',
                'data-field-settings' => json_encode($field),
                'data-preview_size' => $field['preview_size'],
            ];

            if (!isset($field['value'])) {
                $field['value'] = '';
            }

            $input_atts = [
                'type' => 'hidden',
                'name' => $field['name'],
                'value' => htmlspecialchars($field['value']),
                'class' => 'acf-image-value',
                'data-name' => 'id',
                'data-image-id' => $field_data->image,
            ];

            $url = '';

            if ($field_data->image) {
                $div_atts['class'] .= ' has-value';
                $preview_atts = wp_get_attachment_image_src(
                    $field_data->image,
                    $field['preview_size']
                );
                $url = $preview_atts[0];
            }
            ?>
            <div <?php acf_esc_attr_e($div_atts); ?>>
                <div class="acf-hidden">
                    <input <?php acf_esc_attr_e($input_atts); ?> />
                </div>
                <div class="view show-if-value acf-soh">
                    <ul class="acf-hl acf-soh-target">
                        <li><a class="acf-icon -pencil dark" data-name="edit" href="#"><i class="acf-sprite-edit"></i></a></li>
                        <li><a class="acf-icon -cancel dark" data-name="remove" href="#"><i class="acf-sprite-delete"></i></a></li>
                    </ul>
                    <img data-name="image" src="<?php echo $url; ?>" alt="" />
                    <div class="edit-anchor-wrapper">
                        <?php _e('Anchor: ', 'acf-image_with_anchor'); ?>&nbsp;
                        <span class="anchor-position-x"><?php echo round(
                            $field_data->anchor->x * 100,
                            2
                        ); ?></span>%&nbsp;
                        <span class="anchor-position-y"><?php echo round(
                            $field_data->anchor->y * 100,
                            2
                        ); ?></span>%&nbsp;
                        <a href="#" class="edit-anchor"><?php _e(
                            'Edit',
                            'acf-image_with_anchor'
                        ); ?></a>
                    </div>
                </div>
                <div class="view hide-if-value">
                    <p><?php _e(
                        'No image selected',
                        'acf'
                    ); ?> <a data-name="add" class="acf-button button" href="#"><?php _e('Add Image', 'acf'); ?></a></p>
                </div>
                <div class="anchor-selection">
                    <div class="anchor-stage">
                        <div class="anchor-frame-title">
                            <h1><?php _e(
                                'Click an on the image to select an anchor point',
                                'acf-image_with_anchor'
                            ); ?></h1>
                        </div>
                        <div class="stage-inner">
                            <div class="anchor-image-wrapper">
                                <img src="<?php echo $field_data->image_source; ?>" data-width="<?php echo $field_data->width; ?>" data-height="<?php echo $field_data->height; ?>" />
                                <div class="marker" data-position-x="<?php echo $field_data
                                    ->anchor
                                    ->x; ?>" data-position-y="<?php echo $field_data->anchor->y; ?>"></div>
                            </div>
                            <div class="sidebar">
                                <p class="description">
                                    <?php _e(
                                        'The anchor position is when cropping and positioning the image. If the image must be cropped to fit, especially on smaller screens, the image will be cropped such that the anchor point is kept in frame.',
                                        'acf-image_with_anchor'
                                    ); ?>
                                </p>
                            </div>
                        </div>
                        <div class="anchor-frame-footer">
                            <a href="#" class="button button-large save-anchor-button"><?php _e(
                                'Save',
                                'acf-image_with_anchor'
                            ); ?></a>
                        </div>
                    </div>
                </div>
            </div>
<?php
        }

        public function render_field_settings($field)
        {
            acf_render_field_setting($field, [
                'label' => __('Preview Size', 'acf'),
                'instructions' => __('Shown when entering data', 'acf'),
                'type' => 'select',
                'name' => 'preview_size',
                'choices' => acf_get_image_sizes(),
            ]);
        }

        public function update_value($value, $post_id, $field)
        {
            return $value;
        }

        public function validate_value($valid, $value, $field, $input)
        {
            return $valid;
        }
    }

    new acf_field_anchored_image();
endif;
