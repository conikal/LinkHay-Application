// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Config
var site_url = '';

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true,
    domCache: true //enable inline pages
});

var messagebar = myApp.messagebar('.messagebar', {
    maxHeight: 200
});   

var user = {
    username: window.localStorage.getItem('username'),
    email: window.localStorage.getItem('email'),
    password: window.localStorage.getItem('password'),
    avatar: window.localStorage.getItem('avatar'),
    color: window.localStorage.getItem('color'),
}

if (user.email) {
    $$('.avatar').html('<img src="' + user.avatar + '"/>');
    $$('.name').html('<span class="label medal ' + user.color + '"></span> ' + user.username);
} else {
    $$('.login-or-submit, .view-notification').html('<a href="#" class="link icon-only open-popup" data-popup=".popup-login"><i class="icon ks-icon ion-ios-locked-outline"></i></a>');
    $$('.menu-logout').html('<ul><li><a href="#" data-popup=".popup-login" class="item-link close-panel open-popup"><div class="item-content"><div class="item-media"><i class="ion-locked"></i></div><div class="item-inner"><div class="item-title">Đăng nhập</div></div></div></a></li></ul>');
}

$$('.login-btn').on('click', function(){
    var login = myApp.formToJSON('#login-form');
    if (!login) {
        return
    }
    // login connection
    $$.ajax({
        url: site_url + 'api/login.php',
        method: 'GET',
        data: {username: login.email, password: login.password},
        dataType: 'json',
        beforeSend: function() {
            myApp.showProgressbar('body');
        },
        success: function(data) {
            if (data.login_status == true) {
                window.localStorage.setItem('email', login.email);
                window.localStorage.setItem('password', login.password);
                window.localStorage.setItem('username', data.username);
                window.localStorage.setItem('avatar', data.avatar);
                window.localStorage.setItem('color', data.color);
                myApp.hideProgressbar();
                myApp.closeModal('.popup-login');
                $$('.login-error').html('');
                location.reload();
            } else {
                myApp.hideProgressbar();
                $$('.login-error').html('Tài khoản hoặc mật khẩu không đúng');
            }
        },
        error: function() {
            myApp.hideProgressbar();
            $$('.login-error').html('Tài khoản hoặc mật khẩu không đúng');
        }
    });
});

$$('.logout-btn').on('click', function(){
    window.localStorage.clear();
    $$(this).attr('data-popup', '.popup-login').removeClass('logout-btn').addClass('open-popup').html('<div class="item-content"><div class="item-media"><i class="ion-locked"></i></div><div class="item-inner"><div class="item-title">Đăng nhập</div></div></div>');
    location.reload();
});


// Pull to refresh
var ptrContent = $$('.home-tabs').find('.pull-to-refresh-content');
    // Add 'refresh' listener on it
    ptrContent.on('refresh', function (e) {
        // Emulate 2s loading
        setTimeout(function () {
            loadLinks('index', '1', '', '#hot-links', false, true);
            loadLinks('upcoming', '1', '', '#new-links', true, true);
            // When loading done, we need to "close" it
            myApp.pullToRefreshDone();
        }, 2000);
    });

var ptrCategory = $$('.category-tabs').find('.pull-to-refresh-content');

    // Add 'refresh' listener on it
    ptrCategory.on('refresh', function (e) {
        // Emulate 2s loading
        setTimeout(function () {
            var category = $$('.category-tabs').attr('data-id');
            loadLinks('index', '1', category, '#category-links', false, true);
            loadLinks('upcoming', '1', category, '#category-links', true, true);
            // When loading done, we need to "close" it
            myApp.pullToRefreshDone();
        }, 2000);
    });

$$(document).on('click', '.more', function(){
    $$(this).html('<div class="ks-preloaders"><span class="preloader"></span></div>');
    var page = $$(this).parent().attr('data-page');
    var classes = $$(this).parent().attr('data-classes');
    var type = $$(this).parent().attr('data-type');
    var category = $$(this).parent().attr('data-cat');
    loadLinks(type, page, category, classes, false, false);
});

$$('a.category-link').on('click', function(){
    var id = $$(this).attr('data-id');
    var category = $$(this).attr('data-title');
    $$('.category-tabs').attr('data-id', id);
    $$('#category-navbar').text(category);
    $$('#category-hot').parent().find('.more').html('');
    $$('#category-new').parent().find('.more').html('');
    loadLinks('index', '1', id, '#category-hot', false, false);
    loadLinks('upcoming', '1', id, '#category-new', true, false);
});


