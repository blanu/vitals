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

var bucket=function(timestamp)
{
  return Math.floor(timestamp/(86400*1000));
}

var now=function()
{
  return bucket(new Date().getTime());
}

var draw=function(tag)
{
  var x;
  var value;
  var s;
  var a;
  var start=now();
  var index;
  var scale;

  log('start: '+start);

  s='https://chart.googleapis.com/chart?cht=ls&chs=200x200&chtt='+tag;

  if(tag=='weight')
  {
    s=s+'&chm=h,FF0000,0,'+(165/250)+',1';
  }
  else if(tag=='sleep')
  {
    s=s+'&chm=h,FF0000,0,0.8,1';
  }

  s=s+'&chd=t:'
  a='';

  log(tag);
  log(data[tag]);

  for(x=0; x<10; x++)
  {
    index=start-(9-x);
    if(data[tag]===undefined || data[tag][index]===undefined)
    {
      a=a+0+',';
    }
    else
    {
      if(tag=='weight')
      {
        scale=100/250;
      }
      else if(tag=='sleep')
      {
        scale=100/10;
      }
      else
      {
        scale=100/5;
      }

      a=a+Math.round(data[tag][index]*scale)+',';
    }
  }

  a=a.substring(0,a.length-1);

  s=s+a;

  $('#'+tag).attr('src', s);
}

var drawGraphs=function()
{
  draw('weight');
  draw('sleep');
  draw('tired');
  draw('energetic');
  draw('depressed');
  draw('happy');
  draw('pain');
  draw('fatigue');
}

var process=function(results)
{
  var key;
  var value;
  var buck;

  for(key in results)
  {
    if(results.hasOwnProperty(key))
    {
      value=results[key];
      value.timestamp=key;
      buck=bucket(parseInt(key)).toString();

      if(value.value===undefined)
      {
        value.value=1;
      }

      if(value.tag in data)
      {
        if(buck in data[value.tag])
        {
          if(value.tag=='weight')
          {
            data[value.tag][buck]=Math.round((data[value.tag][buck]+value.value)/2);
          }
          else
          {
            data[value.tag][buck]=data[value.tag][buck]+value.value;
          }
        }
        else
        {
          data[value.tag][buck]=value.value;
        }
      }
      else
      {
        data[value.tag]={};
        data[value.tag][buck]=value.value;
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
  fetchData();
}

$(document).ready(initGraphs);

log('?');
