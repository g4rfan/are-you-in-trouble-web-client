/**
 * Created by garffan on 11/9/13.
 */


function subDepsCntrl ($scope, subDepartProvider) {
    $scope.subDeps = subDepartProvider.getSubDeps();

    globalEvents.addEventListener('tab changed', function(data) {
        if (data.tabName == 'subdeps') {
            subDepartProvider.getSubDepartFromServer();
            $('.view.active').removeClass('active');
            $('.view.subdeps').addClass('active');
            $scope.$digest();
        }
    });

    globalEvents.addEventListener('login', function (data) {
        subDepartProvider.getSubDepartFromServer();
        $scope.$digest();
    });
}