;(function () {
  vis(window.context)
  var sync = d3.dispatch("eventFired")
  var subscriptions = []
  var ROUND_TRANSFORM_DECIMALPLACES = 3
  var width = innerWidth,
      height = innerHeight;


  function vis(context, container) {
    var tree = d3.layout.tree()
               .size([width - 20, height - 20])
               .children(traverse)

    context.constructor  = {name: 'Context'}
    context.x = context.px = width / 2
    context.y = context.py = 0
    context.parent = context
    context.id = 1

    var root = context,
        nodes = tree(root)

    var diagonal = d3.svg.diagonal()

    var butt  = d3.select(container).append('button').datum({hide: false}).text('hide render tree').style('position', 'absolute')

    var svg = d3.select(container).append('svg')
              .attr("width", width)
              .attr("height", height)
              .style('background', 'white')

    butt.on('click' ,function (d) {
      var hide = d.hide = ! d.hide
      butt.text((hide ? 'show' : 'hide')+ ' render tree')
      svg.style('display', hide ? 'none': 'block')
    })

    var node = svg.selectAll(".node"),
        link = svg.selectAll(".link")

    update(delay)

    var desc = d3.select(document.body).append('p').attr('class', 'desc')
               .on('hover', formatDesc)
               .on('out', function () { desc.transition().style('opacity', 0) })

    function update(delay) {
      node = node.data(nodes = tree.nodes(root), function (d) { return d.id })
      link = link.data(tree.links(nodes), function (d) { return d.source.id  + ':' + d.target.id })

      var registry = node.data().reduce(function (a, b) {
                       a[b.id] = b
                       return a
                     }, {})
      registry[0] = context

      window.node = function (id) {
        console.log(id)
        return registry[id]
      }
      window.node.registry = registry

      node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr('fill', nodeFill)
      .attr("r", 0)
      .attr('stroke', 'white')
      //.attr('stroke-width', 4)
      .on('mouseover', function (d) {
        console.log(d)
        zoomCircle(this, 20)
        desc.on('hover').call(desc, d)
      })
      .on('mouseout', function () {
        zoomCircle(this, 10)
        desc.on('out')()
      })

      link.enter().insert("path", "*")
      .attr("class", "link")
      .attr('stroke-width', '.6')
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
          // var mmm = d3.select(this).attr('fill', 'steelblue')
          // cmp._object.on('mouseout', function (d) {
          //   mmm.attr('fill', nodeFill)
          // })
        })
      })
      t.each('end', function (d, i) {
        if (1+i == n.size()) update(function (d, i) { return 0 })
      })
    }
  }

  function nodeContents(node) {
    if (node._isRenderable) {
      return {
        transform: node._object._matrix,
        type: node._object.constructor.name
      }
    }

    if (node._isModifier) return extend(node._object._output, { type: node._object.constructor.name})

    return {
      type: node.constructor.name
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

  traverse.id = 2

  function nodeFill(d) {
    if (d._isRenderable) {
      if (d._object.constructor.name.match(/View/)) return 'orange'
      if (d._object.constructor.name.match(/Surface/)) return 'indianred'
    }
    if (d._isModifier) return 'darkgreen'
    if (d.type === 'Context') return 'grey'
  }

  function formatDesc(d) {
    var model = filterObject(nodeContents(d))
    this.interrupt().style('opacity', 1)

    var out = Object.keys(model).map(function (k) {
                return '<div class="' + isInherited(d, k)  +  '">' + label(k) + ': '  + model[k] + '</div>'
              })
              .join('')
    this.html(out)
  }

  function isInherited(d, key) {
    if (key == 'type') return ''
    return (d._isRenderable ? 'inherited' : '')
  }

  function label(k) {
    return '<span class="label">' + k  + '</span>'
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
    d.children = d.children || []
    if (d && d._object && d._object._node) return traverse(d._object._node)
    if (d._node) return traverse(d._node)
    var children = d._child ? (Array.isArray(d._child) ? d._child: [d._child]) : []
    if (d._isRenderable) d._object.on('mouseover', function () { sync.eventFired(d) })
    children.forEach(function (child) { child.px = d.x; child.py = d.y; child.id = (child.id || (traverse.id += 1) ) })
    if ((d._object || {}).pipe)  subscribe(d._object, d)
    for(var x in d) {
      // if (d[x] && d[x].constructor.name.match(/View/))
      //   console.log(d)
    }
    d.children = children
    return children//.map(Object.create)
  }

  var identities = {
    translate: '0,0,0', rotate: '0,0,0', scale: '1,1,1', skew: '0,0,0'
  }

  function  processTransform(obj) {
    var mat = obj.transform || '1000010000100001'.split('')
    delete obj.transform
    if (mat && mat.join('') == '1000010000100001') return
    var decompose = require('famous/core/transform').interpret(mat)
    for(var i in identities) {
      if (decompose[i].join(',') == identities[i]) { delete decompose[i]; continue }
      if (decompose[i].filter(function (d) { return ! (isNaN(d) || d == null) }).length < 3) delete decompose[i]
      else decompose[i] = decompose[i].map(function (val) { return Math.round(val * 100) / 100 }).join(', ')
    }
    extend(obj, decompose)
  }
  function trackEvents() {}
  function identity (d) { return d }
  function zoomCircle(node, val) {
    d3.transition().duration(750).call(function (transition) {
      transition.tween(function () {
        return function (i) {
          node.attr('r', 10 + (10 * i))
        }

      })
    })
  }

})()
