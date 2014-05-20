function LoginCntrl($rootScope, $scope, networkManager) {
	$scope.login = function () {
		var username = $('.form input').eq(0).val(),
			password = $('.form input').eq(1).val();
		$.ajax({
			url: '/login-internal/',
			type: 'post',
			data: {
				username: username,
				password: password
			},

			complete: function (jqXhr, statusText) {
	            if (jqXhr.status != 200) {
	            /*    $('.login-form input[type=text], .login-form input[type=password]').val('');
	                $('.login-form .error').show();
	                $('.login-form input[type=text]').focus();*/
	            }
	        },

	        success: function (data) {
	        	$('.login').fadeOut('400', function() {
	        		$(this).hide();
	        	});
	        	networkManager.connect();
	        	$rootScope.$broadcast('login');
				$rootScope.$broadcast('set-tab', { tabName: 'tasks' });
	        }
	    });
	}
}