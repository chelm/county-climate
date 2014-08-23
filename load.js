var exec = require('child_process').exec,
  async = require('async');

var q = async.queue(function(task, callback){
  var cmd = 'curl -X POST --data "'+task.form+'" http://wonder.cdc.gov/controller/datarequest/D60a -o data/'+ (k++) +'.tsv';
  console.log(cmd);
  exec(cmd, function(err){
    console.log(err)
    callback();
  });
},2);

var form="O_javascript=on&stage=request&dataset_id=D60a&O_max=D60a.V10&O_min=D60a.V12&O_hi=D60a.V14&B_1=D60a.V2-level2&O_scale=F%2CF2&B_2=*None*&B_3=*None*&B_4=*None*&B_5=*None*&M_1=D60a.M1&M_2=D60a.M2&O_title=&O_location=D60a.V2&finder-stage-D60a.V2=codeset&O_V2_fmode=freg&V_D60a.V2=&F_D60a.V2=*All*&I_D60a.V2=*All*+%28The+United+States%29%0D%0A&finder-stage-D60a.V1=codeset&O_V1_fmode=freg&V_D60a.V1=&F_D60a.V1=*All*&I_D60a.V1=*All*+%28The+United+States%29%0D%0A&O_dates=D60a.V7_range&RD1_M_D60a.V7=%month&RD1_D_D60a.V7=%day&RD1_Y_D60a.V7=1979&RD2_M_D60a.V7=%month&RD2_D_D60a.V7=%day&RD2_Y_D60a.V7=2011&V_D60a.V3=*All*&O_dates_2=D60a.V8&V_D60a.V4=*All*&V_D60a.V8=*All*&V_D60a.V6=*All*&finder-stage-D60a.V7=codeset&O_V7_fmode=freg&V_D60a.V7=&F_D60a.V7=*All*&I_D60a.V7=*All*+%28All+Dates%29%0D%0A&O_tempF=F2_range&R1_D60a.V10=&R2_D60a.V10=&R1_D60a.V12=&R2_D60a.V12=&R1_D60a.V14=&R2_D60a.V14=&V_D60a.V10=*All*&V_D60a.V12=*All*&V_D60a.V14=*All*&O_tempC=C2_range&R1_D60a.V11=&R2_D60a.V11=&R1_D60a.V13=&R2_D60a.V13=&R1_D60a.V15=&R2_D60a.V15=&V_D60a.V11=*All*&V_D60a.V13=*All*&V_D60a.V15=*All*&O_change_action-Export+Results=Export+Results&O_precision=2&O_timeout=300&action-Send=Send";

function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}

var month, day, days;

var i = 1, k = 1; 
while ( i < 13){
  month = ((i+'').length == 1) ? '0'+i : i;
  days = daysInMonth(i,2014);
  var j = 1;
  while ( j < days+1){
    day = ((j+'').length == 1) ? '0'+j : j;
    q.push({form: form.replace(/%month/g, month).replace(/%day/g, day)});
    j++;
  }
  i++;
}




