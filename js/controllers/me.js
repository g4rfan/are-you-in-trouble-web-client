function MeCntrl ($scope, me) {
    $scope.me = {};
    $scope.$watch(me.getMyself, function (newVal) {
        $scope.me = newVal;
    });
}