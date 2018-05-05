(function(w, d, $, undefined) {
  'use strict';

  var users = {};

  function constructor() {
    setEvents();
    setShortcuts();
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

    $(document).on('click', '#userReload', () => {
      $('#details')
        .html('')
        .data('entry', null);
      loading('show');
      loadUsers();
    });

    $(document).on('click', '#list li', e => {
      var idx = $(e.currentTarget).data('index');
      showDetails(users[idx]);
    });

    $(document).on('click', '#details .wrapper-buttons .button__text-like', e => {
      currentLike();
    });

    $(document).on('click', '#details .wrapper-buttons .button__text-dislike', e => {
      currentPass();
    });
  }

  function currentPass() {
    var entry = $('#details').data('entry');
    // console.log(['dislike', entry]);
    post('/execute', { type: 'pass', id: entry.user._id, s_number: entry.s_number }, function(res) {
      if (res.resp.status == 200) {
        var idx = users.indexOf(entry);
        if (idx >= 0) {
          users.splice(idx, 1);
          mountList();
          if (users.length == 0) {
            loading('show');
            loadUsers();
          } else {
            if (idx >= users.length) idx--;
            showDetails(users[idx]);
          }
        }
      }
      // loadUsers();
      // loading('hide');
    });
  }

  function currentLike() {
    var entry = $('#details').data('entry');
    // console.log(['dislike', entry]);
    post('/execute', { type: 'like', id: entry.user._id, s_number: entry.s_number }, function(res) {
      if (!res.resp.status) {
        if (res.resp.match) alert('você deu match com ' + entry.user.name);

        var idx = users.indexOf(entry);
        if (idx >= 0) {
          users.splice(idx, 1);
          mountList();
          if (users.length == 0) {
            loading('show');
            loadUsers();
          } else {
            if (idx >= users.length) idx--;
            showDetails(users[idx]);
          }
        }
      }
      // loadUsers();
      // loading('hide');
    });
  }

  function setShortcuts() {
    Mousetrap.bind('up', function() {
      var entry = $('#details').data('entry');
      var idx = users.indexOf(entry);
      if (idx != 0) {
        idx--;
        showDetails(users[idx]);
      }
    });
    Mousetrap.bind('down', function() {
      var entry = $('#details').data('entry');
      var idx = users.indexOf(entry);
      if (idx < users.length - 1) {
        idx++;
        showDetails(users[idx]);
      }
    });
    Mousetrap.bind('left', function() {
      var entry = $('#details').data('entry');
      if (entry) {
        currentPass();
      }
    });
    Mousetrap.bind('right', function() {
      var entry = $('#details').data('entry');
      if (entry) {
        currentLike();
      }
    });
    Mousetrap.bind('r', function() {
      $('#details')
        .html('')
        .data('entry', null);
      loading('show');
      loadUsers();
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
    var html = '<button id="userReload">recarregar usuários</button>';
    html += '<ul>';
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
