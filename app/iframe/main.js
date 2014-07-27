(function($) {

    var currentPosition;
    var $body = $('body');

    var hashLinkRegexp = new RegExp('^' + window.vkSiteUrl + '/#');

    var isCorrectLink = function(link) {
        if (
            (link.href.match(hashLinkRegexp)) ||
            ($(link).hasClass('lightbox-processed'))
        ){
            return false;
        }
        else {
            return true;
        }
    }

    $('a').bind('mouseover', function(e) {
        e.stopPropagation();
        e.preventDefault();
        console.log(this.href);
        if (isCorrectLink(this)) {
            window.parent.postMessage({
                action:'hover',
                href: this.href
            }, '*');
        }
    })

    $('a').bind('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (isCorrectLink(this)) {
            window.parent.postMessage({
                action:'click'
            }, '*');
        }
    });

    $('#inactiveLayer').bind('click', function(e) {
        if (currentPosition !== 3) {
            window.parent.postMessage({
                action:'bodyclick',
            }, '*');
        }
    })

    var receiveMessage = function(e) {

        if (e.origin !== window.location.origin) {
            return false;
        }

        currentPosition = e.data.position;

        if (currentPosition === 3) {
            $body.removeClass('inactive');
        }
        else {
            $body.addClass('inactive');
        }

    }

    window.addEventListener('message', receiveMessage, false);

    window.parent.postMessage({
        action:'ready',
    }, '*');

})(jQuery)
