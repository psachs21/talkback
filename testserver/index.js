var express = require('express');
var app = express();

let counter = 1;
let counter2 = 2000;

app.get('/action1', function (req, res) {
  res.send({
      message: `Hello World! (${counter++})`
  });
});

app.get('/action2', function (req, res) {
    res.send({
        counter: counter2++
    });
  });

app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
})