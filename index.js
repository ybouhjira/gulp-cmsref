var es = require('event-stream');
var stream = require('stream');
var istextorbinary = require('istextorbinary');
var re = /(=|url\()(["'`]?){1}(?!\/\/)([a-z0-9_\/.-]+\.[a-z0-9]+)(?:[#?].+?)?\2/gim;

module.exports = function(map, options) {
    var doCMSReplace = function(file, callback) {
        var isStream = file.contents && typeof file.contents.on === 'function' && typeof file.contents.pipe === 'function';
        var isBuffer = file.contents instanceof Buffer;

        function doCMSReplace() {
            if (isStream) {
                console.log("doing stream", file.path);
                return callback(null, file);
            }

            if (isBuffer) {
                var content = String(file.contents), basename, replacement;

                while((match = re.exec(content)) !== null) {
                    basename = match[3].split('/').pop();

                    if(map && typeof map === "object" && basename in map) {
                        replacement = map[basename];
                    } else {
                        replacement = basename.split('.');
                        replacement.pop();
                        replacement = replacement.join('.').replace(/[^a-z0-9_]+/g, '_');
                    }

                    // Important: $ is a special char inside the 2. argument of 
                    // String.replace.
                    // To insert a normal $ sign "$$" needs to be used to escape 
                    // the second $.
                    // Additionally, because the result of this replacement will 
                    // be used again for another replacement it is neccessary to
                    // escape the $ sign twice.
                    replacement = match[0].replace(match[3], '$$$$CMS_REF(media:"' + replacement + '")$$$$');

                    content = content.replace(match[0], replacement);
                }

                file.contents = new Buffer(content);

                return callback(null, file);
            }

            callback(null, file);

        }

        istextorbinary.isText('', file.contents, function(err, result) {
            if (err) {
                return callback(err, file);
            }

            if (!result) {
                return callback(null, file);
            } else {
                doCMSReplace();
            }
        });
    };

    return es.map(doCMSReplace);
};
