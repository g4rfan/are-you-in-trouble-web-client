angular.module('helpdesk.service').service('me', function ($rootScope, networkManager) {
    var me = {};

	function getMe() {
		networkManager.request('profiles:retrieve', {}, function (data) {			
			if (data.length) {
				me = data[0];
				$rootScope.$apply();
			}
		});
	}

	$rootScope.$on('login', function () {	
		getMe();
	});

    this.getMyself = function () {
        return me;
    };
});