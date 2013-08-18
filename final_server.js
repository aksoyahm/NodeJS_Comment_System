var sys = require ('sys'),
http = require('http');
fs = require('fs');
path = require('path');
url = require('url');

PORT = 30920;

STATIC_PREFIX = '/static/';

MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.txt': 'text/plain'
};

var myThreads = new Array(new Array());
var myParents = new Array(new Array());
var myChildren = new Array(new Array());
var oldcommentid;
var sum = 0;

function serveFile(filePath, response) {
  path.exists(filePath, function(exists) {
    if (!exists) {
      response.writeHead(404);
      response.end();
      return;
    }

    fs.readFile(filePath, function(error, content) {
      if (error) {
        response.writeHead(500);
        response.end();
        return;
      }

      var extension = path.extname(filePath);
      var mimeType = MIME_TYPES[extension];
      response.writeHead(200,
                         {'Content-Type': mimeType ? mimeType : 'text/html'});
      response.end(content, 'uft-8');
    });
  });
}

//returns the thread id of the comment id
function getParent(id) {
    var commentid = id;
    if (commentid == 0) {
        return oldcommentid;
    }
    else {
        for (var i = 0; i < myThreads[0].length; i++) {
            var obj = myThreads[0][i];
            obj = JSON.parse(obj);
            if (obj.id == commentid) {
                oldcommentid = commentid;
                commentid = obj.parentID;
                return getParent(commentid);
            }
        }
    }
}

//sort the myThreads array
function sort() {

    //add parents and children to seperate arrays
    for (var i = 0; i < myThreads[0].length; i++) {
        var obj = JSON.parse(myThreads[0][i]); 
        if (parseInt(obj.parentID) == 0) {
            myParents[0].push(myThreads[0][i]);
        }
        else {
            myChildren[0].push(myThreads[0][i]);
        }
    }
    
    //sort parents 
    for (var i = 0; i < myParents[0].length - 1; i++) {
        var obj = JSON.parse(myParents[0][i]);
        var obj2 = JSON.parse(myParents[0][i+1]);
                                                  
        if (parseInt(obj.vote) > parseInt(obj2.vote)) {
            var temp = myParents[0][i];;
            myParents[0][i] = myParents[0][i+1];
            myParents[0][i+1] = temp;
        }                       
    }
    
    while (myThreads[0].length > 0) {
        myThreads[0].pop();
    }
                
    //add the sorted parents to myThreads
    for (var i = 0; i < myParents[0].length; i++) {
        myThreads[0].push(myParents[0][i]);
    }
    //add the children to myThreads
    for (var i = 0; i < myChildren[0].length; i++) {
        myThreads[0].push(myChildren[0][i]);
    }
    
    while (myParents[0].length > 0) {
        myParents[0].pop();
    }
    
    while (myChildren[0].length > 0) {
        myChildren[0].pop();
    }
    
}

http.createServer(function(request, response) {
  console.log(request.url);
  if (request.url == '/') {
    //serve index.html from the current directory
    serveFile('./index.html', response);

  } else if (request.url.indexOf(STATIC_PREFIX) == 0) {
    //serve the file for the user from the current directory
    serveFile('./' + request.url.substring(STATIC_PREFIX.length), response);

  } else if (request.url == '/post' || request.url == '/get') {
    //post or get data

        if(request.method=='POST' && request.url == '/post') {
        	var data = '';

	

            request.addListener('data', function(chunk) { data += chunk; });

            request.addListener('end', function() {
                sum = sum + 1;
		//console.log(data);
                myThreads[0].push(JSON.parse(data));
                
                for (var i = 0; i < myThreads[0].length; i++) {
                    var obj = myThreads[0][i];
                    obj = JSON.parse(obj);
                    if (parseInt(obj.id) == -1) {
                          myThreads[0][i] = '{"parentID":"' + obj.parentID + '", "id":"' + sum + '", "value":"' + obj.value + '", "vote":"' + obj.vote + '", "date":"' + obj.date + '"}';
                    }
                }
                
                sort();
                //console.log(myThreads[0]);
                response.writeHead(200, {'content-type': 'text/plain' });
                response.end()
            });

        }
        else if(request.method=='GET' && request.url == '/get') {

            response.writeHead(200, {'content-type': 'text/json' });
            response.write( JSON.stringify(myThreads[0]) );
            response.end('\n');

        }

  } else if (request.url == '/inc') {
        //increases vote count for the comment
        if (request.method == 'POST') {
            var data = '';
            request.addListener('data', function(chunk) { data += chunk; });
    
            request.addListener('end', function() {
                var post = JSON.parse(data);

		console.log(data);

                for (var i = 0; i < myThreads[0].length; i++) {
                    var obj = myThreads[0][i];
                    obj = JSON.parse(obj);
                    if (obj.id == post.id) {
                        obj.vote = parseInt(obj.vote) + 1;
                        myThreads[0][i] = '{"parentID":"' + obj.parentID + '", "id":"' + obj.id + '", "value":"' + obj.value + '", "vote":"' + obj.vote + '", "date":"' + obj.date + '"}';
                        
                        //increase vote count for the thread
                        var parent = getParent(parseInt(obj.id));
                        for (var j = 0; j < myThreads[0].length; j++) {
                            var obj2 = myThreads[0][j];
                            obj2 = JSON.parse(obj2);

                            if (obj2.id == parent) {
                                obj2.vote = parseInt(obj2.vote) + 1;
                                myThreads[0][j] = '{"parentID":"' + obj2.parentID + '", "id":"' + obj2.id + '", "value":"' + obj2.value + '", "vote":"' + obj2.vote + '", "date":"' + obj2.date + '"}'; 
                            }
                        }
                            
                    }
                }
                
               sort();                
                //console.log(myThreads[0]);
                response.writeHead(200, {'content-type': 'text/plain' });
                response.end()
            });
        }
  } else {
    // Send 404!
    response.writeHead(404);
    response.end('Resource not found.');
  }
}).listen(PORT);

console.log('Server running at http://127.0.0.1:' + PORT + '/');
