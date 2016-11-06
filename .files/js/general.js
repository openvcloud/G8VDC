'use strict';

var __lc = {};
__lc.license = 4357241;

// Collapse accordion every time dropdown is shown
$('.dropdown-accordion').on('show.bs.dropdown', function() {
  var accordion = $(this).find($(this).data('accordion'));
  accordion.find('.panel-collapse.in').collapse('hide');
});

// Prevent dropdown to be closed when we click on an accordion link
$('.dropdown-accordion').on('click', 'a[data-toggle="collapse"]', function(event) {
  event.preventDefault();
  event.stopPropagation();
  $($(this).data('parent')).find('.panel-collapse.in').collapse('hide');
  $($(this).attr('href')).collapse('show');
  $(this).parents('.panel-group').find('.panel-heading.open')
  .not($(this).parents('.panel-heading')).removeClass('open');
  $(this).parents('.panel-heading').toggleClass('open');
});
