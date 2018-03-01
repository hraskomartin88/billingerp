$('body').on('click','.sidebar-nav li:not(.sidebar-brand)', function(){
  $('.sidebar-nav li').removeClass('selected');
  $(this).addClass('selected');
});

$('body').on('click', '.sidebar-brand', function(e){
  e.preventDefault();
  $('#wrapper').toggleClass('toggled');
});