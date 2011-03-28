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

var cleanData=function(tag, d)
{
  var x;
  var index;
  var datapoint;
  var result;
  var result2;
  var points=[];
  var start=now();

  for(x=0; x<10; x++)
  {
    index=start-(9-x);

    if(d===undefined) // No data
    {
      log('no data');
      datapoint=0;
    }
    else if(d[index]===undefined) // Missing data point
    {
      if(tag=='weight' || tag=='sleep') // Zeros makes the graphs look weird
      {
        if(x==0)
        {
          result=find(d, index, true);

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
          result=find(d, index, false);

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
          result=find(d, index, true);
          result2=find(d, index, false);

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

        continue;
      }
      else // No data means zero
      {
        datapoint=0;
      }
    }
    else
    {
      datapoint=d[index];
    }

    points.push([x, datapoint]);
  }

  return points;
}

var baseline=function(tag)
{
  var points=[];
  var base;
  var x;

  if(tag=='weight')
  {
    base=165;
  }
  else if(tag=='sleep')
  {
    base=8;
  }

  for(x=0; x<10; x++)
  {
    points.push([x, base]);
  }

  return points;
}

var draw=function(tag)
{
  var elem;
  var points;
  var options;

  elem=$('#'+tag);

  points=cleanData(tag, data[tag]);
  log('points:');
  log(points);

  options={
    xaxis: {min: 0, max: 10},
  };

  if(tag=='weight')
  {
    options.yaxis={min: 0, max: 250};
  }
  else if(tag=='sleep')
  {
    options.yaxis={min: 0, max: 10};
  }
  else
  {
    options.yaxis={min: 0, max: 5};
  }

  if(tag=='weight' || tag=='sleep')
  {
    $.plot(elem, [points, baseline(tag)], options);
  }
  else
  {
    $.plot(elem, [points], options);
  }
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
