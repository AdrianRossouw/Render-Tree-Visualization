;(function () {
  inject('http://d3js.org/d3.v3.min.js')

  if (window.context)
    inject('adnan-wahab.github.io/Render-Tree-Visualization/vis.js')
  else
    console.log('visualization requires context to be exposed globally as window.context')

  function inject(src) {
    var s = document.createElement('script')
    s.src = src
    document.head.appendChild(s)
  }
})