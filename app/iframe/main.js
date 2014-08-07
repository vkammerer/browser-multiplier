(function() {

	var	currentPosition,
		middleIframeIndex,
		transitionState;
	var $body = document.getElementsByTagName('body')[0];
	var $a = document.getElementsByTagName('a');
	var $inactiveLayer = document.getElementById('inactiveLayer');

	var messageParent = function(message){
		message.siteIndex = window.sevenBrowsers.siteIndex;
		window.parent.postMessage(message, '*');
	}

	/*
		Links events
	*/

	var hashLinkRegexp = new RegExp('^' + window.sevenBrowsers.siteUrl + '/#');
	var hasClassRegexp = new RegExp('\blightbox-processed\b');

	var isCorrectLink = function(link) {
		if (
			(link.href.match(hashLinkRegexp)) ||
			(link.className.match(hasClassRegexp))
		){
			return false;
		}
		else {
			return true;
		}
	}

	var onLinkMouseover = function(e){
		e.stopPropagation();
		e.preventDefault();
		if (isCorrectLink(this)) {
			messageParent({
				action:'mouseover',
				href: this.href
			});
		}		
	}
	var onLinkMouseout = function(e){
		if (isCorrectLink(this)) {
			messageParent({
				action:'mouseout'
			});
		}		
	}

	var onLinkClick = function(e){
		e.stopPropagation();
		e.preventDefault();
		if (isCorrectLink(this)) {
			messageParent({
				action:'click'
			});
		}
	}

	for (var i = 0; i < $a.length; i++) {
		$a[i].addEventListener('mouseover', onLinkMouseover, false);
		$a[i].addEventListener('mouseout', onLinkMouseout, false);
		$a[i].addEventListener('click', onLinkClick, false);
	}

	/*
		Inactive layer click
	*/
	var onInactiveLayerClick = function(e){
		if (currentPosition !== middleIframeIndex) {
			messageParent({
				action:'bodyclick',
			});
		}
	}

	$inactiveLayer.addEventListener('click', onInactiveLayerClick, false);

	/*
		Postmessage events
	*/
	var receiveMessage = function(e) {

		currentPosition = e.data.currentPosition || currentPosition;
		middleIframeIndex = e.data.middleIframeIndex || middleIframeIndex;
		transitionState = e.data.transitionState || transitionState;

		console.log('yay');
		console.log(window.sevenBrowsers.siteIndex);
		console.log(currentPosition);
		console.log(middleIframeIndex);

		if (
			(e.origin !== window.location.origin) ||
			(typeof(currentPosition) === 'undefined')
		){
			return false;
		}

		else if (
			(transitionState === 'stable') &&
			(currentPosition === middleIframeIndex)
		){
			$body.classList.remove('inactive');
		}
		else {
			$body.classList.add('inactive');
		}

	}

	window.addEventListener('message', receiveMessage, false);

	messageParent({
		action : 'ready',
		pageTitle : document.title
	});


})()
