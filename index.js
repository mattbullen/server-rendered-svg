(function init() {

    var d3 = require("d3"),
        http = require("http"),
        fs = require("fs"),
        path = require("path"),
        jsdom = require("jsdom").jsdom;
    
    var window = jsdom().parentWindow;
    var virtualDiv = window.document.createElement("div");

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

            var svg = d3.select(virtualDiv).append("svg")
                .attr({
                    "id": "main",
                    "height": 600,
                    "width": 600
                })
                .append("g")
                .attr({
                    "width": 539,
                    "height": 539,
                    "transform": "translate(51, 11)"
                });
                
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
                .attr({
                    "class": "x axis",
                    "transform": "translate(0, " + height + ")"
                })
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
                .style({
                    "fill": "#333",
                    "stroke-width": 0,
                    "font-family": "Arial, sans-serif",
                    "font-size": 12,
                    "font-rendering": "geometricPrecision"
                });
                
            svg.selectAll(".axis line")
                .style({
                    "fill": "none",
                    "stroke": "#333",
                    "stroke-width": 1.0,
                    "shape-rendering": "crispEdges"
                });
                
            svg.selectAll(".domain")
                .style({
                    "fill": "none",
                    "stroke": "#333",
                    "stroke-width": 1.0,
                    "shape-rendering": "crispEdges"
                });

            svg.selectAll("path.samples")
                .data([samples])
                .enter()
                .append("path")
                .attr({
                    "id": "line",
                    "class": "samples",
                    "d": line
                })
                .style({
                    "fill": "none",
                    "stroke": "rgb(6, 12, 124)",
                    "stroke-width": 2.0,
                    "position": "relative",
                    "cursor": "pointer"
                });

            svg.append("div")
                .attr("id", "line-tooltip")
                .style({
                    "z-index": "9999",
                    "opacity": "0"
                });
            
            var script = 'd3.select("#line").on("mousemove", function() { var x = d3.scale.linear().domain([0, ' + (samples.length - 1) + ']).range([0, ' + width + ']); var y = d3.scale.linear().domain([' + d3.min(samples) + ', ' + d3.max(samples) + ']).range([' + height + ', 0]); var xMouse = x.invert(d3.mouse(this)[0]).toFixed(3); var yMouse = y.invert(d3.mouse(this)[1]).toFixed(3); console.log("x: " + xMouse + " y: " + yMouse); var tooltip = d3.select("#line-tooltip"); tooltip.html("x: " + xMouse + ", y: " + yMouse); tooltip.style({"position": "absolute", "outline": "none", "background": "rgb(6, 12, 124)", "font-family": "Arial, sans-serif", "-webkit-font-smoothing": "subpixel-antialiased", "color": "#fff", "font-size": "12px", "line-height": "1.5", "border-radius": "5px", "box-sizing": "border-box", "min-width": "50px", "padding": "8px 16px", "z-index": "9999"}); var pageXValue = d3.event.pageX + 3; var pageYValue = d3.event.pageY - 35; tooltip.style({"left": "" + pageXValue + "px", "top": "" + pageYValue + "px"}); tooltip.transition().duration(300).style("opacity", "1.0"); }).on("mouseout", function() { d3.select("#line-tooltip").transition().duration(300).style("opacity", "0"); d3.select("#line-tooltip").style("padding", "0").style("border", "0").html(""); });';
            svg.append("script").html(script);
            
            /*
            var filePath = path.join(__dirname, "index.html");
            fs.writeFile(filePath, '<script src="./d3.min.js"> </script><div style="width: 600px; margin: 0 auto;"><h3 style="width: 100%; margin-top: 5rem; margin-bottom: 36px; padding-left: 18px; font-family: Arial, sans-serif; font-size: 24px; text-align: center;">Server-rendered interactive D3.js SVG</h3>' + virtualDiv.innerHTML + '</div>', function(error) {
                if (!error) {
                    res.writeHead(200, {"Content-Type": "text/html"});           
                    var readStream = fs.createReadStream(filePath);
                    readStream.pipe(res);
                } else {
                    console.log("Error:", error);
                    res.end();
                }
            });
            */
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write('<script src="./d3.min.js"> </script>'
            + '<script>window.onload = function() { document.body.innerHTML ="'
            + '<div style="width: 600px; margin: 0 auto;"><h3 style="width: 100%; margin-top: 5rem; margin-bottom: 36px; padding-left: 18px; font-family: Arial, sans-serif; font-size: 24px; text-align: center;">Server-rendered interactive D3.js SVG</h3>'
            + virtualDiv.innerHTML
            + '</div>"; };</script>');
            
            res.end();
            
        } else {
            if (req.url === "/favicon.ico") { res.end(); }
            var filePath = path.join(__dirname, req.url);
            res.writeHead(200, {});
            var readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
        }
        
    }).listen(process.env.PORT || 5000);
    
})();