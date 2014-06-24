javascript:(function () {
    require && require.config({
        paths: {
            d3: 'http://d3js.org/d3.v3.min.js'
        }
    })
    var s = document.createElement('script');
    s.src = 'https://adnan-wahab.github.io/Render-Tree-Visualization/vis.js'
    document.head.appendChild(s);
})()
