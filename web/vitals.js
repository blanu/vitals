var db=freefall.Database('http://freefall.blanu.net/', 'vitals');

var timestamp=function()
{
  return new Date().getTime().toString();
}

var set=function(tag, value)
{
  log('setting '+tag);

  if(value!==undefined && value!=null)
  {
    db.addDoc(timestamp(), {'tag': tag, 'value': value});
  }
  else
  {
    db.addDoc(timestamp(), {'tag': tag});
  }
}

var setWeight=function()
{
  $('#weightDialog').dialog({
    buttons: {
      'Save': function() {
        console.log('weight: '+$('#weightField').val());
        set('weight', parseFloat($('#weightField').val()));
        $(this).dialog('close');
      },
      'Cancel': function() {
        $(this).dialog('close');
      }
    }
  });
}

var setSleep=function()
{
  $('#sleepDialog').dialog({
    buttons: {
      'Save': function() {
        console.log('sleep: '+$('#sleepField').val());
        set('sleep', parseFloat($('#sleepField').val()));
        $(this).dialog('close');
      },
      'Cancel': function() {
        $(this).dialog('close');
      }
    }
  });
}

var setTired=function()
{
  set('tired');
}

var setEnergetic=function()
{
  set('energetic');
}

var setDepressed=function()
{
  set('depressed');
}

var setHappy=function()
{
  set('happy');
}

var setPain=function()
{
  set('pain');
}

var setFatigue=function()
{
  set('fatigue');
}

var initVitals=function()
{
  $('#weight').click(setWeight);
  $('#sleep').click(setSleep);
  $('#tired').click(setTired);
  $('#energetic').click(setEnergetic);
  $('#depressed').click(setDepressed);
  $('#happy').click(setHappy);
  $('#pain').click(setPain);
  $('#fatigue').click(setFatigue);
}

$(document).ready(initVitals);
