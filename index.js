'use strict';

const Hapi = require('hapi');
const Hoek = require('hoek');
const parseCurl = require('parse-curl');
var request = require('request');

const PORT = process.env.PORT || 6660;

const server = Hapi.server({
  port: PORT,
  host: '0.0.0.0',
});

const init = async () => {
  await server.register(require('vision'));
  await server.register(require('inert'));

  let fetchData = {
    header: {
      'X-Supported-Image-Formats': 'webp,jpeg',
      Origin: 'https://tinder.com',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36',
      Accept: 'application/json',
      Referer: 'https://tinder.com/',
      Connection: 'keep-alive',
      Platform: 'web',
      'App-Version': '1002220',
    },
  };

  server.views({
    engines: {
      html: require('handlebars'),
    },
    relativeTo: __dirname,
    path: './templates',
    layout: true,
    layoutPath: './templates/layout',
  });

  server.route({
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: 'assets',
      },
    },
  });

  server.route({
    method: 'POST',
    path: '/prepare',
    handler: (request, h) => {
      let parsed = parseCurl(request.payload.curl);
      fetchData = {
        header: {
          ...fetchData.header,
          // 'x-auth-token': parsed.header['x-auth-token']
        },
      };
      return { token: parsed.header['x-auth-token'] };
    },
  });

  server.route({
    method: 'POST',
    path: '/execute',
    handler: async (req, h) => {
      const data = await new Promise((resolve) => {
        request(
          {
            headers: {
              ...fetchData.header,
              'x-auth-token': req.payload.token,
              'Accept-Encoding': 'gzip, deflate, br',
            },
            uri:
              'https://api.gotinder.com/' +
              req.payload.type +
              '/' +
              req.payload.id +
              '?locale=pt-BR&s_number=' +
              req.payload.s_number,
            method: 'GET',
            gzip: true,
          },
          (error, response, body) => {
            resolve({
              resp: JSON.parse(body),
              url:
                'https://api.gotinder.com/' +
                req.payload.type +
                '/' +
                req.payload.id +
                '?locale=pt-BR&s_number=' +
                req.payload.s_number,
              headers: {
                ...fetchData.header,
                'Accept-Encoding': 'gzip, deflate, br',
              },
            });
          }
        );
      });
      return data;
      // fetch().then(console.log, console.error);
    },
  });

  const fetchUsers = (token) => {
    let data = [];
    const max = 20;
    let iterator = 0;
    function callback(error, response, body) {
      iterator++;
      if (!error && response.statusCode == 200) {
        data = data.concat(JSON.parse(body).data.results);
      } else {
        console.log([response, body]);
      }
      return iterator >= max;
    }

    return new Promise((resolve) => {
      for (let i = 0; i <= max; i++) {
        let a = request(
          {
            headers: {
              ...fetchData.header,
              'x-auth-token': token,
              'Accept-Encoding': 'gzip, deflate, br',
            },
            uri: 'https://api.gotinder.com/v2/recs/core?locale=pt-BR',
            method: 'GET',
            gzip: true,
          },
          (error, response, body) => {
            console.log(body);
            callback(error, response, body) && resolve(data);
          }
        );
      }
    });
  };

  server.route({
    method: 'GET',
    path: '/loadusers/{token}',
    handler: async (request, h) => {
      const data = await fetchUsers(request.params.token);
      console.log(data);
      return data.filter((obj, pos, arr) => {
        return arr.map((mapObj) => mapObj.user._id).indexOf(obj.user._id) === pos;
      });
    },
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.view('index');
    },
  });

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
