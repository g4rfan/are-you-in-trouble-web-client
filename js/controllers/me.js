function MeCntrl ($scope, me) {
	$scope.getMe = function () {
		if (me.me) {
			return me.me;
		} else {
			return {};
		}
	}
}