// Ajax links loading
loadLinks('index', '1', '', '#hot-links', false, false);
loadLinks('upcoming', '1', '', '#new-links', true, false);

function loadLinks(type, page, category, classes, login, refresh) {
    $$.ajax({
        url: site_url + 'api/',
        method: 'GET',
        data: {username: user.email, password: user.password, type: type, page: page, category: category, login: login},
        dataType: 'json',
        beforeSend: function() {
            if (parseInt(page) === 1 && refresh === false) {
                $$(classes).html('<div style="width: 100%; margin-top: 50%; text-align: center"><span class="preloader"></span></div>');
            }
        },
        success: function(data) {
            var html = '';
            $$.each(data.links, function (id, link) {
            var type = '';
            if (link.type === 'media') {
                type = '<i class="ion-ios-camera-outline"></i>';
            } else if (link.type === 'quicknote') {
                type = '<i class="ion-ios-list-outline"></i>';
            } else if (link.type === 'video') {
                type = '<i class="ion-ios-videocam-outline"></i>';
            } else {
                type = '<i class="ion-ios-world-outline"></i>';
            }
            if (link.type === 'media') {
                var typeClass = 'comments-link';
                var typePage  = '#comments';
            } else {
                var typeClass = 'read-link';
                var typePage  = '#reading';
            }
            html += '<div class="col-100 tablet-50"><div class="card ks-card-header-pic">' +
                            '<a href="' + typePage + '" class="' + typeClass + '" data-id="' + link.id + '" data-url="' + link.url + '" data-link="' + link.link + '" data-title="' + link.title + '"  data-subtitle="' + link.subtitle + '" data-total="' + parseInt(link.comments) + '" data-type="' + link.type + '" data-domain="' + link.domain_name + '" data-username="' + link.username + '" data-time="' + link.time + '" data-vote="' + link.vote + '" data-status="' + link.status + '" data-channel="' + link.channel_name + '" data-avatar="' + link.avatar + '" data-thumbnail="' + link.thumbnail + '"><div style="background-image:url(' + link.thumbnail + ')" valign="bottom" class="card-header color-white no-border">' +
                                '<div class="ks-link-shadow"></div>' +
                                '<span class="ks-link-domain">'+ type +'&nbsp;' + link.domain_name + '</span>' +
                                '<div class="ks-link-title">' + link.title + '</div>' + 
                            '</div></a>' +
                                '<div class="card-content"> ' +
                                    '<div class="card-content-inner"> ' +
                                        '<div class="ks-user-avatar"><img src="' + link.avatar + '" width="34" height="34"/></div>' +
                                        '<div class="ks-user-name">' + link.username + '</div>' +
                                        '<div class="ks-link-date">' + link.time + ' · ' + link.channel_name + '</div>';
                                        if(link.subtitle) { html += '<p>' + link.subtitle + '</p>'; }
                            html += '</div>' +
                            '</div>' +
                        '<div class="card-footer">';
                        if (link.status == 'voted') {
                            html += '<a href="#" class="link"><span class="color-red"><i class="ion-arrow-up-a"></i>&nbsp; ' + link.vote + ' hay</span></a>';
                        } else {
                            html += '<a href="#" class="link"><i class="ion-arrow-up-a"></i>&nbsp; ' + link.vote + ' hay</a>';
                        }
                        html += '<a href="#comments" class="link comments-link" data-id="' + link.id + '" data-url="' + link.url + '" data-link="' + link.link + '" data-title="' + link.title + '"  data-subtitle="' + link.subtitle + '" data-total="' + parseInt(link.comments) + '" data-type="' + link.type + '" data-domain="' + link.domain_name + '" data-username="' + link.username + '" data-time="' + link.time + '" data-vote="' + link.vote + '" data-status="' + link.status + '" data-channel="' + link.channel_name + '" data-avatar="' + link.avatar + '" data-thumbnail="' + link.thumbnail + '"><i class="ion-chatbubble"></i>&nbsp; ' + link.comments + '</a><a href="#" class="link"><i class="ion-speakerphone"></i>&nbsp; loan tin</a></div>' +
                    '</div></div>';
            });
            if (parseInt(page) != 1) {
                $$(classes).append(html);
                $$(classes).parent().attr({'data-page': parseInt(page) + 1, 'data-classes': classes, 'data-type': type, 'data-cat': category});
                $$(classes).parent().find('.more').html('<a href="#" class="button button-more">Xem thêm...</a>');
            } else {
                $$(classes).parent().attr({'data-page': '2', 'data-classes': classes, 'data-type': type, 'data-cat': category});
                $$(classes).parent().find('.more').html('<a href="#" class="button button-more">Xem thêm...</a>');
                $$(classes).html(html);
            }
        },
        error: function() {
        }
    });
}

