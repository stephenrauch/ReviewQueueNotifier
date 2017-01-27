/** @preserve
// ==UserScript==
// @name Review Queue Notification w/o Triage/Docs
// @author Malachi with help from Simon Forsberg
// @description Shows a desktop notification when there review items in the queue.
// @namespace https://github.com/malachi26/ReviewQueueNotifier
// @version 2.2.1x
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_notification
// @grant GM_registerMenuCommand
// @grant GM_unregisterMenuCommand
// @grant Notifications
// @match *://*.stackexchange.com/review
// @match *://*.stackoverflow.com/review
// @match *://*.mathoverflow.net/review
// @match *://*.serverfault.com/review
// @match *://*.askubuntu.com/review
// @match *://*.stackapps.com/review
// @match *://*.superuser.com/review
// @icon https://github.com/malachi26/ReviewQueueNotifier/raw/master/Resources/Icon2.jpg
// ==/UserScript==
*/
Notification.requestPermission();

var KEY_NEXT = 'NextReload';
var DELAY =  60 * 1000; //60,000 milliseconds = 1 Minutes
var currentTime = Date.now ? Date.now() : new Date().getTime();
var lastTime = GM_getValue(KEY_NEXT, 0);
var nextTime = currentTime + DELAY;
var url = document.URL;
GM_setValue(KEY_NEXT, nextTime);

var timeDiff = Math.abs(lastTime - currentTime);
setTimeout(function(){
    window.location.reload();
}, DELAY);

var TRIAGE_ON_KEY = 'TriageOnKey';
var triageOnMenuMsg = 'Turn On Triage Notifications';
var triageOffMenuMsg = 'Turn Off Triage Notifications';

function triageOn() {
    GM_unregisterMenuCommand(GM_registerMenuCommand(
        triageOnMenuMsg, triageOn, 'r'));
    GM_registerMenuCommand(triageOffMenuMsg, triageOff, 'r');
    if (! GM_getValue(TRIAGE_ON_KEY, 1)) {
        window.location.reload();
        GM_setValue(TRIAGE_ON_KEY, 1);
    }
}
function triageOff() {
    GM_unregisterMenuCommand(GM_registerMenuCommand(
        triageOffMenuMsg, triageOff, 'r'));
    GM_registerMenuCommand(triageOnMenuMsg, triageOn, 'r');
    if (GM_getValue(TRIAGE_ON_KEY, 1)) {
        window.location.reload();
        GM_setValue(TRIAGE_ON_KEY, 0);
    }
}
if (GM_getValue(TRIAGE_ON_KEY, 1)) {
    triageOn();
} else {
    triageOff();
}

var notificationTitle = (document.title.split(' - ')[1] + ' Review Queue').replace(' Stack Exchange', '.SE');

// a way to detect that the script is being executed because of an automatic script reload, not by the user.
if (timeDiff <= DELAY * 2) {
    var reviewCount = 0;
    var reviewItems = document.getElementsByClassName('dashboard-num');
    var reviewMsg = '';

    for (var i = 0; i < reviewItems.length; i++){
        if (reviewItems[i].parentNode.className != 'dashboard-count dashboard-faded'){
            reviewTitle = reviewItems[i].parentNode.parentNode.getElementsByClassName('dashboard-title')[0].outerText;

            //if (reviewTitle != 'Documentation: Proposed Changes' || GM_getValue(TRIAGE_ON_KEY, 0)) {
            if (reviewTitle != 'Documentation: Proposed Changes' && (GM_getValue(TRIAGE_ON_KEY, 0) || reviewTitle != 'Triage')) {
                reviewCount = parseInt((reviewItems[i].getAttribute("title")).replace(',', ''), 10);
                if (reviewCount !== 0) {
                    reviewMsg += reviewCount + ' in ' + reviewTitle + '\n';
                }
            }
            console.log(reviewItems[i]);
        }
    }
    console.log(reviewMsg);

    if (url.search(/stackoverflow/) != -1) {
        logo = 'https://cdn.sstatic.net/Sites/stackoverflow/company/img/logos/so/so-icon.png';
    } else if (url.search(/serverfault/) != -1) {
        logo = 'https://cdn.sstatic.net/Sites/stackoverflow/company/img/logos/sf/sf-icon.png';
    } else if (url.search(/superuser/) != -1) {
        logo = 'https://cdn.sstatic.net/Sites/stackoverflow/company/img/logos/su/su-icon.png';
    } else {
        logo = url.replace('/review', '/favicon.ico');
    }

    if (reviewMsg !== '') {
        var timestamp = new Date();
        var details = {
            body: reviewMsg + timestamp.toTimeString().substring(0,8),
            tag: notificationTitle,
            icon: logo,
        };
        make_notification = function() {
            var n = new Notification(notificationTitle, details);
            n.onclick = function(event) {
                window.focus();
            };
            n.onclose = function() {
                GM_setValue(KEY_NEXT, nextTime + 1);
            };
            var currentTime = Date.now ? Date.now() : new Date().getTime();
            if (Math.abs(currentTime - lastTime) < DELAY / 2) {
                if (GM_getValue(KEY_NEXT, 0) == nextTime) {
                    setTimeout(make_notification, 3500);
                }
            }
        };
        make_notification();
    }
}
