## Render Tree Visualization
-----------------------
This here is a visualization module  for the Famo.us render tree and the event pipeline.
To try it out, goto the following page and save the link as a bookmarklet by dragging
it to your bookmark bar. [Install Render Tree Bookmarklet](http://adnan-wahab.github.io/Render-Tree-Visualization)


## Usage
``` js
require(['famous/core/Engine', 'famous/core/Modifier', 'famous/core/Surface', 'famous/core/Transform', 'famous/core/View', '../vis.js'],
        function (Engine, Modifier, Surface, Transform, View, vis) {

    var ctx = Engine.createContext()
    var nodes = [ctx.add(new Modifier)]

    vis(ctx)
    ;(function repeat() {
        var mod = nodes[Math.random() * nodes.length | 0]
                  .add(new Modifier({origin: [1,2].map(Math.random), opacity: .8}))
                  
        mod.add(new Surface({
            properties:  { background: randomColor() },
            size: [Math.random() * 200, Math.random() * 200]
        }))

    nodes.push(mod)

    setTimeout(repeat, Math.random() * 2000)
    
    function randomColor() { return 'hsl(' + Math.random() * 360  + ',100%, 50%)' }
    })()
})
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
