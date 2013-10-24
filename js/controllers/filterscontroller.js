/**
 * Created by garffan on 10/21/13.
 */

function filterCntrl($scope, filterProvider) {
    $scope.filters = filterProvider.getFilters();
}