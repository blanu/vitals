var db=freefall.Database('http://freefall.blanu.net', 'vitals');
var data={};

var timestamp=function()
{
  return new Date().getTime().toString();
}

var set=function(tag, value)
{
  log('setting '+tag);

  if(value!==undefined && value!=null)
  {
    db.addDoc(timestamp(), {'tag': tag});
  }
  else
  {
    db.addDoc(timestamp(), {'tag': tag, 'value': value});
  }
}

var drawWeight=function()
{
}

var drawSleep=function()
{
}

var drawTired=function()
{
  set('tired');
}

var drawEnergetic=function()
{
  set('energetic');
}

var drawDepressed=function()
{
  set('depressed');
}

var drawHappy=function()
{
  set('happy');
}

var drawPain=function()
{
  set('pain');
}

var draw=function(tag)
{
  var table;
  var visualization;
  var rows;
  var x;
  var timestamp;
  var value;

  log('draw '+tag);
  log(google);
  log(google.visualization);
  log(google.visualization.DataTable);
  table = new google.visualization.DataTable();
  data.addColumn('data', 'Date');
  data.addColumn('number', tag);

  rows=[];
  for(x=0; x<data[tag].length; x++)
  {
    timestamp=data[tag][x].timestamp;
    if(data[tag][x].value===undefined)
    {
      value=1;
    }
    else
    {
      value=data[tag][x].value
    }
    rows.push([timestamp, value]);
  }

  log('rows:');
  log(rows);

  data.addRows(rows);

  visualization = new google.visualization.AnnotatedTimeLine($('#fatigue'));
  chart.draw(table, {displayAnnotations: true});
}

var drawGraphs=function()
{
  draw('happy');
}

var process=function(results)
{
  var key;
  var value;

  for(key in results)
  {
    if(results.hasOwnProperty(key))
    {
      value=results[key];
      value.timestamp=key;

      if(value.tag in data)
      {
        data[value.tag].push(value);
      }
      else
      {
        data[value.tag]=[value];
      }
    }
  }
}

var gotDocs=function(results)
{
  log('got docs:');
  log(results);

  process(results);

  log('data:');
  log(data);

  drawGraphs();
}

var fetchData=function()
{
  log('fetchData');
  db.getAll(gotDocs);
}

var initGraphs=function()
{
  log('initGraphs');
  google.load('visualization', '1', {'packages':['corechart']});
  google.load("visualization", "1", {'packages': ['annotatedtimeline']});
//  google.setOnLoadCallback(fetchData);

  fetchData();
}

$(document).ready(initGraphs);

log('?');
