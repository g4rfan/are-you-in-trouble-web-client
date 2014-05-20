angular.module('helpdesk.service').factory('me', function ($rootScope, networkManager) {
	var me = null;

	function getMe() {
		networkManager.request('profiles:retrieve', {}, function (data) {			
			if (data.length) {
				me = data[0];
				console.log(me);
			}
		})
	}

	$rootScope.$on('login', function () {	
		getMe();
	});

	return {
		me: me
	}
});