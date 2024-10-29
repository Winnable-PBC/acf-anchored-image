/* global acf, jQuery */
import './style.css'

const $ = jQuery
acf.fields.anchored_image = acf.field.extend({
    $el: null,
    actions: {
        append: 'initialize',
        ready: 'initialize',
    },

    add: function () {
        const self = this
        let $field = this.$field
        const $repeater = acf.get_closest_field($field, 'repeater')

        acf.media.popup({
            field: acf.get_field_key($field),
            library: this.o.library,
            mime_types: this.o.mime_types,
            mode: 'select',
            multiple: $repeater.exists(),
            select: (attachment, i) => {
                if (i > 0) {
                    let $tr = $field.closest('.acf-row'),
                        key = acf.get_field_key($field)

                    $field = false
                    $tr.nextAll('.acf-row:visible').each(() => {
                        $field = acf.get_field(key, $(this))

                        if (!$field) return

                        if (
                            $field
                                .find('.acf-image-uploader.has-value')
                                .exists()
                        ) {
                            $field = false
                            return
                        }

                        return false
                    })

                    if (!$field) {
                        $tr = acf.fields.repeater.doFocus($repeater).add()
                        if (!$tr) return false
                        $field = acf.get_field(key, $tr)
                    }
                }

                self.doFocus($field)
                self.render(self.prepare(attachment))

                open_dialog(self.$el)
            },
            title: acf._e('image', 'select'),

            type: 'image',
        })
    },

    change: function (e) {
        this.$el.find('[data-name="id"]').val(e.$el.val())
    },

    edit: function () {
        const self = this
        const id = this.$el.find('.acf-image-value').data('image-id')

        acf.media.popup({
            button: acf._e('image', 'update'),
            id: id,
            mode: 'edit',
            select: function (attachment) {
                self.render(self.prepare(attachment))
            },
            title: acf._e('image', 'edit'),

            type: 'image',
        })
    },

    events: {
        'change input[type="file"]': 'change',
        'click a[data-name="add"]': 'add',
        'click a[data-name="edit"]': 'edit',
        'click a[data-name="remove"]': 'remove',
    },

    focus: function () {
        this.$el = this.$field.find('.acf-image-uploader')
        this.o = acf.get_data(this.$el)
    },

    initialize: function () {
        if (this.o.uploader == 'basic') {
            this.$el.closest('form').attr('enctype', 'multipart/form-data')
        }
    },

    prepare: function (attachment) {
        let image = {
            id: attachment.id,
            origUrl: attachment.attributes.url,
            url: attachment.attributes.url,
        }

        if (
            acf.isset(
                attachment.attributes,
                'sizes',
                this.o.preview_size,
                'url',
            )
        ) {
            image.url = attachment.attributes.sizes[this.o.preview_size].url
        }

        return image
    },

    remove: function () {
        const attachment = {
            id: '',
            origUrl: '',
            url: '',
        }

        this.render(attachment)
        this.$el.removeClass('has-value')
    },

    render: function (image) {
        this.$el.find('[data-name="image"]').attr('src', image.url)
        this.$el.find('[data-name="image"]').data('original-url', image.origUrl)
        this.$el.find('[data-name="id"]').val(image.id).trigger('change')

        this.$el.addClass('has-value')
    },

    type: 'anchored_image',
})

const initialize_field = ($el) => {
    const $editLink = $el.find('.edit-anchor'),
        $field = $el,
        $wrapper = $field.find('.anchor-image-wrapper'),
        $img = $wrapper.find('img'),
        $okButton = $el.find('.save-anchor-button')

    $field.find('.acf-image-value').on('change', function () {
        const imageId = $(this).val()
        const $value = $field.find('.acf-image-value')

        if (imageId) {
            $field.removeClass('invalid')
            $value.data('image-id', imageId)
            $value.val(
                JSON.stringify({
                    image: imageId,
                }),
            )
        }
    })

    set_marker_position($field)
    $(window).resize(() => set_marker_position($field))
    $img.click((e) => handle_image_click($el, e))

    $editLink.click((e) => {
        e.preventDefault()
        open_dialog($el)
        return false
    })

    $okButton.click((e) => {
        e.preventDefault()
        update_anchor_value($el)
        close_dialog($el)
        return false
    })
}

const close_dialog = ($el) => {
    $el.find('.anchor-selection').removeClass('open')
}

const set_marker_position = ($el) => {
    const $wrapper = $el.find('.anchor-image-wrapper'),
        $img = $wrapper.find('img'),
        $marker = $wrapper.find('.marker')

    if ($img.exists()) {
        setTimeout(() => {
            const markerLeft =
                $img.position().left + $img.width() * $marker.data('position-x')
            const markerTop =
                $img.position().top + $img.height() * $marker.data('position-y')

            $marker.css({
                left: markerLeft + 'px',
                top: markerTop + 'px',
            })
        }, 100)
    }
}

const handle_image_click = ($el, e) => {
    const $wrapper = $el.find('.anchor-image-wrapper'),
        $img = $wrapper.find('img'),
        $marker = $wrapper.find('.marker'),
        newX = e.offsetX / $img.width(),
        newY = e.offsetY / $img.height()

    $marker.data('position-x', newX)
    $marker.data('position-y', newY)

    set_marker_position($el)
}

const open_dialog = ($el) => {
    const $marker = $el.find('.anchor-image-wrapper .marker'),
        imageSrc = $el.find('[data-name="image"]').data('original-url'),
        inputVal = $el.find('.acf-image-value').val(),
        value = JSON.parse(inputVal)

    if (imageSrc) {
        $el.find('.anchor-image-wrapper img').attr('src', imageSrc)
    }

    if (value && value.anchor) {
        $marker.data('position-x', value.anchor.x)
        $marker.data('position-y', value.anchor.y)
    } else {
        $marker.data('position-x', 0.5)
        $marker.data('position-y', 0.5)
    }

    set_marker_position($el)
    $el.find('.anchor-selection').addClass('open')
}

const update_anchor_value = ($el) => {
    const $anchorLabelX = $el.find('.anchor-position-x'),
        $anchorLabelY = $el.find('.anchor-position-y'),
        $input = $el.find('.acf-image-value'),
        $wrapper = $el.find('.anchor-image-wrapper'),
        $marker = $wrapper.find('.marker'),
        origValue = $input.val(),
        x = $marker.data('position-x'),
        y = $marker.data('position-y')

    let newValue = {}
    if (origValue) {
        newValue = JSON.parse(origValue)
    }

    if (typeof newValue !== 'object') {
        newValue = { image: newValue }
    }

    $anchorLabelX.text((x * 100).toFixed(2))
    $anchorLabelY.text((y * 100).toFixed(2))

    newValue.anchor = {
        x: x,
        y: y,
    }

    $input.val(JSON.stringify(newValue))
}

if (typeof acf.add_action !== 'undefined') {
    acf.add_action('ready append', ($el) =>
        acf.get_fields({ type: 'anchored_image' }, $el).each(function () {
            initialize_field($(this))
        }),
    )
}
