var express = require('express');
var pg = require('pg');
var router = express.Router();
var crypto = require('crypto');

router.post('/', function(req, res) {
  console.log('logout');

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      done();
      console.error(err);
      return res.status(500).json({
        success: false, data: err
      });

    } else {

      client.query('DELETE FROM tokens WHERE "user" = $1 AND content = $2', [res.locals.user.id, req.body.token], function(err, result) {
        done();
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            data: err
          });
        } else if (result.rowCount == 1) {
          console.log('logout success');
          return res.json({
            success: true
          });
        } else {
          return res.status(400).json({
            success: false
          });
        }
      });
    }
  });
})

module.exports = router;
