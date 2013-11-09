/**
 * Created by garffan on 11/9/13.
 */

function profileCntrl ($scope, profileProvider) {
    $scope.profile = profileProvider.getProfiles();

    profileProvider.events.addEventListener('got profile', function () {
        $scope.profile = profileProvider.getProfiles();
        $scope.$digest();
    });

    globalEvents.addEventListener('login', function () {
        profileProvider.getProfilesFromServer();
        $scope.$digest();
    });
}