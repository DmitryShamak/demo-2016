var express = require("express");
var app = express();
var deploy = false;
var port = process.env.PORT || deploy ? 80 : 3003;

app.use('/', express.static(__dirname));
app.use('/bower_components', express.static(__dirname + "/bower_components"));
app.use('/build', express.static(__dirname + "/build"));

app.all('/*', function(req, res) {
    res.sendfile('./index.html');
});

app.listen(port, function() {
    console.info("server running on %d port", port);
});

