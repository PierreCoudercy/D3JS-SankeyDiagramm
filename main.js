var data = {
    "nodes":[
	{"label":"SYS1", "pos":"center"},
	{"label":"SYS2", "pos":"in"},
	{"label":"SYS3", "pos":"in"},
	{"label":"SYS4", "pos":"in"},
	{"label":"SYS5", "pos":"out"},
	{"label":"SYS6", "pos":"out"},
	{"label":"SYS7", "pos":"out"},
    ],
    "links":[
	{"source":1,"target":0,"w":1,"inport":"65536-65536","outport":"65536-65536"},
	{"source":2,"target":0,"w":1,"inport":"65536-65536","outport":"65536-65536"},
	{"source":3,"target":0,"w":1,"inport":"65536-65536","outport":"65536-65536"},
	{"source":0,"target":4,"w":1,"inport":"65536-65536","outport":"65536-65536"},
	{"source":0,"target":5,"w":1,"inport":"65536-65536","outport":"65536-65536"},
	{"source":0,"target":6,"w":1,"inport":"65536-65536","outport":"65536-65536"},
    ]
};

var width = 1700,
    height = 800,
    radius = 30;

idIN  = 0;
yIN	  = 0;
idOUT = 0;
yOUT  = 0;

data.nodes.forEach(function(d){
    d["w"] = 4*radius;
    if(d.pos == "center"){
	id=data.nodes.indexOf(d);
	num_in = 0;
	num_out = 0;
	for(l in data.links){
	    if(data.links[l].source == id){
		num_out++;
	    }
	    else{
		num_in++;
	    }
	}
	d["h"] = Math.max(num_in,num_out)*radius;
	d["x"] = width/2-d.w/2;
	d["y"] = height/2-d.h/2;
    }
    else if (d.pos == "in"){
	d["h"] = radius;
	d["x"] = 3*radius-d.w/2;
	if(yIN == 0){
	    d["y"] = height/2-d.h/2;
	    idIN++;
	    yIN++;
	}
	else{
	    d["y"] = height/2+(yIN+2*d.h)*Math.pow(-1,idIN)-d.h/2;
	    if(idIN%2==0){
		yIN++;
	    }
	    idIN++;
	}
    }
    else{
	d["h"] = radius;
	d["x"] = width-d.w*2.5/2;
	if(yOUT == 0){
	    d["y"] = height/2-d.h/2;
	    idOUT++;
	    yOUT++;
	}
	else{
	    d["y"] = height/2+(yOUT+2*d.h)*Math.pow(-1,idOUT)-d.h/2;
	    if(idOUT%2==0){
		yOUT++;
	    }
	    idOUT++;
	}
    }
});

dictLinksId = {}

data.links.forEach(function(d){
    d.source = data.nodes[d.source];
    d.target = data.nodes[d.target];
    if(d.target.pos == "center"){
	d["c"] = "in";
    }
    else{
	d["c"] = "out";
    }
    if(dictLinksId[d.source.label+d.target.label]){
	d["id"] = d.source.label+d.target.label+dictLinksId[d.source.label+d.target.label]
	dictLinksId[d.source.label+d.target.label]++;
    }
    else{
	d["id"] = d.source.label+d.target.label;
	dictLinksId[d.source.label+d.target.label]=1;
    }
});

var diagonal = d3.line().curve(d3.curveBundle).x(function(d){return d.x}).y(function(d){return d.y});

var svg = d3.select("body").append("svg")
    .attr("width",width)
    .attr("height",height);

idIN  = 1;
yIN	  = 0;
idOUT = 1;
yOUT  = 0;		

var link = svg.append("g")
    .attr("class","link")
    .selectAll("path")
    .data(data.links).enter()
    .append("path")
    .attr("id",function(d){return d.id;})
    .attr("class",function(d){return "path"+d.c;})
    .attr("d",function(d){
	x1 = d.source.x+d.source.w;
	mody1 = 0;
	if(d.c == "out"){
	    if(yOUT == 0){
		y1 = d.source.y+d.source.h/2;
		yOUT++;
	    }
	    else{
		mody1 = (yOUT*radius)*Math.pow(-1,idOUT)
		y1 = d.source.y+d.source.h/2+mody1;
		if(idOUT%2==0){
		    yOUT++;
		}
		idOUT++;
	    }
	}
	else{
	    y1 = d.source.y+radius/2;
	}
	d["y1"] = mody1;
	x2 = d.target.x;
	mody2 = 0;
	if(d.c == "in"){
	    if(yIN == 0){
		y2 = d.target.y+d.target.h/2;
		yIN++;
	    }
	    else{
		mody2 = (yIN*radius)*Math.pow(-1,idIN)
		y2 = d.target.y+d.target.h/2+mody2;
		if(idIN%2==0){
		    yIN++;
		}
		idIN++;
	    }
	}
	else{
	    y2 = d.target.y+radius/2;
	}
	d["y2"] = mody2;
	if(d.c=="in"){
	    dx = (x1+x2)/4;
	}
	else{
	    dx = (x1+x2)/10;
	}
	return diagonal([{"x":x1,"y":y1},{"x":x1+dx,"y":y1},{"x":x2-dx,"y":y2},{"x":x2,"y":y2}])
    });

