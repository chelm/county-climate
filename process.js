var fs = require('fs'),
  BigNumber = require('bignumber');

var day, output = {};

var files = fs.readdirSync('data/');
files.forEach(function(file){
  var data = fs.readFileSync('data/'+file);
  if (data){
    var lines = data.toString().split('\n');
    lines.forEach(function(line,i){
      var cols = line.split('\t');
      if (i == 0){
      } else if (cols.length > 1 && cols[2]){
        var fips = cols[2].replace(/"/g,'');
        if (!output[fips]){
          output[fips] = new Array(365);
        }
        output[fips][file.replace('.tsv','')-1] = parseFloat(cols[3]);
      }
    });
  } else {
    console.log(file)
  }
});

//console.log('done', Object.keys(output).length);
console.log('county,days');
for (var county in output){
  var first;
/*  output[county].forEach(function(val,i){
    if (i == 0){
      first = val;
    } else {
      //output[county][i] = (first - val).toFixed(2);
    }
  });*/
  //if (county == "08115") {
  
  //  console.log(county, ',', output[county].join(','));
  //}
}

fs.writeFile('out.json', JSON.stringify(output));


