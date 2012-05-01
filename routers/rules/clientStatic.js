var fs = require("fs");
var url = require("url");
var path = require("path");

var transferFile = function (request, response) {
    var uri = url.parse(request.url).pathname;
    var filepath = path.join(process.cwd(), uri);

    path.exists(filepath, function (exists) {
        if (!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
        } else {
            fs.readFile(filepath, "binary", function (error, data) {
                if (error) {
                    response.writeHead(500, {
                        "Content-Type": "text/plain"

                    });
                    response.write(error + "\n");
                } else {

                    response.writeHead(200, {
                        "Cache-Control": "no-cache"
                    });

                    response.write(data, "binary");
                }

                response.end();
            });
        }
    });
}

exports.rule = {
    type: 'get',
    rule: '/client/*',
    fn: function(req, res){

        transferFile( req, res );
    }
};