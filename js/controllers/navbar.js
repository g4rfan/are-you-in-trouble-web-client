function NavCntrl ($rootScope) {
	$('aside .icon').off().on('click', function (event) {
		var jqThis = $(this);
		var target = jqThis.attr('data-tab-name');
		$('aside .icon').removeClass('active');
		jqThis.addClass('active');				
		$rootScope.$broadcast('tab-changed', { activeTab: target });
	});

	$rootScope.$on('set-tab', function (event, data) {
		$('aside .icon.active').removeClass('active');
		$('aside .icon[data-tab-name="' + data.tabName +'"]').addClass('active');
		$rootScope.$broadcast('tab-changed', { activeTab: data.tabName });
	});
}