$$(document).on('click', 'a.reply-button', function(){
    var id = $$(this).attr('data-id');
    var username = $$(this).attr('data-username');
    $$('#send-comment').attr('data-parent', id);
    $$('#comment-content').val('@' + username).foucs();
});
$$('.messagebar a.send-comment').on('touchstart mousedown', function () {
    isFocused = document.activeElement && document.activeElement === messagebar.textarea[0];
});
$$('.messagebar a.send-comment').on('click', function (e) {
    var link_id = $$(this).attr('data-id');
    var content = $$('#comment-content').val();
    var parent_id = $$(this).attr('data-parent');
    // Keep focused messagebar's textarea if it was in focus before
    if (isFocused) {
        e.preventDefault();
        messagebar.textarea[0].focus();
    }
    var messageText = messagebar.value();
    if (messageText.length === 0) {
        return;
    }
    addComment(link_id, content, parent_id, '#comments-list');

    content = content.replace(/\n\r?/g, '<br/>');
    var comment = '<li>' +
                    '<div class="item-content">' +
                        '<div class="item-inner"> ' +
                            '<div class="item-comment">' +
                                '<div class="header">' +
                                    '<div class="avatar"><img src="' + user.avatar + '" width="34" height="34"/></div>' +
                                    '<div class="name"><span class="label medal ' + user.color + '"></span> ' + user.username + '</div>' +
                                    '<div class="date"> ' + 'đang đăng...' + '</div>' +
                                    '<div class="vote"><span class="label">' + 0 + ' <i class="ion-arrow-up-a"></i></span></div>' +
                                '</div>' +
                                '<div class="content">' +
                                '<p>' + content + '</p>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</li>';
    $$('#comments-list').append(comment);
    // Clear messagebar
    messagebar.clear();
});


// Add a comment
function addComment(link_id, content, parent_id, classes) {
    $$.ajax({
        url: site_url + 'api/add_comment.php',
        method: 'GET',
        data: {username: user.email, password: user.password, content: content, link_id: link_id, parent_id: parent_id},
        dataType: 'json',
        beforeSend: function() {
        },
        success: function(data) {
            if (data.status === 'OK') {
                $$(classes).find('li:last-child .date').text('vừa xong');
            }
        },
        error: function(error) {
            console.log(error);
        },

    });
}


// Refresh comments
$$(document).on('click', '#refresh-comments', function(){
    var url = $$(this).attr('data-url');
    var total = $$(this).attr('data-total');
    var type = $$(this).attr('data-type');
    loadComments(url, type, total, '#comments-list', true);
    setTimeout(function(){ updateNotification() }, 3000);
});

