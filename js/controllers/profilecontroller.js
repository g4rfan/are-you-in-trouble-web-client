/**
 * Created by garffan on 10/2/13.
 */

function ProfileCtrl($scope) {
    $scope.id = 10;
    $scope.firstName = 'Павел';
    $scope.lastName = 'Орлов';
    $scope.email = 'garffans@outlook.com';
    $scope.getName = function () {
        return $scope.firstName + ' ' + $scope.lastName;
    }
}