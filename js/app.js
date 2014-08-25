var App = function(){
  var self = this;
  this.width = window.innerWidth;
  this.height = window.innerHeight;

  this.set();
  this.load();

  $(window).on('resize', function() {
  
    self.width = window.innerWidth;
    self.height = window.innerHeight;
    self.update();

  });
};

App.prototype.set = function() {
  var self = this; 

  this.projection = d3.geo.albersUsa()
    .scale(1280)
    .translate([this.width / 2, this.height / 2.2]);

  this.path = d3.geo.path()
      .projection(this.projection);

  this.svg = d3.select("body").append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

  this.x = d3.scale.linear()
      .domain([0, 365])
      .range([0, this.width-100])
      .clamp(true);

  this.brush = d3.svg.brush()
      .x(this.x)
      .extent([0, 0])
      .on("brush", function() {
        self.brushed(this)
      });

  d3.selectAll('.halo').remove();

  this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(50," + (this.height - 50) + ")")
      .call(d3.svg.axis()
        .scale(self.x)
        .orient("bottom")
        .tickSize(0)
        .tickPadding(12))
    .select(".domain")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "halo");

  this.slider = this.svg.append("g")
      .attr("class", "slider")
      .call(self.brush);

  this.slider.select(".background")
      .attr("height", this.height);

  this.handle = this.slider.append("circle")
      .attr("class", "handle")
      .attr("transform", "translate(50," + (this.height - 50) + ")")
      .attr("r", 9);

  this.color = d3.scale.linear()
      .domain([31.99, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 96.77])
      .range(['#0050fb', '#3367f4', '#447ded', '#4d92e6', '#4fa8df', '#82b3c3', '#b0bb9d', '#d1c275', '#ebca45', '#fcc707', '#fead15', '#fe911d', '#fd7321', '#fb4f24']);
      //.range(['#0050fb', '#3e65f2', '#6077e5', '#7c86d5', '#9492c2', '#a99cae', '#bca298', '#cda581', '#dba56b', '#e8a055', '#f19641', '#f88631', '#fc7026', '#fb4f24']);

}

App.prototype.brushed = function(e) {
  var self = this;
  var value = this.brush.extent()[0];
  if (d3.event.sourceEvent) { // not a programmatic event
    value = this.x.invert(d3.mouse(e)[0]);
    this.brush.extent([value, value]);
  }

  this.handle.attr("cx", this.x(value));
  d3.selectAll('path.county') 
    .style("fill",function(d){
      if ( self.temps[ d.properties.FIPS ] ){ 
        var cls = self.color(self.temps[ d.properties.FIPS ][Math.floor(value)]);
        return cls;
      } else {
        return '#fff';
      }
    });
}

App.prototype.load = function() {
  var self = this;
  var index = 0;

  d3.json("data/out.json", function(error, data) {
    self.temps = data;
    d3.json("data/counties.json", function(error, topology) {
      self.svg.selectAll("path")
          .data(topojson.feature(topology, topology.objects.UScounties).features)
        .enter().append("path")
          .attr("d", self.path)
          .attr('class', 'county')
          .style("fill",function(d){ 
            //console.log( d.properties.FIPS);
            //console.log( temps[ d.properties.FIPS ][index] );
            if ( self.temps[ d.properties.FIPS ] ){ 
              var cls = self.color(self.temps[ d.properties.FIPS ][index]);
              return cls;
            } else {
              return '#fff';
            }
          });
    });
  });
}

App.prototype.update = function() {
  var self = this;
  this.projection = d3.geo.albersUsa()
    .scale(1280)
    .translate([this.width / 2, this.height / 2.2]);

  this.path = d3.geo.path()
      .projection(this.projection);

  d3.select('svg')
      .attr("width", this.width)
      .attr("height", this.height);

  this.x = d3.scale.linear()
      .domain([0, 365])
      .range([0, this.width-100])
      .clamp(true);

  this.brush = d3.svg.brush()
      .x(this.x)
      .extent([0, 0])
      .on("brush", function() {
        self.brushed(this)
      });

  d3.selectAll(".county")
    .attr("d", this.path);

  d3.selectAll('.halo').remove();

  d3.selectAll('.x, .axis')
    .attr("transform", "translate(50," + (this.height - 50) + ")")
    .call(d3.svg.axis()
      .scale(self.x)
      .orient("bottom")
      .tickSize(0)
      .tickPadding(12))
    .select(".domain")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "halo");

  this.slider.select(".background")
      .attr("height", this.height);

  d3.selectAll('circle')
      .attr("transform", "translate(50," + (this.height - 50) + ")");
}
