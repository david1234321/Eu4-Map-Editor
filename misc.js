

function initJQueryUI () {
    
    //Turn our form into pretty tabs
    $("#tabMain").tabs();  
    $("#statusBar").progressbar();
        
}

//Call on body load. Check compatibility and hide/unhide various elements
function init() {
    
    initJQueryUI ();
    
    prepareDownloadify();
    
    //Start by hiding everything
    $("#tabMain").hide();
    $("#fileInputDiv").hide();
    $("#resDiv").hide();
    $("#saveN").hide();
    $("#saveP").hide();
    $("#provStats").hide();
    $("#confirm_swap").hide();
    
    //See if we have a new enough browser to use file uploading
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        $("#willWork").html("Querying.. You have a newer browser that supports file reading so everything should work. Huzzah!");
        $("#fileInputDiv").show();
    } else {
        $("#willWork").html("Sorry! Your browser doesn't support file reading. It's either an old version of chrome, firefox, or IE, or it's something horrible like Safari.");
        return;
    }
    
    //Set up some event handlers
    $("#fileElem").on('change', function(e) {
        
        $("#statusBar").progressbar("value", 0);
        
        var reader = new FileReader();
        
        //Done, put into a string
        reader.onload = fileRead;
        
        //Something went horribly wrong
        reader.onerror = readerr;
        
        //Call periodically during
        reader.onprogress = updateLoadProgress;
        reader.readAsText(this.files[0], "windows-1252");
        
    
    
    
    });
    
    
}

function readerr (e) {
    alert("Error" + e);
}

function fileRead (e) {
    
    cachedFile = e.target.result.split("\n");
    
    
    //Do some preliminary parsing 
    initParse(e.target.result);

}

//Show the progress of loading the file into a string
function updateLoadProgress(e) {
    
    if (e.lengthComputable) {
        var loaded = 100*(e.loaded/e.total)/2;
        $("#statusBar").progressbar("value", loaded);
        $("#statusMessage").html("Status: Caching in memory - " + 100*(e.loaded/e.total) + "%");
    }
    
}