var App = function(){
  var self = this;

  this.width = window.innerWidth;
  this.height = window.innerHeight;
  self._stop_animating = true;

  this.set();
  this.load();

  d3.select(window).on('resize', function(){
  
    self.width = window.innerWidth;
    self.height = window.innerHeight;
    self.update();

  });

  d3.select('.ui-play-pause').on('click', function() {
    if ( self._stop_animating === true ) {
      d3.select( '.ui-play-pause' ).attr('class', 'ui-play-pause glyphicon glyphicon-pause');
      self._stop_animating = false;
      self.animate();
    } else {
      d3.select( '.ui-play-pause' ).attr('class', 'ui-play-pause glyphicon glyphicon-play');
      self._stop_animating = true;
    }
  });

};

App.prototype.set = function() {
  var self = this; 

  this.projection = d3.geo.albersUsa()
    .scale(Math.min(this.width+(this.width/2), 1200))
    .translate([this.width / 2, this.height / 2.2]);

  this.path = d3.geo.path()
      .projection(this.projection);

  this.svg = d3.select("body").append("svg")
      .attr("id", "map")
      .attr("width", this.width)
      .attr("height", this.height);

  this.chart = d3.select("#chart").append("svg")
      .attr("width", 300)
      .attr("height", 200);

  this.x = d3.scale.linear()
      .domain([0, 364])
      .range([40, this.width-40])
      .clamp(true);

  this.brush = d3.svg.brush()
      .x(this.x)
      .extent([0, 0])
      .on("brush", function() {
        self.brushed(this)
      });

  this.slider = d3.select("#slide").append("g")
      .attr("class", "slider")
      .call(self.brush);

  this.slider.select(".background")
     .attr("height", 40)
     .attr('width', 1220);

  this.color = d3.scale.linear()
      .domain([31.99, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 96.77])
      .range(['#0050fb', '#3367f4', '#447ded', '#4d92e6', '#4fa8df', '#82b3c3', '#b0bb9d', '#d1c275', '#ebca45', '#fcc707', '#fead15', '#fe911d', '#fd7321', '#fb4f24']);
      //.range(['#0050fb', '#3e65f2', '#6077e5', '#7c86d5', '#9492c2', '#a99cae', '#bca298', '#cda581', '#dba56b', '#e8a055', '#f19641', '#f88631', '#fc7026', '#fb4f24']);

  d3.selectAll('#legend div')
    .style('background', function(d){
      return self.color(d3.select(this).node().id);
    });

  //this.animate();
}



App.prototype.animate = function() {
  var self = this;
  this.t = this.t || 0;
  this._stop_animating = false;

  d3.timer(function() {
    self.brushed(null);
    self.t++;
    if ( self.t === 360 ) {
      self.t = 0;
    }
    return self._stop_animating;
  });
}



App.prototype.brushed = function(e) {
  var self = this;
  var value = this.brush.extent()[0];

  if ( d3.event ) {
    if (d3.event.sourceEvent) { // not a programmatic event
      this._stop_animating = true;
      d3.select('.ui-play-pause').attr('class', 'ui-play-pause glyphicon glyphicon-play');
      value = this.x.invert(d3.mouse(e)[0]);
      this.brush.extent([value, value]);
      this.t = value;
    } 
  } else {
    value = this.t;
    this.brush.extent([value, value]);
  }
  
  this.setDate(value);

  d3.select('.ui-slider-handle').style('left', this.x(value)+'px');  
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



App.prototype.setDate = function(d) {
  var dateFromDay = function(year, day){
    var dx = new Date(year, 0); // initialize a date in `year-01-01`
    return new Date(dx.setDate(day+1)); // add the number of days
  }

  var date = dateFromDay(2010, d);
  date = moment(date).format("MMMM DD");
  d3.select('#date').html(date);
}


App.prototype.load = function() {
  var self = this;
  var index = 0;

  this.setDate(index);

  d3.json("data/counties.json", function(error, topology) {
    self.svg.selectAll("path")
        .data(topojson.feature(topology, topology.objects.UScounties).features)
      .enter().append("path")
        .attr("d", self.path)
        .attr('class', 'county')
        .style("fill", '#777')
        .on('mouseover', function( d ){
          //console.log(d);
        });
  });

  var req = new XMLHttpRequest();
  req.open('GET', 'data/out.json.gz', true);
  req.responseType = 'arraybuffer';

  req.onload = function(){
    gzdata = new Uint8Array(req.response);
    data = (new Zlib.Gunzip(gzdata)).decompress();

    var f = new FileReader();
    f.onload = function(e) {
      var data = JSON.parse(e.target.result);
      self.temps = data;
      d3.selectAll('.county')
        .style("fill",function(d){ 
          if ( self.temps[ d.properties.FIPS ] ){ 
            var cls = self.color(self.temps[ d.properties.FIPS ][index]);
            return cls;
          } else {
            return '#fff';
          }
        });
    }
    f.readAsText(new Blob([data]))
  };
  req.send();
}

App.prototype.update = function() {
  var self = this;
  this.projection = d3.geo.albersUsa()
    .scale(Math.min(this.width+(this.width/2), 1200))
    .translate([this.width / 2, this.height / 2.2]);

  this.path = d3.geo.path()
      .projection(this.projection);

  d3.select('#map')
      .attr("width", this.width)
      .attr("height", this.height);

  this.x = d3.scale.linear()
      .domain([0, 365])
      .range([0, this.width])
      .clamp(true);

  this.brush = d3.svg.brush()
      .x(this.x)
      .extent([0, 0])
      .on("brush", function() {
        self.brushed(this)
      });

  d3.selectAll(".county")
    .attr("d", this.path);

  this.slider.select(".background")
      .attr("height", this.height);

}