// Ajax load comments
$$(document).on('click', '.comments-link', function(){
    var id = $$(this).attr('data-id');
    var url = $$(this).attr('data-url');
    var link = $$(this).attr('data-link');
    var title = $$(this).attr('data-title');
    var total = $$(this).attr('data-total');
    var type = $$(this).attr('data-type');
    var domain = $$(this).attr('data-domain');
    var type = $$(this).attr('data-type');
    var time = $$(this).attr('data-time');
    var username = $$(this).attr('data-username');
    var channel = $$(this).attr('data-channel');
    var vote = $$(this).attr('data-vote');
    var status = $$(this).attr('data-status');
    var avatar = $$(this).attr('data-avatar');
    var subtitle = $$(this).attr('data-subtitle');
    var thumbnail = $$(this).attr('data-thumbnail');
    var details = '<div class="card detail-header-pic">' +
                    '<a href="#reading" class="read-link" data-url="' + url + '" data-link="' + link + '" data-title="' + title + '" data-domain="' + domain + '">' +
                      '<div style="background-image:url(' + thumbnail + ')" valign="bottom" class="card-header color-white no-border">' +
                        '<div class="link-shadow"></div>' +
                        '<span class="link-domain"><i class="ion-ios-world-outline"></i>&nbsp;' + domain + '</span>' +
                        '<div class="link-title">' + title + '</div>' +
                      '</div>' +
                    '</a>' +
                    '<div class="card-content">' +
                      '<div class="card-content-inner">' +
                          '<div class="user-avatar"><img src="' + avatar + '" width="34" height="34"></div>' +
                          '<div class="user-name">' + username + '</div>' +
                          '<div class="link-date">' + time + ' · ' + channel + '</div>' +
                          '<div class="label link-vote ' + status + '"><i class="ion-chevron-up"></i><br/>' + vote + '</div>';
                          if (subtitle) { details += '<p>' + subtitle + '</p>'; }
            details += '</div>' +
                    '</div>' +
                    '<div class="card-footer" id="users-voted"><a href="#voter"><i class="ion-arrow-up-a"></i>&nbsp; ' + username + ' và ' + (parseInt(vote) - 1) + ' người đã bình chọn</a></div>' +
                  '</div>';
    $$('#details').html(details);
    $$('#refresh-comments').attr({'data-url': url, 'data-type': type, 'data-total': total});
    $$('#send-comment').attr('data-id', id);
    messagebar.clear();
    if (total === 'NaN') { total = 0 }
    loadComments(url, type, total, '#comments-list', false);
    setTimeout(function(){ updateNotification()}, 3000);
});


