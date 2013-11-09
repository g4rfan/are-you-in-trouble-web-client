/**
 * Created by garffan on 10/2/13.
 */

function profilesCtrl($scope, $compile, networkManager, profilesProvider, universityDepProvider, filtersProvider, subDepartProvider) {
    $scope.offset = 0;
    $scope.limit = 18;
    $scope.profiles = profilesProvider.getProfiles();
    $scope.uniDeps = universityDepProvider.getUniversityDep();
    $scope.subDeps = subDepartProvider.getSubDeps();
    $scope.filters = filtersProvider.getFilters();
    $scope.selectedFilters = {};

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
        if (data.tabName == 'profiles') {
            profilesProvider.getProfilesFromServer(true);
            $('.view.active').removeClass('active');
            $('.view.profiles').addClass('active');
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
            top : $(window).height()/2 - 330,
            left : document.body.clientWidth/2 - 330
        }).show();
        $('.close-button', $scope._domRef).on('click', function () { $scope._domRef.hide(); $('.blackout').hide(); });
        $('.blackout').show();
    };

    filtersProvider.events.addEventListener('filters set changed', function (event) {
        if (event.sender == 'tasks') return;

        var data = event.selectedFilters;

        var params = {};

        var udi = [], sdi = [];

        for (var key in data.universityDep) {
            udi.push(key);
        }

        for (var key in data.subDeps) {
            sdi.push(key);
        }

        params.filters = {};
        if (udi.length != 0) {
            params.filters.universityDepartmentId = udi;
        }

        if (sdi.length != 0) {
            params.filters.subdepartmentId = sdi;
        }
        $scope.selectedFilters = params;
        profilesProvider.getProfilesFromServer(true, params);
    });

    filtersProvider.events.addEventListener('filters got', function (data) {
        $scope.filters = filtersProvider.getFilters();
    });

    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
            if ($('.profiles-view').hasClass('active')) {
                $scope.selectedFilters.limit = $scope.limit;
                $scope.selectedFilters.offset = $scope.offset;

                profilesProvider.getProfilesFromServer(false, $scope.selectedFilters, function (data) {
                    if (data.length != 0) {
                        $scope.limit = 10;
                        $scope.offset += $scope.limit;
                    }
                });
            }
        }
    });

    $scope.filterValue = '';

    $scope.filterFunction = function (profile) {
        return profile.displayName.indexOf($scope.filterValue) != -1;
    };

    globalEvents.addEventListener('search-value-changed', function (data) {
        $scope.filterValue = data.value;
        $scope.$digest();
    });

    globalEvents.addEventListener('login', function () {
        universityDepProvider.getUniversityDepFromServer();
        subDepartProvider.getSubDepartFromServer();
        profilesProvider.getProfilesFromServer(true);
        filtersProvider.getFiltersFromServer();
        $scope.$digest();
    });
}