(function(w, d, $, undefined) {
  'use strict';

  var users = {};

  function constructor() {
    setEvents();
  }

  function get(url, fn) {
    return request('GET', url, undefined, fn);
  }

  function post(url, params, fn) {
    return request('POST', url, params, fn);
  }

  function request(method, url, params, fn) {
    $.ajax({
      url: url,
      data: JSON.stringify(params),
      contentType: 'application/json',
      method: method,
      success: function(res) {
        fn(res);
      }
    });
  }

  function setEvents() {
    $(document).on('click', '#prepare', () => {
      loading('show');
      post('/prepare', { curl: $('[name="prepare"]').val() }, function(res) {
        $('#wrapperPrepare').hide();
        loadUsers();
        // loading('hide');
      });
    });

    $(document).on('click', '#list li', e => {
      var idx = $(e.currentTarget).data('index');
      showDetails(users[idx]);
    });

    $(document).on('click', '#details .wrapper-buttons .button__text-like', e => {
      var entry = $('#details').data('entry');
      console.log(['like', entry]);
    });

    $(document).on('click', '#details .wrapper-buttons .button__text-dislike', e => {
      var entry = $('#details').data('entry');
      console.log(['dislike', entry]);
    });
  }

  function loading(type) {
    $('#loading')[type]();
  }

  function loadUsers() {
    get('/loadusers', function(data) {
      users = data;
      mountList();
      loading('hide');
    });
  }

  function mountList() {
    var html = '<ul>';
    users.forEach((entry, idx) => {
      html += '<li data-index="' + idx + '">';
      html += '<span>' + entry.user.name + '</span><br />';
      html += '<img src="' + entry.user.photos[0].url + '" />';
      html += '</li>';
    });
    html += '</ul>';
    $('#list')
      .html(html)
      .show();
  }

  function showDetails(entry) {
    var html = '<h1>' + entry.user.name + '</h1>';
    html += $('#tpl-buttons').html();
    html += '<ul>';
    entry.user.photos.forEach(photo => {
      html += '<li>';
      html += '<img src="' + photo.url + '" />';
      html += '</li>';
    });
    html += '</ul>';
    $('#details')
      .data('entry', entry)
      .html(html)
      .show();
  }

  constructor();
})(window, document, jQuery);
