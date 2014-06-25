require.config({
    paths: {
        d3: "http://d3js.org/d3.v3.min"
    }
});
define(['d3'], function (d3) {
    var ROUND_TRANSFORM_DECIMALPLACES = 3
    var Transform = require('famous/core/Transform')
    
    return function RenderTreeVisualizer(context, options) {
        var sync = d3.dispatch("eventFired")
        var subscriptions = []
        var registry = []

        options = extend({
            log: true,
            container: document.body
        }, options || {})

        context = context || window.context || window.ctx

        var width = (options.width || options.container.offsetWidth || innerWidth) * .5
        var height = (options.width || options.container.offsetHeight || innerHeight) - 100;

        var tree = d3.layout.tree()
                .size([width - 20, height - 100])
                .children(traverse)

        context.constructor  = {name: 'Context'}
        context.x = context.px = width / 2
        context.y = context.py = 0
        context.parent = context
        context._id = 0

        var root = context,
            nodes = tree(root)

        var diagonal = d3.svg.diagonal()

        var svg = d3.select(options.container).append('svg')
                .attr("height", height)
                .style('background', 'rgba(255, 255, 255, .5)')
                .style('position', 'absolute')
                .style('padding-top', '10px')
                .style('z-index', 123123)

        var node = svg.selectAll(".node"),
            link = svg.selectAll(".link")

        update(delay)

        var desc = d3.select(document.body).append('p').attr('class', 'desc')
                .style({
                    position: 'absolute',
                    top: '0px',
                    left: svg.node().offsetLeft,
                    color: '#333',
                    padding: '5px',
                    'font-family': 'Helvetica'
                })
                .on('hover', formatDesc)
                .on('out', function () { desc.transition().style('opacity', 0) })

        function update(delay) {
            node = node.data(nodes = tree.nodes(root), function (d) { return d._id })
            link = link.data(tree.links(nodes), function (d) { return d.source._id  + ':' + d.target._id })

            node.enter().append("circle")
                .attr("class", "node")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr('fill', nodeFill)
                .attr("r", 0)
                .attr('stroke', 'white')
                .on('mouseover', function (d) {
                    d3.select(this).interrupt().attr('r', 20)
                    if (options.log) console.log(d)
                    desc.on('hover').call(desc, d)
                })
                .on('mouseout', function () {
                    d3.select(this).interrupt().transition().attr('r', 10)
                    desc.on('out')()
                })

            link.enter().insert("path", "*")
                .attr("class", "link")
                .attr('stroke-width', '1')
                .attr('fill', 'none')
                .attr('stroke', '#999')
                .attr("d", diagonal)
                .attr('stroke-dasharray', function () { return '0,' + this.getTotalLength() })

            svg.selectAll(".link")
                .transition()
                .delay(delay)
                .duration(1000)
                .attr("d", diagonal)
                .attr('stroke-dasharray', function () {
                    var l = this.getTotalLength()
                    return l + "," + l
                })

            var n = svg.selectAll(".node")
            var t = n.transition()
                    .delay(delay)
                    .duration(1000)
                    .attr("cx", function(d) { return d.px = d.x })
                    .attr("cy", function(d) { return d.py = d.y })
                    .attr('r', 10)

            sync.on('eventFired', function (cmp) {
                n.each(function (d) {
                    if (d !== cmp) return

                    d3.select('svg').insert('circle', '*')
                        .attr('r', 10)
                        .attr('cx', d.px)
                        .attr('cy', d.py)
                        .attr('fill', 'steelblue')
                        .attr('opacity', 1)
                        .transition().duration(1000)
                        .attr('r', 35)
                        .attr('opacity', 0)
                        .remove()
                })
            })
            t.each('end', function (d, i) {
                if (i == n.size()-1) update(function (d, i) { return 0 })
            })
        }

        function nodeContents(node) {
            var surface = (node._isRenderable && node._object) || (node.render && 'number'== typeof node.render()  && node)
            if (surface) {
                return {
                    transform: surface._matrix,
                    type: surface.constructor.name,
                    content: surface.content, 
                    size: surface._size
                    //properties: surface.properties, 
                }
            }

            if (node._isModifier) {
                return extend({ type: node._object.constructor.name },
                              (node._object._output || node._object._modifier._output)
                             )
            }

            return { type: node.constructor.name
            }
        }

        function extend (a, b) {
            Object.keys(b).forEach(function (k) { a[k] = b[k] })
            return a
        }

        function filterObject(obj){
            if (! obj) return {}
            for(var key in obj) if (null == obj[key]) delete obj[key]
            processTransform(obj)
            if (obj.opacity === 1) delete obj.opacity
            delete obj.target
            return obj
        }

        function nodeFill(d) {
            var obj = d._object || {}
            if (obj.constructor.name.match(/Layout/i)) return '#7851A9'
            if (d.constructor.name.match(/Sequence/)) return 'pink'
            if (d.classList) return 'indianred'
            if (obj.constructor.name.match(/view/i)) return 'orange'
            if (obj.constructor.name.match(/Surface/i)) return 'indianred'
            if (d._isModifier || obj._modifier) return 'steelblue'
            if (d.constructor.name === 'Context') return 'darkgreen'
        }

        function formatDesc(d) {
            var model = filterObject(nodeContents(d))
            this.interrupt().style('opacity', 1)

            var out = Object.keys(model).map(function (k) {
                try { var val = JSON.stringify(model[k], null, 2) }
                catch (e){ var val = '' }
                return '<div class="' + isInherited(d, k)  +  '">' + label(k) + ': '  + model[k]  + '</div>'
            }).join('')
            this.html(out)
        }

        function isInherited(d, key) {
            if (key == 'type') return ''
            return (d._isRenderable ? 'inherited' : '')
        }

        function label(k) {
            return '<span class="label">' + upcase(k)  + '</span>'
        }

        function upcase(str) {
            str = str.split('')
            str[0] = str[0].toUpperCase()
            return str.join('')
        }

        function delay (d) { return (d.depth == null ? 1 + d.source.depth : d.depth) * 500 }

        function subscribe(emitter, renderNode) {
            if (subscriptions.indexOf(emitter) == -1) subscriptions.push(emitter)
            else return
            emitter.pipe(function (name, e){
                sync.eventFired(renderNode)
            })
        }

        function traverse(d) {
            d._id = registry.push(d)

            //TODO handle viewSEQ
            if (d._) return d._.array//.map(Object.create)

            var children = (d._node && d._node._child) ? d._node._child : d._child
            var obj = d._object || {}
            if (obj._nodes) return obj._nodes

            if (obj.sequence) return obj.sequence._.array//.map(Object.create)
            if (obj._items) return obj._items._.array//.map(Object.create)

            if (! children && obj && obj._node) children = obj._node._child
            
            if (obj.context) { children = obj.context } 

            if (obj._scroller) children = obj._scroller._node
            
            children = children ? (children.map ? children : [children]) : []

            //handle views && layouts
            if(! children.length && obj) {
                for(var k in obj)
                    if ((obj[k] || {}).add) children.push(obj[k])
            }
            
            return children
        }

        var identities = { 
            translate: '0,0,0', rotate: '0,0,0', scale: '1,1,1', skew: '0,0,0'
        }

        function  processTransform(obj) {
            var mat = obj.transform || obj._matrix || '1000010000100001'.split('')
            delete obj.transform
            if (mat && mat.join('') == '1000010000100001') return
            var decompose = Transform.interpret(mat)
            for(var i in identities) {
                if (decompose[i].join(',') == identities[i]) { delete decompose[i]; continue }
                if (decompose[i].filter(function (d) { return ! (isNaN(d) || d == null) }).length < 3) delete decompose[i]
                else decompose[i] = decompose[i].map(function (val) { return Math.round(val * 100) / 100 }).join(',')
            }
            extend(obj,decompose) 
        }
        function trackEvents() {}
        function identity (d) { return d }
    }
})
