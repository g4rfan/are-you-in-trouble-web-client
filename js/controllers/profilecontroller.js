/**
 * Created by garffan on 10/2/13.
 */

function ProfilesCtrl($scope, $compile, networkManager, profileProvider, universityDepProvider, subDepartProvider) {
    $scope.profiles = profileProvider.getProfiles();
    $scope.uniDeps = universityDepProvider.getUniversityDep();
    $scope.subDeps = subDepartProvider.getSubDeps();
    $scope._domRef = $('.opened-profile');

    $scope.getSubDep = function (subDepId) {
        var subDep = null;
        for (var i = 0; i < $scope.subDeps.length; ++i) {
            if ($scope.subDeps[i].id == subDepId) {
                subDep = $scope.subDeps[i];
                break;
            }
        }

        return subDep ? subDep.name : '-';
    };

    $scope.getUniDep = function (uniDepId) {
        var uniDep = null;
        for (var i = 0; i < $scope.uniDeps.length; ++i) {
            if ($scope.uniDeps[i].id == uniDepId) {
                uniDep = $scope.uniDeps[i];
                break;
            }
        }

        return uniDep ? uniDep.name : '-';
    };

    globalEvents.addEventListener('tab changed', function(data) {
        if (data.tabName != 'tasks') {
            profileProvider.getProfilesFromServer(true);
            $scope.$digest();
        }
    });

    $scope.openProfile = function (profileId) {
        var i = 0, len = $scope.profiles.length, profile = null;
        while (i < len) {
            if ($scope.profiles[i].id == profileId) {
                profile = $scope.profiles[i];
                break;
            }
            ++i;
        }
        var scope = $scope.$new();
        scope.data = profile;
        scope.subDeps = $scope.subDeps;
        scope.uniDeps = $scope.uniDeps;
        scope.roles = [
            { id : 1, name : "Клиент" },
            { id : 2, name : "Помощник" }
        ];

        scope.selectedRole = 0;
        scope.selectedSubDep = 0;

        scope.saveProfile = function () {
            networkManager.request('profiles:save', { id : profileId, displayName : (scope.newDisplayName ? scope.newDisplayName : profile.displayName), phone : (scope.newPhone ? scope.newPhone : profile.phone) }, function (event) {
                profile.displayName = (scope.newDisplayName ? scope.newDisplayName : profile.displayName);
                profile.phone = (scope.newPhone ? scope.newPhone : profile.phone);
            });
        };

        scope.removeProfile = function () {
            networkManager.request('profiles:remove', { profileId : profileId }, function() {
                for (var i = 0; i < $scope.profiles.length; ++i) {
                    if ($scope.profiles[i].id == profileId) {
                        $scope.profiles.splice(i, 1);
                        break;
                    }
                }
                $scope.$digest();
                $('.opened-profile, .blackout').hide();
            });
        };

        scope.saveChanges = function (type) {
            if (type == "unidep") {
                networkManager.request('profiles:make client', { userId : profileId, universityDepartmentId : scope.selectedUniDep }, function () {
                    profile.subdepartmentId = -1;
                    profile.universityDepartmentId = scope.selectedUniDep;
                    scope.$digest();
                    $scope.$digest();
                });
            }

            if (type == 'helper') {
                networkManager.request('profiles:make helper', { userId : profileId, chief : false, subdepartmentId : scope.selectedSubDep }, function () {
                    profile.subdepartmentId = scope.selectedSubDep;
                    profile.universityDepartmentId = -1;
                    scope.$digest();
                    $scope.$digest();
                });
            }

            if (type == 'subDep') {
                networkManager.request('profiles:make helper', { userId : profileId, chief : true, subdepartmentId : scope.selectedSubDep }, function () {
                    profile.subdepartmentId = scope.selectedSubDep;
                    profile.universityDepartmentId = -1;
                    scope.$digest();
                    $scope.$digest();
                });
            }

            if (type == 'root') {
                networkManager.request('profiles:make department chief', { userId : profileId }, function () {
                    profile.subdepartmentId = -1;
                    profile.universityDepartmentId = -1;
                    scope.$digest();
                    $scope.$digest();
                });
            }
        };

        var nElement = $compile(TemplateStorage.templates['profile'])(scope);
        $scope._domRef.empty();
        $scope._domRef.append(nElement);

        $scope._domRef.css({
            top : document.body.clientHeight/2 - 330,
            left : document.body.clientWidth/2 - 330
        }).show();
        $('.close-button', $scope._domRef).on('click', function () { $scope._domRef.hide(); $('.blackout').hide(); });
        $('.blackout').show();
    };

    globalEvents.addEventListener('login', function () {
        universityDepProvider.getUniversityDepFromServer();
        subDepartProvider.getSubDepartFromServer();
        profileProvider.getProfilesFromServer(true);
        $scope.$digest();
    });
}