function createDivList()
{
var x, i, j, l, ll, selElmnt, a, b, c;
/*look for any elements with the class "custom-select":*/
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /*for each element, create a new DIV that will act as the selected item:*/
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /*for each element, create a new DIV that will contain the option list:*/
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /*for each option in the original select element,
    create a new DIV that will act as an option item:*/
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /*when an item is clicked, update the original select box,
        and the selected item:*/
        var y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
      /*when the select box is clicked, close any other select boxes,
      and open/close the current select box:*/
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
      $("#locations").change();
    });
}
}
function closeAllSelect(elmnt) {
  /*a function that will close all select boxes in the document,
  except the current select box:*/
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}
/*if the user clicks anywhere outside the select box,
then close all select boxes:*/
document.addEventListener("click", closeAllSelect);

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//



// URL of the API Server
var apiServerUrl = "//ec2-18-184-233-115.eu-central-1.compute.amazonaws.com:8080";

// Interval for updating Data (see: function updateData)
var interval = 10000; //300000;

// selected locations longitude and latitude
var locationLongitude = 0;
var locationLatitude = 0;

// ajax function, first creates a binding to a function (given in parameter =callFunction), then sends the request to the server and calls the function after getting a response.
function ajaxBindRequest(v_url, callFunction) 
{
    var httpR;
    httpR = new XMLHttpRequest();
    httpR.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            callFunction(this);
        }
    };
    httpR.open("GET", v_url, true);
    httpR.onerror = function () {
        alert(httpR.statusText);
      };
    httpR.send();
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// gets all locations of the database
function getAllLocations(httpR)
{
    var jsonObj = JSON.parse(httpR.responseText);
    /*for(i in jsonObj)
    {
        ajaxBindRequest(apiServerUrl+"/locationInformation/"+jsonObj[i].locationId+"?fields=locationName,locationId,totalParkings", addToList)
    }*/
    for(i in jsonObj)
    {
        var opText = jsonObj[i].locationName+" ("+jsonObj[i].totalParkings+" Parkplätze)";
        var opValue = jsonObj[i].locationId;
        $("#locations").append(new Option(opText, opValue));
    }
    createDivList();
    $("#locations").change();
}

// adds a new location to the dropdown list
/*function addToList(httpR)
{
    var jsonObj = JSON.parse(httpR.responseText);
    var opText = jsonObj.locationName+" ("+jsonObj.totalParkings+" Parkplätze)";
    var opValue = jsonObj.locationId;
    $("#locations").append(new Option(opText, opValue));
}*/
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//

// change current location
$("#locations").change(function()
{
    if(this.value != -1)
    {
        ajaxBindRequest(apiServerUrl+"/locationInformation/"+this.value+"/countParkings", updateData);
        ajaxBindRequest(apiServerUrl+"/locationInformation/"+this.value+"?fields=longitude,latitude", updateLocationPosition);   
    }
    else if(this.value == -1)
    {
        timeNow();
        $("#timeArriving").text($("#timeNow").text());
    }
});

// call updateData
function intervalUpdateData()
{
    if($("#locations").val() != -1)
    {
        ajaxBindRequest(apiServerUrl+"/locationInformation/"+$("#locations").val()+"/countParkings", updateData);  
    }
    else if($("#locations").val() == -1)
    {
        timeNow();
        $("#timeArriving").text($("#timeNow").text());
    }
}

// update Data on screen
function updateData(httpR)
{
    var jsonObj = JSON.parse(httpR.responseText);
    $("#fpn").text(jsonObj.free);
    timeNow();
    //getLocation();
}

// update location Position
function updateLocationPosition(httpR)
{
    var jsonObj = JSON.parse(httpR.responseText);
    locationLongitude = jsonObj.longitude;
    locationLatitude = jsonObj.latitude;
    getLocation();
}




// curr time
function timeNow()
{
    var vtimeNow = new Date();
    $("#timeNow").text(vtimeNow.toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true}));
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
function getLocation() 
{
    navigator.geolocation.getCurrentPosition(calcRoute,failedCon);
}

function failedCon(error)
{
    var errorstr = "";
    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorstr = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            errorstr = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            errorstr = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            errorstr = "An unknown error occurred."
            break;
    }
    alert(errorstr);
}

// route calculate
// google api gibt pos + route?
// also google?
// nav location nur https / server aber http
function calcRoute(position)
{
    // is whitelisted to this website only
    var api_key = "2y7dhaGoaFLosc07G0QaHI8RDCh6QD9e";
    ajaxBindRequest("https://api.tomtom.com/routing/1/calculateRoute/"+position.coords.latitude+","+position.coords.longitude+":"+locationLatitude+","+locationLongitude+"/json?key="+api_key, timeArriving);
}

//arrv time
function timeArriving(httpR)
{
    var jsonObj = JSON.parse(httpR.responseText);
    var vtimeArriving = new Date(jsonObj.routes[0].summary.arrivalTime)
    $("#timeArriving").text(vtimeArriving.toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true}));

    //ajaxBindRequest(apiServerUrl+"/KI/"+vtimeArriving,updateKIData);
    updateKIData();
    // ki api call with time -> result %? flat?
}

//placeholder
function updateKIData(httpR)
{
    //var jsonObj = JSON.parse(httpR.responseText);
    //$("#fpa").text(jsonObj.free);
    $("#fpa").text(Math.floor(Math.random()*101)+"%")
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//

ajaxBindRequest(apiServerUrl+"/locationInformation", getAllLocations)
// dropdown aus parkplätzen erstellen (name + id in array)
/// 3?fields=locationName,locationId,totalParkings
// id je nach parkplatz raussuchen
// daten als json bekommen
// obj machen
// aus object auslesen und darstellen

setInterval(intervalUpdateData, interval)
