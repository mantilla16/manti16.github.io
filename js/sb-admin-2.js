(function($) {
  "use strict"; // Start of use strict

  // Toggle the side navigation
  $("#sidebarToggle, #sidebarToggleTop").on('click', function(e) {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
      $('.sidebar .collapse').collapse('hide');
    };
  });

  // Close any open menu accordions when window is resized below 768px
  $(window).resize(function() {
    if ($(window).width() < 768) {
      $('.sidebar .collapse').collapse('hide');
    };
    
    // Toggle the side navigation when window is resized below 480px
    if ($(window).width() < 480 && !$(".sidebar").hasClass("toggled")) {
      $("body").addClass("sidebar-toggled");
      $(".sidebar").addClass("toggled");
      $('.sidebar .collapse').collapse('hide');
    };
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });

  // Scroll to top button appear
  $(document).on('scroll', function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on('click', 'a.scroll-to-top', function(e) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    e.preventDefault();
  });

})(jQuery); // End of use strict

jQuery(document).ready(function($){ //Mostrar la tabla en el index
  $("div#link2 a").click(function(event){

    link2=$(this).attr("href");
    $.ajax({
      url: link2,
      // type: '',
      // dataType:'',
      // data:{param1: 'value1'},

    })
    .done(function(html){
      $("#contentTable").empty().append(html);
    })
    .fail(function(){
      console.log("error");
    })
    .always(function(){
      console.log("complete");
    });
    return false;
  });  
}); //Fin mostrar tabla en index

  //Pare clave de la autenticacion: 
  /*
    Primero creamos una funcion para el logout, en esta funcion basicamente borramos todo lo que almacenamos en el localstorage.
    La informacion que guardamos en el localstorage la traemos en este caso de un enpoint que viene con la informacion del usuario.
    Usamos el removeItem('nombre_variable') para borrar una variable previamente creada en el 
  
  */
  function logout() {
    localStorage.clear
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('rol');
      localStorage.removeItem('usuario');
      window.location.href = 'login.html';
  }
  document.addEventListener('DOMContentLoaded', () => {
    const rol = localStorage.getItem('rol');

    const adminMenu = document.getElementById('link2');
    const standardMenu = document.getElementById('standardMenu');
    const notifierMenu = document.getElementById('notifierMenu');

    if (adminMenu && standardMenu && notifierMenu) {
        if (rol === 'administrador') {
            adminMenu.style.display = 'block';
        } else if (rol === 'Estandar') {
            standardMenu.style.display = 'block';
        } else if (rol === 'Notificador') {
            notifierMenu.style.display = 'block';
        } else {
            adminMenu.style.display = 'none';
            standardMenu.style.display = 'none';
            notifierMenu.style.display = 'none';
        }
    }
});










