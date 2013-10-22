var tlogin = false;

TemplateStorage.getTemplate('login', function(template){
    $(document.body).append(template);
    $('.login-button').on('click', function(){
        login();
    });
});


function login(){
    $.ajax({
        url : '/login-internal/',
        type : 'post',
        data : { username : $('#username').val(), password : $('#password').val() },
        complete : function(jqXhr, statusText){
            if(jqXhr.status == 403){
                $('.login-form input[type=text], .login-form input[type=password]').val('');
            }
        },

        success : function(data){
            console.log(angular.module('helpdesk.service').value('networkManager'));
            var back = $('.login-background');
            back.css({
                height : $(document.body).height(),
                bottom : '',
                top : '-' + (back.height() - 45) + 'px'
            });

            setTimeout(function(){
                back.css('opacity', 0);
                setTimeout(function(){
                    back.hide();
                    tlogin = true;
                    setTimeout(function(){
                        globalInitSocket();
                        onlogin();
                    }, 300);
                }, 200);
            }, 300);
        }
    });
}

$(document).ready(function(){
    $(window).on('resize', function(){
        console.log($('.filters').width());
    });

});

TemplateStorage.getTemplate('task');
TemplateStorage.getTemplate('filters', function(template){
    $('.filters').append(template);
});

angular.module('helpdesk', ['helpdesk.service']);