var node = svg.append("g")
    .attr("class","node")
    .selectAll("rect")
    .data(data.nodes).enter()
    .append("rect")
    .attr("class",function(d){return d.pos;})
    .attr("width",function(d){return d.w;})
    .attr("height",function(d){return d.h;})
    .attr("x",function(d){return d.x})
    .attr("y",function(d){return d.y})
    .call(d3.drag().on("drag", dragged));

var label = svg.append("g")
    .attr("class","label")
    .selectAll(".label")
    .data(data.nodes).enter()
    .append("text")
    .attr("x",function(d){return d.x+d.w/2;})
    .attr("y",function(d){if(d.pos=="center"){return d.y+d.h/10*5.4;}else{return d.y+d.h/3*2;}})
    .attr("text-anchor", "middle")
    .text(function(d){return d.label;});

/*var portLabel = svg.append("g")
    .attr("class","portLabel")
    .selectAll(".portLabel")
    .data(data.nodes).enter()
    .append("text")
    .append("textPath")
    .attr("xlink:href", function(d){return "#"+d.id;})
    .attr("x", function(d){if(d.pos=="in"){return d.x+d.w+4*radius;}else{return d.x-4*radius;}})
    .attr("y",function(d){return d.y+d.h/3*2;})
    .attr("text-anchor", "middle")
    .text(function(d){if(d.port!="None"){return d.port;}});*/

var inport = svg.append("g")
    .attr("class","inPortLabel")
    .selectAll(".inPortLabel")
    .data(data.links).enter()
    .append("text")
    .attr("y",radius/5)
    .append("textPath")
    .attr("xlink:href", function(d){return "#"+d.id;})
    .attr("text-anchor", "middle")
    .attr("startOffset", "10%")
    .text(function(d){return d.inport});

var outport = svg.append("g")
    .attr("class","outPortLabel")
    .selectAll(".outPortLabel")
    .data(data.links).enter()
    .append("text")
    .attr("y",radius/5)
    .append("textPath")
    .attr("xlink:href", function(d){return "#"+d.id;})
    .attr("text-anchor", "middle")
    .attr("startOffset", "90%")
    .text(function(d){return d.outport});


var weightLabel = svg.append("g")
    .attr("class","weightLabel")
    .selectAll(".weightLabel")
    .data(data.links).enter()
    .append("text")
    .attr("y",radius/5)
    .append("textPath")
    .attr("xlink:href", function(d){return "#"+d.id;})
    .attr("text-anchor", "middle")
    .attr("startOffset", "50%")
    .text(function(d){return d.w;});


function dragged(d){
    d3.select(this).attr("x",function(d){return d.x+=d3.event.dx}).attr("y",function(d){return d.y+=d3.event.dy});
    label.filter(function(l){return l===d;}).attr("x",function(d){return d.x+d.w/2;}).attr("y",function(d){if(d.pos=="center"){return d.y+d.h/10*5.4;}else{return d.y+d.h/3*2;}});
    link.filter(function(l){return l.source===d}).attr("d",function(d){
	x1 = d.source.x+d.source.w;
	if(d.c == "out"){
	    y1 = d.source.y+d.source.h/2+d.y1;
	}
	else{
	    y1 = d.source.y+radius/2
	}
	x2 = d.target.x;
	if(d.c == "in"){
	    y2 = d.target.y+d.target.h/2+d.y2;
	}
	else{
	    y2 =  d.target.y+radius/2
	}
	if(d.c=="in"){
	    dx = (x1+x2)/4;
	}
	else{
	    dx = (x1+x2)/10;
	}
	return diagonal([{"x":x1,"y":y1},{"x":x1+dx,"y":y1},{"x":x2-dx,"y":y2},{"x":x2,"y":y2}])
    });
    link.filter(function(l){return l.target===d}).attr("d",function(d){
	x1 = d.source.x+d.source.w;
	if(d.c == "out"){
	    y1 = d.source.y+d.source.h/2+d.y1;
	}
	else{
	    y1 = d.source.y+radius/2
	}
	x2 = d.target.x;
	if(d.c == "in"){
	    y2 = d.target.y+d.target.h/2+d.y2;
	}
	else{
	    y2 =  d.target.y+radius/2
	}
	if(d.c=="in"){
	    dx = (x1+x2)/4;
	}
	else{
	    dx = (x1+x2)/10;
	}
	return diagonal([{"x":x1,"y":y1},{"x":x1+dx,"y":y1},{"x":x2-dx,"y":y2},{"x":x2,"y":y2}])
    });
}