function loadComments(url, type, total, classes, refresh) {
    $$('.comments-total').text( total );

    $$.ajax({
        url: site_url + 'api/comments.php',
        method: 'GET',
        data: {username: user.email, password: user.password, url: url, type: type},
        dataType: 'json',
        beforeSend: function() {
            if (total != 0) {
                if (refresh === true) {
                    $$('#refresh-comments').html('<div class="ks-preloaders"><span class="preloader ks-preloader-big"></span></div>');
                } else {
                    $$(classes).html('<div class="ks-preloaders"><br/><p><span class="preloader ks-preloader-big"></span></p><p>Đang tải ' + total + ' bình luận</p></br/></div>');
                }
            } else {
                $$(classes).html('<div class="ks-preloaders"><br/><p><i class="ion-ios-chatboxes-outline" style="font-size: 42px;"></i></p><p>Không có bình luận.</p><br/></div>');
            }
        },
        success: function(data) {
            var html = '';
            if (data.comments) {
                $$.each(data.comments, function (id, comment) {
                    html += '<li id="' + comment.id + '">' +
                                '<div class="item-content">' +
                                    '<div class="item-inner"> ' +
                                        '<div class="item-comment">' +
                                            '<div class="header">' +
                                                '<div class="avatar"><img src="' + comment.avatar + '" width="34" height="34"/></div>' +
                                                '<div class="name"><span class="label medal ' + comment.color + '"></span> ' + comment.username + '</div>' +
                                                '<div class="date"> ' + comment.time + '</div>' +
                                                '<div class="vote"><span class="label">' + comment.vote + ' <i class="ion-arrow-up-a"></i></span></div>' +
                                            '</div>' +
                                            '<div class="content">' +
                                            '<p>' + comment.content + '</p>' +
                                            '<a href="#" class="reply-button" style="color: #8e8e93" data-username="' + comment.username + '" data-id="' + comment.id + '"><i class="ion-reply"></i> Trả lời</a>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</li>';
                });
            } else {
                html = '<div class="ks-preloaders"><br/><p><i class="ion-ios-chatboxes-outline" style="font-size: 42px;"></i></p><p>Không có bình luận.</p><br/></div>';
            }
            $$(classes).html(html);
            $$('.comments-total').text( ( data.number - data.top_comments) );
            $$('#refresh-comments').html('<div class="ks-preloaders"><i class="ion-ios-loop"></i></div>');
            $$('#refresh-comments').attr({'data-url': url, 'data-type': type, 'data-total': total});

            var voter_html = '';
            if (data.users_voted) {
                $$.each(data.users_voted, function (id, voter) {
                    voter_html += '<li>' +
                                '<div class="item-content">' +
                                    '<div class="item-media"><img src="' + voter.avatar + '" width="30" height="30"></div>' +
                                    '<div class="item-inner">' +
                                        '<div class="item-title">' + voter.username + '</div>' +
                                    '</div>' +
                                '</div>'
                             '</li>';
                });
                $$('#voter-list').html(voter_html);
                $$('#voter-total').html(data.vote);
            }

            if (type == 'media') {
                var details = '<div class="card detail-header-pic">' +
                                '<a href="#" data-url="' + data.url + '" data-link="' + data.link + '" data-title="' + data.title + '" data-domain="' + data.domain + '">' +
                                  '<div valign="bottom">' +
                                    '<img src="' + data.thumbnail + '" width="100%"/>' +
                                    '<div class="media-title">' + data.title + '</div>' +
                                  '</div>' +
                                '</a>' +
                                '<div class="card-content">' +
                                  '<div class="card-content-inner">' +
                                      '<div class="user-avatar"><img src="' + data.avatar + '" width="34" height="34"></div>' +
                                      '<div class="user-name">' + data.username + '</div>' +
                                      '<div class="link-date">' + data.timeago + ' · ' + data.category + '</div>' +
                                      '<div class="label link-vote ' + data.vote_status + '"><i class="ion-chevron-up"></i><br/>' + data.vote + '</div>';
                                      if (data.subtitle) { details += '<p>' + data.subtitle + '</p>'; }
                        details += '</div>' +
                                '</div>' +
                                '<div class="card-footer" id="users-voted"><a href="#voter"><i class="ion-arrow-up-a"></i>&nbsp; ' + data.username + ' và ' + (parseInt(data.vote) - 1) + ' người đã bình chọn</a></div>' +
                              '</div>';
            } else {
                var details = '<div class="card detail-header-pic">' +
                                '<a href="#reading" class="read-link" data-url="' + data.url + '" data-link="' + data.link + '" data-title="' + data.title + '" data-domain="' + data.domain + '">' +
                                  '<div style="background-image:url(' + data.thumbnail + ')" valign="bottom" class="card-header color-white no-border">' +
                                    '<div class="link-shadow"></div>' +
                                    '<span class="link-domain"><i class="ion-ios-world-outline"></i>&nbsp;' + data.domain + '</span>' +
                                    '<div class="link-title">' + data.title + '</div>' +
                                  '</div>' +
                                '</a>' +
                                '<div class="card-content">' +
                                  '<div class="card-content-inner">' +
                                      '<div class="user-avatar"><img src="' + data.avatar + '" width="34" height="34"></div>' +
                                      '<div class="user-name">' + data.username + '</div>' +
                                      '<div class="link-date">' + data.timeago + ' · ' + data.category + '</div>' +
                                      '<div class="label link-vote ' + data.vote_status + '"><i class="ion-chevron-up"></i><br/>' + data.vote + '</div>';
                                      if (data.subtitle) { details += '<p>' + data.subtitle + '</p>'; }
                        details += '</div>' +
                                '</div>' +
                                '<div class="card-footer" id="users-voted"><a href="#voter"><i class="ion-arrow-up-a"></i>&nbsp; ' + data.username + ' và ' + (parseInt(data.vote) - 1) + ' người đã bình chọn</a></div>' +
                              '</div>';
            }
            $$('#details').html(details);
            $$('#users-voted').html('<a href="#voter"><i class="ion-arrow-up-a"></i>&nbsp; ' + data.users_voted[0].username + ' và ' + (parseInt(data.vote) - 1) + ' người đã bình chọn</a>');
        },
        error: function(error) {
            console.log(error);
            $$(classes).html('<div class="ks-preloaders"><br/><p><i class="ion-ios-information-outline" style="font-size: 42px;"></i></p><p>Xin vui lòng thử lại.</p><br/></div>');
        },

    });
}

$$('.view-notification').on('click', function(){
    loadNotification('#notification');
});

$$(document).on('click', '.noti-link', function(){
    var id = $$(this).attr('data-id');
    var url = $$(this).attr('data-url');
    myApp.closeModal('.popup-notification');
    loadComments(url, 'link', 0, '#comments-list', false);
    setTimeout(function(){
        $$.get(site_url + 'api/checked.php', {username: user.email, password: user.password, id: id});
    }, 3000);
    setTimeout(function(){ updateNotification()}, 6000);
});

