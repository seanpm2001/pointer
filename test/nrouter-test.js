'use strict';


var Assert = require('assert');
var Common = require('../lib/nrouter/common');
var NRouter = require('..');


var nrouter = new NRouter({
  '/articles/{id}(-{slug}(-{page}))(.{format})': {
    name: 'article',
    params: {
      page: /\d+?/,
      format: 'html'
    }
  },

  '/articles/{id}(-{page})(.{format})': {
    name: 'article',
    params: {
      page: /\d+?/,
      format: 'html'
    }
  },

  '/posts/{year}(-{month}(-{day}))-{slug}.html': {
    name: 'post',
    params: {
      year: /\d+/,
      month: /\d+/,
      day: /\d+/
    }
  },

  '/{year}-{month}-{day}.html': {
    name: 'post',
    prefix: '/blog'
  }
});


function test_generated_links(definitions) {
  var tests = {};

  Common.each(definitions, function (data, url) {
    tests['[' + data.name + '] ' + url + ' << ' + JSON.stringify(data.params)] = function () {
      var result = nrouter.linkTo(data.name, data.params);

      if (!url || 'null' === url) {
        Assert.isNull(result);
      } else {
        Assert.isNotNull(result);
        Assert.equal(result, url);
      }
    };
  });

  return tests;
}

require('vows').describe('NRouter').addBatch({
  'Building links': {
    'based on `name` to find route to build URL for': test_generated_links({
      '/posts/2012-02-23-foobar.html': {
        name: 'post',
        params: {year: 2012, month: '02', day: 23, slug: 'foobar'}
      },
      null: {
        name: 'post',
        params: {id: 42, slug: 'foobar', page: 1, format: 'html'}
      }
    }),

    'returns longest URL when multiple URLs share same `name`': test_generated_links({
      '/articles/42-foobar-1.html': {
        name: 'article',
        params: {id: 42, slug: 'foobar', page: 1, format: 'html'}
      },
      '/articles/42-123456.html': {
        name: 'article',
        params: {id: 42, page: 123456, format: 'html'}
      }
    }),

    'requires all, even optional, params': test_generated_links({
      null: {
        name: 'article',
        params: {id: 42, format: 'html'}
      }
    }),

    'respests param matchers': test_generated_links({
      null: {
        name: 'article',
        params: {id: 42, page: 'abc', format: 'html'}
      }
    }),

    'preserves prefix': test_generated_links({
      '/blog/2012-02-23.html': {
        name: 'post',
        params: {year: 2012, month: '02', day: 23}
      }
    })
  }
}).export(module);
