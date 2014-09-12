asparagus
=========

*Template compiling build tool for NodeJS*

Plays nice with Gulp or runs from the command line

### Install globally

```
$ npm install asparagus -g
```

adds a binary to the path so you can compile from the command line

```
$ asparagus '/path/to/source/folder'
```


### Explained

The following 2 examples will compile all and only, the files in the folder named 'includes' within the path; `__dirname + 'views/source'`.

The compiled functions will be assigned to a hash called 'partials' and attached to the `window` object.

Each compiled template function within `window.partials` will be identifiable by an id created from its original filename and formatted as per the format option, which in this case is 'camelcase'

*So this*;
```
views/
    dev/
        includes/
            my-tmpl.jade
    en/
        includes/
            my-tmpl.jade
```

*Outputs*;
```
public/
    templates/
        dev/
            includes/
                my-tmpl.js
        en/
            includes/
                my-tmpl.js
```

*And when one is loaded*
```
<script src='templates/en/includes/my-tmpl.js'></script>
```

*Gives you*
```
window.partials = {
    myTmpl: function () { ..... }
};
```
Any absolute include statements within any of the original templates will be appended to the basedir option, __dirname + '/views/dev'.

#### JavaScript
```
var asparagus = require('aspargus');

// A source parameter is required as the first argument to asparagus

asparagus(__dirname + '/views', {
    dest: __dirname + '/public/templates',
    format: 'camelcase',
    namespace: 'partials(.views[1])',
    basedir: __dirname + '/views/dev',
    exclusive: 'includes'
});

```

#### Command line

```
$ asparagus '/views' --dest '/public/templates' --format 'camelcase' --namespace 'partials' --basedir '/views/dev' --exclusive 'includes'

```

### Options
```
[dest] {String}
    - The final intended destination of the compiled templates(s), defaults to the value of the source parameter.

[format] {String}
    - The format of each compiled template function name in the namespace, defaults to 'underscore' delimited function names.

[namespace] {String}
    - The namespace object on the `window` object that will store references to the compiled template functions, defaults to 'templates'.

[basedir] {String}
    - allows for absolute include paths, defaults to the value of the source parameter.

[exclusive] {String}
    - When set to an existing directory name in the source path, compiles files only from and to that directory name within source and dest paths.

```
