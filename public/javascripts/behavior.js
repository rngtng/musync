$(function() {
  $(".create .submit").click(function() {
    var dataString = 'url='+ $(".create input[name='url']").val();
    $.ajax({
      url: "/",
      data: dataString,
      success: function(data) {
        $(".create").hide();
        $(".show").show();
        $(".show input[name='url']").val(data)
        $(".show form").attr('action', data)
      }
    });
    return false;
  });
  
  $(".show .submit").click(function() {
    document.location.href  = $(".show input[name='url']").val();
    return false;
  });
});