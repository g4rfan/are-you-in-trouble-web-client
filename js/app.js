var tlogin = false;

var globalEvents = new EventEmitter({
    'login' : [],
    'logout' : []
});

function logout() {
    $.ajax({
        url: '/logout/',
        type: 'get',
        success : function(data) {
            var back = $('.login-background');
            back.show();
            tlogin = false;
            back.css({
                height : $(document).height(),
                bottom: '',
                top: 0,// back.height(),
                opacity : 1
            });

            setTimeout(function () {
                back.css({
                    height: 'auto',
                    bottom: 0,
                    top : 0
                });
                location.reload();

                globalEvents.fire('logout');
            }, 300);
        }
    });
}

TemplateStorage.getTemplate('login', function (template) {
    $(document.body).append(template);
    $('.login-background input').on('keyup', function (event) {
        if (event.keyCode == 13) {
            login();
        }
    });
    $('.login-button').on('click', function () {
        login();
    });
});


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function login() {
    $.ajax({
        url: '/login-internal/',
        type: 'post',
        data: { username: $('#username').val(), password: $('#password').val() },
        complete: function (jqXhr, statusText) {
            if (jqXhr.status == 403) {
                $('.login-form input[type=text], .login-form input[type=password]').val('');
            }
        },

        success: function (data) {
            var back = $('.login-background');
            back.css({
                height: $(document.body).height(),
                bottom: '',
                top: '-' + (back.height() - 45) + 'px'
            });

            setTimeout(function () {
                back.css('opacity', 0);
                setTimeout(function () {
                    back.hide();
                    tlogin = true;
                    setTimeout(function () {
                        globalEvents.fire('login');
                    }, 300);
                }, 200);
            }, 300);
        }
    });
}

$(document).ready(function () {
    $(window).on('resize', function () {
        var bodyWidth = $('body').width(), bodyHeight = $('body').height();
        $('.new-task').css({
            left : bodyWidth / 2 - 150,
            top : bodyHeight / 2 - 189
        });
    });

    $('.add-new-task-button').on('click', function (event) {
        $('.blackout, .new-task').show();
        var bodyWidth = $('body').width(), bodyHeight = $('body').height();
        $('.new-task').css({
            left : bodyWidth / 2 - 150,
            top : bodyHeight / 2 - 189
        });
    });
    $('.close-button').on('click', function (event) {
        $('.opened-task, .new-task, .blackout').hide();
    });

    $('.table-mode').on('click', function (event) {
        $('.task-list').hide();
        $('.table-view').show();
    });

    $('.grid-mode').on('click', function (event) {
        $('.table-view').hide();
        $('.task-list').show();
    });

    $('.logout').on('click', function (event) {
        logout();
    });
});

TemplateStorage.getTemplate('task');
TemplateStorage.getTemplate('filters', function (template) {
    $('.filters').append(template);
});

angular.module('helpdesk', ['helpdesk.service']);