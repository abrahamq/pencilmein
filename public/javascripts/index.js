$( function(){
  $('#availability').each(function () {
    var y = $(document).scrollTop();
    var t = $(this).parent().offset().top;
    if (y > t) {
      $(this).fadeIn(800);
    } else {
      //$(this).fadeOut();
    }
  });

}); 
