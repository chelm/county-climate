var fs = require('fs');

Date.prototype.dayOfYear = function(){
  var j1= new Date( this );
  j1.setMonth( 0, 0 );
  return Math.round( ( this-j1 ) / 8.64e7 );
};

var day, output = {};

var days = {};

var files = fs.readdirSync('data/');
files.forEach(function(file){
  var p = file.replace('.tsv','').split('.');
  var doy = new Date( p[2], p[0]-1, p[1] ).dayOfYear();
  days[doy] = p;
//  console.log(p[2], p[0]-1, p[1], doy);
  var d = fs.readFileSync('data/'+file);
  if ( d ){ //&& p[0] == '10'){
    var lines = d.toString().split('\n');
    lines.forEach(function(line,i){
      var cols = line.split('\t');
      if (i == 0){
      } else if (cols.length > 1 && cols[2]){
        var fips = cols[2].replace(/"/g,'');
        if (!output[fips]){
          // should be an array of DOY
          output[fips] = [];
        }
        if (!output[fips][doy-1]){
          output[fips][doy-1] = [];
        }
        output[fips][doy-1][p[2]-1979] = parseFloat(cols[3]);
      }
    });
  } else {
    console.log(file, p);
  }
});

console.log(days);
//console.log('done', output['08015'].length, output['08015'][0]);
//console.log('county,days');
var avg = {};
for (var county in output){
  var first;
  avg[ county ] = [];

  // data is 365 arrays of 32
  var data = output[county];

  data.forEach(function( day,i ){
    //console.log(day);//, data[day].length);
    avg[county][i] = (day.reduce( function(total, num){ return total + num }, 0) / day.length).toFixed(2);
  });
}

fs.writeFile('out.json', JSON.stringify(avg));


