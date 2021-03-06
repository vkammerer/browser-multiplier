(function() {

	var $body = document.getElementsByTagName('body')[0];
	var $a = document.getElementsByTagName('a');
	var $inactiveLayer = document.getElementById('inactiveLayer');

	var messageParent = function(message) {
		message.browserIndex = window.sevenBrowsers.browserIndex;
		message.iframeIndex = window.sevenBrowsers.iframeIndex;
		message.pageUrl = window.sevenBrowsers.pageUrl;
		window.parent.postMessage(message, '*');
	};

	/*
		Links events
	*/

	var hashLinkRegexp = new RegExp('^' + window.sevenBrowsers.pageUrl + '/#');

	var isCorrectLink = function(link) {
		if (link.href.match(hashLinkRegexp)) {
			return false;
		}
		else {
			return true;
		}
	};

	var onLinkMouseover = function(e) {
		e.stopPropagation();
		e.preventDefault();
		if (isCorrectLink(this)) {
			messageParent({
				action:'mouseover',
				href: this.href
			});
		}
	};
	var onLinkMouseout = function(e) {
		if (isCorrectLink(this)) {
			messageParent({
				action:'mouseout'
			});
		}
	};

	var onLinkClick = function(e) {
		e.stopPropagation();
		e.preventDefault();
		if (isCorrectLink(this)) {
			messageParent({
				action:'click'
			});
		}
	};

	for (var i = 0; i < $a.length; i++) {
		$a[i].addEventListener('mouseover', onLinkMouseover, false);
		$a[i].addEventListener('mouseout', onLinkMouseout, false);
		$a[i].addEventListener('click', onLinkClick, false);
	}

	/*
		Inactive layer click
	*/
	var onInactiveLayerClick = function(e) {
		messageParent({
			action : 'bodyclick'
		});
	};

	$inactiveLayer.addEventListener('click', onInactiveLayerClick, false);

	/*
		Postmessage events
	*/
	var receiveMessage = function(e) {

		if (
			(e.origin !== window.location.origin)
		){
			return false;
		}

		else if (e.data.availability) {
			$body.classList.remove('inactive');
		}
		else {
			$body.classList.add('inactive');
		}

	};

	window.addEventListener('message', receiveMessage, false);

	messageParent({
		action : 'ready',
		pageTitle : document.title
	});

})();
