var d3 = require("d3"),
    http = require("http"),
    fs = require("fs"),
    path = require("path"),
    jsdom = require("jsdom").jsdom;
    
var window = jsdom().parentWindow;
var dd = window.document.createElement("div");

var server = http.createServer(function (req, res) {
    
    if (req.url == "/" || req.url == "/index.html") {
        
            var width = 540,
                height = 540,
                samples = d3.range(21).map(d3.random.normal(100, 50)),
                x = d3.scale.linear().domain([0, samples.length - 1]).range([0, width]),
                y = d3.scale.linear().domain([d3.min(samples), d3.max(samples)]).range([height, 0]),
                xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(10);
                yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
            console.log("Sample Data:", samples);
                
            var yMax = d3.max(samples, function(d) { return +d; }); console.log("yMax:", yMax); 
            var xMax = samples.length - 1; console.log("xMax:", xMax);
                
            var line = d3.svg.line()
                .interpolate("basis")
                .x(function(d, i) { if (x(i) < 1) { return 1; } return x(i); })
                .y(y);

            var svg = d3.select(dd).append("svg")
                .attr("id", "main")
                .attr("width", 600)
                .attr("height", 600)
                .append("g")
                .attr({
                    "width": 539,
                    "height": 539
                })
                .attr("transform", "translate(51, 11)");
                
            svg.append("line")
                .attr({
                    "x1": width,
                    "y1": 0,
                    "x2": width,
                    "y2": height
                })
                .style({
                    "stroke": "#333",
                    "stroke-width": "1.0",
                    "shape-rendering": "crispEdges",
                    "fill-opacity": "1.0"
                });
            
            svg.append("line")
                .attr({
                    "x1": 0,
                    "y1": 0,
                    "x2": width,
                    "y2": 0
                })
                .style({
                    "stroke": "#333",
                    "stroke-width": "1.0",
                    "shape-rendering": "crispEdges",
                    "fill-opacity": "1.0"
                });    
                
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0, " + height + ")")
                .call(xAxis)
                .append("text")
                .attr({
                    "x": width,
                    "y": 40
                })
                .style({
                    "text-anchor": "end",
                    "font-family": "Arial, sans-serif",
                    "font-size": "16px",
                    "text-rendering": "geometricPrecision"
                })
                .text("X Axis Label Goes Here");

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr({
                    "y": -40,
                    "transform": "rotate(-90)"
                })
                .style({
                    "text-anchor": "end",
                    "font-family": "Arial, sans-serif",
                    "font-size": "17px",
                    "text-rendering": "geometricPrecision"
                })
                .text("Y Axis Label Goes Here");

            svg.selectAll(".axis text")
                .style("fill", "#333")
                .style("stroke-width", 0)
                .style("font-family", "Arial, sans-serif")
                .style("font-size", 12)
                .style("font-rendering", "geometricPrecision");
                
            svg.selectAll(".axis line")
                .style("fill", "none")
                .style("stroke", "#333")
                .style("stroke-width", 1.0)
                .style("shape-rendering", "crispEdges");
                
            svg.selectAll(".domain")
                .style("fill", "none")
                .style("stroke", "#333")
                .style("stroke-width", 1.0)
                .style("shape-rendering", "crispEdges");

            svg.selectAll("path.samples")
                .data([samples])
                .enter()
                .append("path")
                .attr("id", "line")
                .attr("class", "samples")
                .attr("d", line)
                .style("fill", "none")
                .style("stroke", "rgb(6, 12, 124)")
                .style("stroke-width", 2)
                .style("cursor", "pointer")
                .style("position", "relative");

            svg.append("div")
                .attr("id", "line-tooltip")
                .style({
                    "z-index": "9999",
                    "opacity": "0"
                });
            
            var script = 'd3.select("#line").on("mousemove", function() { var x = d3.scale.linear().domain([0, ' + (samples.length - 1) + ']).range([0, ' + width + ']); var y = d3.scale.linear().domain([' + d3.min(samples) + ', ' + d3.max(samples) + ']).range([' + height + ', 0]); var xMouse = x.invert(d3.mouse(this)[0]).toFixed(3); var yMouse = y.invert(d3.mouse(this)[1]).toFixed(3); console.log("x: " + xMouse + " y: " + yMouse); var tooltip = d3.select("#line-tooltip"); tooltip.html("x: " + xMouse + ", y: " + yMouse); tooltip.style({"position": "absolute", "outline": "none", "background": "rgb(6, 12, 124)", "font-family": "Arial, sans-serif", "-webkit-font-smoothing": "subpixel-antialiased", "color": "#fff", "font-size": "12px", "line-height": "1.5", "border-radius": "5px", "box-sizing": "border-box", "min-width": "50px", "padding": "8px 16px", "z-index": "9999"}); var pageXValue = d3.event.pageX + 3; var pageYValue = d3.event.pageY - 35; tooltip.style({"left": "" + pageXValue + "px", "top": "" + pageYValue + "px"}); tooltip.transition().duration(300).style("opacity", "1.0"); }).on("mouseout", function() { d3.select("#line-tooltip").transition().duration(300).style("opacity", "0"); d3.select("#line-tooltip").style("padding", "0").style("border", "0").html(""); });';
            svg.append("script").html(script);
            
            var filePath = path.join(__dirname, "index.html");
            fs.writeFile(filePath, '<script src="./d3.min.js"> </script><div style="width: 600px; margin: 0 auto;"><h3 style="width: 100%; margin-top: 5rem; font-family: Arial, sans-serif; font-size: 24px; text-align: center;">Server-rendered interactive D3.js SVG</h3>' + dd.innerHTML + '</div>', function(error) {
                if (!error) {
                    res.writeHead(200, {"Content-Type": "text/html"});           
                    var readStream = fs.createReadStream(filePath);
                    readStream.pipe(res);
                } else {
                    console.log("Error:", error);
                    res.end();
                }
            });
            
    } else {
        if (req.url === "/favicon.ico") { res.end(); }
        var filePath = path.join(__dirname, req.url); console.log(req.url, filePath);
        res.writeHead(200, {});
        var readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    }
}).listen(process.env.PORT || 5000);
console.log("Server running at http://127.0.0.1:1337/");