function loadNotification(classes) {
    $$.ajax({
        url: site_url + 'api/notification.php',
        method: 'GET',
        data: {username: user.email, password: user.password},
        dataType: 'json',
        timeout: 36000,
        beforeSend: function() {
            $$(classes).html('<div class="ks-preloaders"><br/><p><span class="preloader ks-preloader-big"></span></p><p>Đang tải không báo</p><br/></div>')
        },
        success: function(data) {
            var html = '';
            var icon = '';
            if (data.notifications) {
                $$.each(data.notifications, function(id, noti){
                    if (noti.icon) {
                        icon = '<img src="' + noti.icon + '" width="14"> ';
                    } else {
                        icon = '<i class="ion-ios-heart"></i> ';
                    }
                    html += '<li id="' + noti.id + '" class="' + noti.status + '">' +
                                '<a href="#comments" class="item-link item-content noti-link" data-id="' + noti.id + '" data-url="' + noti.url + '">' +
                                    '<div class="item-inner">' +
                                        '<div class="item-title-row">' +
                                            '<div class="item-title">' + icon + noti.username + '</div>' +
                                            '<div class="item-after">' + noti.timeago + '</div>' +
                                        '</div>' +
                                        '<div class="item-subtitle">' + noti.action + ' ' + noti.title + '</div>' +
                                        '<div class="item-text">' + noti.description + '</div>' +
                                    '</div>' +
                                '</a>' +
                            '</li>';
                });
                $$(classes).html(html);
            } else {
                $$(classes).html('<div class="ks-preloaders"><br/><p><i class="ion-log-out" style="font-size: 42px;"></i></p><p>Không tìm thấy thông báo</p><br/></div>');
            }
        },
        error: function(error) {
            $$(classes).html('<div class="ks-preloaders"><br/><p><i class="ion-log-out" style="font-size: 42px;"></i></p><p>Lỗi! Xin vui lòng thử lại.</p><br/></div>');
        },

    });
}

function updateNotification() {
    $$.ajax({
        url: site_url + 'api/update.php',
        method: 'GET',
        data: {username: user.email, password: user.password},
        dataType: 'json',
        timeout: 36000,
        beforeSend: function() {
        },
        success: function(data) {
            if (data.new_notification > 0) {
                $$('.update_notification').html('<span class="badge bg-red" style="top: 2px">' + data.new_notification + '</span>');
            } else {
                $$('.update_notification').html('');
            }
        },
        error: function(error) {
        },
    });
}

// Ajax reading link
$$(document).on('click', '.read-link', function(){
    var url = $$(this).attr('data-url');
    var link = $$(this).attr('data-link');
    var title = $$(this).attr('data-title');
    var domain = $$(this).attr('data-domain');
    $$('#external-url').attr('href', url);
    $$('#reading-title').text(title);
    $$('#reading-content').html('');
    readLink(link, '#reading-content', domain);
    setTimeout(function(){ updateNotification()}, 3000);
});

function readLink(url, classes, domain) {
    $$.ajax({
        url: 'readability/',
        method: 'GET',
        data: {url: url},
        dataType: 'json',
        timeout: 36000,
        beforeSend: function() {
            $$(classes).html('<div class="ks-preloaders"><br/><p><span class="preloader ks-preloader-big"></span></p><p>Đang tải nội dung từ ' + domain + '</p><br/></div>')
        },
        success: function(data) {
            if (data.status == 'success') {
                $$(classes).html('<h2>' + data.title + '</h2>' + data.content);
                $$('#external-url').attr('href', url);
            } else {
                $$(classes).html('<div class="ks-preloaders"><br/><p><i class="ion-log-out" style="font-size: 42px;"></i></p><p>Chuyển hướng đến ' + domain + '</p><br/></div>');
                window.open(url, '_blank');
            }
        },
        error: function(error) {
            $$(classes).html('<div class="ks-preloaders"><br/><p><i class="ion-log-out" style="font-size: 42px;"></i></p><p>Chuyển hướng đến ' + domain + '</p><br/></div>');
            window.open(url, '_blank');
        },

    });
}

// Submit link
$$('.submit').on('click', function(){
  var submitData = myApp.formToJSON('#submit-link');
  submitLink(submitData);
}); 

