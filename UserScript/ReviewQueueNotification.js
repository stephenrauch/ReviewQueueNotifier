/** @preserve
// ==UserScript==
// @name Review Queue Notification
// @author Malachi with help from Simon Forsberg
// @description Shows a desktop notification when there review items in the queue.
// @namespace https://github.com/malachi26/ReviewQueueNotifier
// @version 2.1.3
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_notification
// @grant Notifications
// @match *://*.stackexchange.com/review
// @match *://*.stackoverflow.com/review
// @match *://*.mathoverflow.net/review
// @match *://*.serverfault.com/review
// @match *://*.askubuntu.com/review
// @match *://*.stackapps.com/review
// @match *://*.superuser.com/review
// @icon https://github.com/malachi26/ReviewQueueNotifier/raw/master/Resources/Icon2.png
// ==/UserScript==
*/

Notification.requestPermission();

var KEY_NEXT = 'NextReload';
var DELAY = 120 * 1000; //120,000 milliseconds = 2 minutes
var currentTime = Date.now ? Date.now() : new Date().getTime();
var lastTime = GM_getValue(KEY_NEXT, 0);
var nextTime = currentTime + DELAY;
GM_setValue(KEY_NEXT, nextTime);

var timeDiff = Math.abs(lastTime - currentTime);
setTimeout(function(){
    window.location.reload();
}, DELAY);

document.title = document.title.split(' - ')[1] + ' Review Queue'; // keep the site name

// a way to detect that the script is being executed because of an automatic script reload, not by the user.
if (timeDiff <= DELAY * 2) {
    var reviewCount = 0;
    var reviewItems = document.getElementsByClassName('dashboard-num');


    for (var i = 0; i < reviewItems.length; i++){
        if (reviewItems[i].parentNode.className != 'dashboard-count dashboard-faded'){
            reviewTitle = reviewItems[i].parentNode.parentNode.getElementsByClassName('dashboard-title')[0].outerText;
            if (reviewTitle != 'Documentation: Proposed Changes' && reviewTitle != 'Triage') {
                reviewCount += parseInt((reviewItems[i].getAttribute("title")).replace(',', ''), 10);
            }
            console.log(reviewItems[i]);
        }
    }
    console.log(reviewCount);

    if (reviewCount > 0) {
        var details = {
            body: reviewCount + ' Review Items',
            icon: 'https://github.com/malachi26/ReviewQueueNotifier/raw/master/Resources/Icon2.png'
        }
        var n = new Notification(document.title.replace(' Stack Exchange', '.SE'), details );
        setTimeout(n.close.bind(n), 15000);
    }
}
