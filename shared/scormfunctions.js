var findAPITries = 0;
var maxFindAPITries = 10;

function findAPI(win) {
   console.log("Searching for SCORM API...");
   while ((win.API == null) &&
          (win.parent != null) &&
          (win.parent != win)) {
      findAPITries++;
      console.log(`Trying to find API: Attempt ${findAPITries}`);
      if (findAPITries > maxFindAPITries) {
         console.log("Error finding API -- too deeply nested.");
         return null;
      }
      win = win.parent;
   }
   if (win.API) {
       console.log("SCORM API found.");
   }
   return win.API;
}

function getAPI() {
   var theAPI = findAPI(window);
   if ((theAPI == null) &&
       (window.opener != null) &&
       (typeof(window.opener) != "undefined")) {
      console.log("Searching for API in window opener...");
      theAPI = findAPI(window.opener);
   }
   if (theAPI == null) {
      console.log("Unable to find an API adapter");
   }
   return theAPI;
}

var SCORM_TRUE = "true";
var SCORM_FALSE = "false";
var SCORM_NO_ERROR = "0";

var finishCalled = false;
var initialized = false;
var API = null;

function ScormProcessInitialize() {
    console.log("Initializing SCORM process...");
    API = getAPI();
    if (API == null) {
        alert("ERROR - Could not establish a connection with the LMS.\n\nYour results may not be recorded.");
        console.log("API is null. LMS not found or API not accessible.");
        return;
    }
    var result = API.LMSInitialize("");
    if (result == SCORM_FALSE) {
        handleError("initialize");
        return;
    }
    initialized = true;
    console.log("SCORM API initialized.");
}

function ScormProcessFinish() {
    console.log("Finishing SCORM process...");
    if (initialized == false || finishCalled == true) { return; }
    var result = API.LMSFinish("");
    finishCalled = true;
    if (result == SCORM_FALSE) {
        handleError("terminate");
        return;
    }
    console.log("SCORM API terminated.");
}

function handleError(action) {
    var errorNumber = API.LMSGetLastError();
    var errorString = API.LMSGetErrorString(errorNumber);
    var diagnostic = API.LMSGetDiagnostic(errorNumber);
    var errorDescription = "Number: " + errorNumber + "\nDescription: " + errorString + "\nDiagnostic: " + diagnostic;
    alert(`Error - Could not ${action} communication with the LMS.\n\nYour results may not be recorded.\n\n` + errorDescription);
    console.log(`Error - Could not ${action} communication with the LMS:`, errorDescription);
}

function ScormProcessGetValue(element) {
    if (initialized == false || finishCalled == true) { return ""; }
    var result = API.LMSGetValue(element);
    if (result == "") {
        handleError("retrieve a value");
        return "";
    }
    return result;
}

function ScormProcessSetValue(element, value) {
    if (initialized == false || finishCalled == true) { return; }
    var result = API.LMSSetValue(element, value);
    if (result == SCORM_FALSE) {
        handleError("store a value");
        return;
    }
}

