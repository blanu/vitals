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

var find=function(items, index, forward)
{
  var x;

  if(forward)
  {
    for(x=index+1; x<items.length; x++)
    {
      if(items[x]!==undefined)
      {
        return items[x];
      }
    }

    return null;
  }
  else
  {
    for(x=index-1; x>0; x--)
    {
      if(items[x]!==undefined)
      {
        return items[x];
      }
    }

    return null;
  }
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
  var result;
  var result2;
  var datapoint;

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

    if(data[tag]===undefined) // No data
    {
      log('no data');
      datapoint=0;
    }
    else if(data[tag][index]===undefined) // Missing data point
    {
      log('missing data point');
      if(tag=='weight' || tag=='sleep') // Zeros makes the graphs look weird
      {
        log('interpolate');
        if(x==0)
        {
          log('first data point');
          result=find(data[tag], index, true);

          if(result===null)
          {
            datapoint=0;
          }
          else
          {
            datapoint=result;
          }
        }
        else if(x==9)
        {
          log('last data point');
          result=find(data[tag], index, false);

          if(result===null)
          {
            datapoint=0;
          }
          else
          {
            datapoint=result;
          }
        }
        else
        {
          log('middle data point');
          result=find(data[tag], index, true);
          result2=find(data[tag], index, false);

          if(result===null && result2===null)
          {
            datapoint=0;
          }
          else
          {
            if(result===null)
            {
              datapoint=result2;
            }
            else if(result2===null)
            {
              datapoint=result;
            }
            else
            {
              datapoint=(result+result2)/2;
            }
          }
        }
      }
      else // No data means zero
      {
        log('use zero');
        datapoint=0;
      }
    }
    else
    {
      log('datapint available');
      datapoint=data[tag][index];
    }

    a=a+(datapoint*scale)+',';
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
          if(value.tag=='weight' || value.tag=='sleep')
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
