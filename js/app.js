TemplateStorage.getTemplate('login', function(template){
    $(document.body).append(template);
    $('.login-button').on('click', function(){
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
            }, 200);
        }, 300);
    });
});

$(document).ready(function(){
    $(window).on('resize', function(){
        console.log($('.filters').width());
    });
});

TemplateStorage.getTemplate('task');

angular.module('helpdesk', ['helpdesk.service']);