function submitLink(data) {
    $$.ajax({
        url: site_url + 'api/submit.php',
        method: 'GET',
        data: {username: user.email, password: user.password, url: data.link_url, title: data.link_title, cat: data.link_channel, desc: data.link_subtitle, thumb: data.link_thumb, embed: data.link_embed, sensitive: data.sensitive[0]},
        dataType: 'json',
        timeout: 36000,
        beforeSend: function() {
            myApp.showProgressbar('body');
        },
        success: function(result) {
            if (result.result == 'OK') {
                mainView.router.load({pageName: 'comments'});
                loadComments('http://linkhay.com' + result.link, 'link', 0, '#comments-list', false);
                $$('#link_url').val('');
                $$('#link_title').val('');
                $$('#link_subtitle').val('');
                $$('#link_thumb').val('');
                $$('#link_embed').val('');
                $$('#preview').html('');
                myApp.hideProgressbar();
            } else {
                if (result.link) {
                    mainView.router.load({pageName: 'comments'});
                    loadComments('http://linkhay.com' + result.link, 'link', 0, '#comments-list', false);
                }
                myApp.hideProgressbar();
            }
        },
        error: function(error) {
            myApp.hideProgressbar();
        },

    });
}

// Load Preview
$$("#link_url").keyup(function(e){
    var charCode =  e.keyCode || e.which || e.charCode;
    if(charCode == 13 || charCode == 32){
        getGist();
    }
});

function getGist(e){
     var gistDiv = $$("#preview");

     var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

    // www. sans http:// or https://
    var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    
    var urls = [], post = $$("#link_url").val().trim(); 
    
    var matches = post.match(urlPattern);
    if(matches)
        urls = urls.concat(matches); 
    
    matches = post.match(pseudoUrlPattern);
    if(matches)
        urls = urls.concat(matches); 
    
    var curUrl = "", gistData = {};
    if(urls.length < 1){//If no urls in post content
        return false;
    }else{
        for(temp in urls){
            var tempUrl = urls[temp].trim();
            if(isValidUrl(tempUrl)){
                curUrl = tempUrl;
                break;
            }
        }
        if(!curUrl){
            return false;
        } else {
            buildGistContent(curUrl, gistDiv);
        }
    }
}


function buildGistContent(url, classes){
    $$.ajax({
        url: 'parse/',
        method: 'GET',
        data: {url: url},
        dataType: 'json',
        beforeSend: function() {
            classes.html('<div class="ks-preloaders"><br/><p><span class="preloader ks-preloader-big"></span></p><p>Đang tải bản xem trước</p><br/></div>')
        },
        success: function(data) {
            if (data.isSuccess == true) {
                var site = data.data;
                var title, image, embed;
                if (site.site_image) {
                    if (site.site_image.og) {
                        image = site.site_image.og;
                    } else {
                        image = site.site_image.meta;
                    }
                } else if (data.images) {
                    image = data.images[1];
                }
                var preview = '<div class="card detail-header-pic">' +
                                '<a href="#reading" class="read-link" data-url="' + data.url + '" data-link="' + data.url + '" data-title="' +  (site.title.og || site.title.meta) + '" data-domain="' + extractDomain(data.url) + '">' +
                                  '<div style="background-image:url(' + image + ')" valign="bottom" class="card-header color-white no-border">' +
                                    '<div class="link-shadow"></div>' +
                                    '<span class="link-domain"><i class="ion-ios-world-outline"></i>&nbsp;' + extractDomain(data.url) + '</span>' +
                                    '<div class="link-title">' + (site.title.og || site.title.meta) + '</div>' +
                                  '</div>' +
                                '</a>' +
                              '</div>';
                
                $$('#link_title').val( (site.title.og || site.title.meta) );
                $$('#link_thumb').val( image );
                classes.html(preview);
            } else {
                classes.html('<div class="ks-preloaders"><br/><p><i class="ion-ios-information-outline" style="font-size: 42px;"></i></p>Không có bản xem trước<p></p><br/></div>');
            }
        },
        error: function(error) {
            console.log(error);
            classes.html('<div class="ks-preloaders"><br/><p><i class="ion-ios-information-outline" style="font-size: 42px;"></i></p>Không có bản xem trước<p></p><br/></div>');
        },

    });
}

function isValidUrl(url){
    return (/^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(url) || /(^|[^\/])(www\.[\S]+(\b|$))/gim.test(url));
}

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}
