$(function() {
    $('.select-basic-multiple-four').each(function () {
        const $el = $(this);
        if ($el.data('select2')) return;
        $el.select2();
    });
});
