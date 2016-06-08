angular.module('helpdesk.service').factory('TaskTypesProvider', function (networkManager) {
	var storage = [];
		
	return {
		storage: storage
	};
});