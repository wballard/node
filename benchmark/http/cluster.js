'use strict';
var common = require('../common.js');
var PORT = common.PORT;

var cluster = require('cluster');
if (cluster.isMaster) {
  var bench = common.createBenchmark(main, {
    // unicode confuses ab on os x.
    type: ['bytes', 'buffer'],
    length: [4, 1024, 102400],
    c: [50, 500]
  });
} else {
  require('./_http_simple.js');
}

function main(conf) {
  process.env.PORT = PORT;
  var workers = 0;
  var w1 = cluster.fork();
  var w2 = cluster.fork();

  cluster.on('listening', function() {
    workers++;
    if (workers < 2)
      return;

    setTimeout(function() {
      var path = '/' + conf.type + '/' + conf.length;

      bench.http({
        path: path,
        connections: conf.c
      }, function() {
        w1.destroy();
        w2.destroy();
      });
    }, 100);
  });
}
