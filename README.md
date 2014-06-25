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
var list = [ctx.add(new Modifier)]

var ctx = Engine.createContext()
(function repeat() {
  list[Math.random() * list.length | 0]
  .push(ctx.add(new Modifier))

  setTimeout(repeat, Math.random() * 1000)
})()
```
