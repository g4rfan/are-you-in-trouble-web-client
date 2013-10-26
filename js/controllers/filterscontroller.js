/**
 * Created by garffan on 10/21/13.
 */

function filterCntrl($scope, filtersProvider) {
    $scope.filters = filtersProvider.getFilters();
    $scope.events = {};

    var selectedFilters = {};

    $scope.events.click = function($event) {
        var target = $($event.target || $event.srcElement);
        var id = target.attr('data-id');
        if (target.hasClass('color-set')) {
            target.removeClass('color-set').css('background', 'transparent');
            delete selectedFilters[id];
        } else {
            for(var i = 0; i < $scope.filters.length; ++i) {
                if (id == $scope.filters[i].id) {
                    target.addClass('color-set').css('background', $scope.filters[i].color);
                    selectedFilters[id] = $scope.filters[i];
                }
            }
        }
        filtersProvider.events.fire('filters set changed', selectedFilters);
    };
}