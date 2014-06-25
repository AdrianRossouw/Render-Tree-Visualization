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

the vis function takes 3 arguments
[required]the context or renderNode
[optional]a DOM container to be contained in 
[optional]some options...?



##Caveats
Currently breaks on minified builds of famous because constructor names get
squashed.
