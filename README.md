## Render Tree Visualization
-----------------------
This here is a visualization module  for the Famo.us render tree and the event pipeline.
To try it out, goto the following page and save the link as a bookmarklet by dragging
it to your bookmark bar. [Install Render Tree Bookmarklet](http://adnan-wahab.github.io/Render-Tree-Visualization)


## Usage
``` js
var Engine = require('famous/core/Engine')
var Modifier = require('famous/core/Modifier')
var vis = require('vis')

var twigs = [ctx.add(new Modifier)]

var ctx = Engine.createContext()
vis(ctx)
(function repeat() {
  twigs[Math.random() * list.length | 0]
  .push(ctx.add(new Modifier))

  setTimeout(repeat, Math.random() * 1000)
})()
```

the vis function takes 2 arguments
[required]the context or renderNode
[optional]an object enumerating a list of choices including
log: console.log a renderNode on hover
container: where the tree should be appended to
width: how wide the tree should be. defaults to the width of the container or window.width
height: how tall the tree should be. defaults to the width of the container or window.height

##Caveats
Currently breaks on minified builds of famous because constructor names get
squashed.
