//Figure how far into brackets we currently are
var depth = 0;

//Cache the location of provinces and nations
var nationCache;
var provinceCache;

//Cache for edits
var editCache = {};
var PeditCache = {};

//Used for auto-complete
var nationTag;
var provinceTag;

//We've changed something, alert the variable!
function nChange () {
    $("#unsavedChanges").html("You have unsaved changes!");
    nationChange = true;
}

//Same for provinces
function pChange () {
    $("#PunsavedChanges").html("You have unsaved changes!");
    provinceChange = true;
}

//Do all of the initialization parsing to speed everything up
function initParse() {
    
    
    nationCache = {};
    provinceCache = {};
    nationTag = new Array();
    provinceTag = new Array();
    depth = 0; //Make sure this initialized or everything is going to fail
    
    $("#statusMessage").html("Status: Parsing nations..");
    
    //Find where the nations start, and find each nation location
    var i;
    for (i = 0; i < cachedFile.length; i++) {
               
        if (preParse(cachedFile[i]) === "countries=" && depth === 0) {
            var res, j;
            for (j = i + 1; j < cachedFile.length; j++) {
                res = preParse(cachedFile[j]);
                if (depth === 0) {
                    //We're out of the country section of the save, and thus we're done
                    break;
                } else {
                    if (res.indexOf("=") !== -1 && depth === 1) {
                        //We found the start of a country
                        var name = res.slice(0, 3);
                        //Add to cache
                        nationCache[name] = j;
                        //Add to auto-complete
                        nationTag.push(name);
                        $("#statusBar").progressbar("value", 50 + (i/cachedFile.length)*25);                      
                    }
                }
            }
        }
    }
    $("#statusBar").progressbar("value", 75);
    $("#statusMessage").html("Status: Parsing provinces..");
    
    //Do the same for the provinces
    depth = 0;
    for (i = 0; i < cachedFile.length; i++) {
               
        if (preParse(cachedFile[i]) === "provinces=" && depth === 0) {
            var res, j;
            for (j = i + 1; j < cachedFile.length; j++) {
                res = preParse(cachedFile[j]);
                if (depth === 0) {
                    //We're out of the province section of the save, and thus we're done
                    break;
                } else {
                    if (res.indexOf("=") !== -1 && depth === 1) {
                        //We found the start of a province
                        var name = res.slice(1, res.length - 1);
                        //Add to cache
                        provinceCache[name] = j;
                        $("#statusBar").progressbar("value", 75 + (i/cachedFile.length)*25);                      
                    }
                }
            }
        }
    }
    
 
    
    $("#statusBar").progressbar("value", 100);
    $("#statusMessage").html("Status: Done!");
    
    //Set up auto-complete
    $("#nationID").autocomplete({
        source: nationTag});
    
    //Set up province auto-complete (combine province ID with the name)
    for (i in provinceCache) {
        var temp = getProvFirstLevel(i, "name");
        if (temp !== "N/A") {
            provinceTag.push(i + "-" + temp.slice(1, temp.length-1));
        }      
    }
    $("#provinceID").autocomplete({
    source: provinceTag});
      
    //Everything is parsed, let's show the main screen
    $("#tabMain").show();
    
    
}

//Parse the various province fields
function parseProvince() {
    
    provinceChange = false;
    
    $(".infoSubmit").html("");
    
    var temp;
    PeditCache = {};
    
    //Figure out the province ID, make sure it's valid
    var ID = $("#provinceID").val();
    ID = (ID.split("-"))[0];
    
    if (provinceCache[ID] === undefined) {
        return;
    }
    
    $("#saveP").show();
    $("#provStats").show();
    
    //Name
    temp = getProvFirstLevel(ID, "name");
    temp = temp.slice(1, temp.length - 1);
    $("#provName").val(temp);
    
    //Get and show the current owner
    temp = getProvFirstLevel(ID, "owner");
    temp = temp.slice(1, temp.length - 1);
    $("#provOwner").val(temp);
    //Set possible owner auto complete
    $("#provOwner").autocomplete({
        source: nationTag});
    
    //Set and show current controller
    temp = getProvFirstLevel(ID, "controller");  
    temp = temp.slice(1, temp.length - 1);
    $("#provController").val(temp);
    //Set possible controller auto complete
    $("#provController").autocomplete({
        source: nationTag});
    
    //Taxes!
    temp = getProvFirstLevel(ID, "base_tax");
    $("#provTax").val(temp);
    
    //Aaaaand, religion
    temp = getProvFirstLevel(ID, "religion");
    $("#provRel").val(temp);
    
}

function commitProvinceChanges () {
    
    provinceChange = false;
    $("#PunsavedChanges").html("");
    
    var temp;
    
    //Change the owner
    temp = countTabs(cachedFile[PeditCache["owner"]]) + "owner=\"";
    temp += ($("#provOwner").val()).toUpperCase() + "\"";
    cachedFile[PeditCache["owner"]] = temp;
    
    //Change the controller
    temp = countTabs(cachedFile[PeditCache["controller"]]) + "controller=\"";
    temp += ($("#provController").val()).toUpperCase() + "\"";
    cachedFile[PeditCache["controller"]] = temp;
    
    //Get the tax in a proper format
    var tax = $("#provTax").val();
    tax = parseFloat(tax);
    tax = tax.toFixed(3);
    temp = countTabs(cachedFile[PeditCache["base_tax"]]) + "base_tax=" + tax;
    cachedFile[PeditCache["base_tax"]] = temp;
    
    //Religion
    temp = countTabs(cachedFile[PeditCache["religion"]]) + "religion=" + $("#provRel").val();
    cachedFile[PeditCache["religion"]] = temp;
    
}

//When we clicked a quick switch button on the nation screen
function provinceButtonClick(ID) {
    
    var temp = ID.split("_");
    temp = temp[1];
    
    
    //Are we destroying anything?
    if (provinceChange === true) {
        $(function() {
            $("#confirm_swap").dialog({
                resizable: false,
                height:280,
                modal: true,
                buttons: {
                    "Save them and continue": function () {
                        changeTab(temp);
                        commitProvinceChanges ();
                        $(this).dialog("close");
                    },
                    "Continue": function () {
                        changeTab(temp);
                        $(this).dialog("close");
                    },
                    Cancel: function () {
                        $(this).dialog("close");
                    }
                }
            });
        });     
    } else {
        changeTab(temp);
    }
    
    
}

function changeTab(temp) {
        //Try and change tabs
        $("#tab1").click();
        $("#provinceID").val(temp);
        $("#qryProv").click();
        
        
        
}

//Populate the provinces listed in the nation screen
function populateProvinces(nationID) {
    
    var i, temp;
    
    var isFirst = true;
    
    for (i in provinceCache) {
        temp = getProvFirstLevel(i, "owner");
        if (temp.slice(1, temp.length-1) === nationID) {
            if (isFirst === true) {
                isFirst = false;
                $("#NationProvList").html("");
                //Add a table
                $("#NationProvList").append("<table style=\"text-align:left; font-size:90%;\">");
            }
            //New row, new column
            $("#NationProvList").append("<tr><th>");
            
            //Prepare the data for our button
            var provName = getProvFirstLevel(i, "name");
            var buttonID = "prov_" + i;
           
            $("#NationProvList").append("<input type=\"button\" value=" + provName + " id=\"" + buttonID + "\" onclick=\"provinceButtonClick(this.id);\" style=\"width:100%\"/>");                                 
            
            $("#NationProvList").append("</tr></th>");
        }
    }
    
    //Optionally close the table
    if (isFirst === false) {
        $("#NationProvList").append("</table>");
    }
    
}

//Update all elements associated with the nation tab
function parseNation () {
    
    nationChange = false;
    
    $(".infoSubmit").html("");
    
    //Clear the edit Cache
    editCache = {};
    
    //First make sure we tried to select a valid element
    var name = $("#nationID").val();
    
    name = name.toUpperCase();
    
    if (nationTag.indexOf(name) === -1) {
        $("#nError").html("Error: Invalid nation tag.");
        return;
    } else {
        $("#nError").html("");
    }
    
    //Hide the old stuff
    $("#willWork").hide();
    $("#fileInputDiv").hide();
    
    //Show the resulting fields
    $("#resDiv").show();
    $("#saveN").show();
    
    /*Start populating fields with query results*/
    
    //First level easy queries
    $("#treasury").val(getFirstLevel(name, "treasury"));
    $("#prest").val(getFirstLevel(name, "prestige"));
    $("#stab").val(parseInt(getFirstLevel(name, "stability")));
    $("#merc").val(getFirstLevel(name, "mercantilism")*100);
    $("#natRel").val(getFirstLevel(name, "religion"));    
    $("#mpower").val(getFirstLevel(name, "manpower")*1000);  
    $("#techGrp").val(getFirstLevel(name, "technology_group"));
    
    //Tricky ones, get tech
    var temp = getTech(name);
    $("#adminTech").val(temp[0]);
    $("#diploTech").val(temp[1]);
    $("#milTech").val(temp[2]);
    
    //Split the power string into 3
    temp = getPower(name).split(" ");
    $("#adminPow").val(temp[0]);
    $("#diploPow").val(temp[1]);
    $("#milPow").val(temp[2]);
    
    //Find the monarch.. will probably rarely work
    temp = findMonarchInfo(name);
    if (temp[0] === "N/A") {
        $("#rulerName").val(temp[0]);
    } else {
        $("#rulerName").val(temp[0].slice(1, temp[0].length - 1));
    }
    $("#rulerAdmin").val(temp[1]);
    $("#rulerDiplo").val(temp[2]);
    $("#rulerMil").val(temp[3]);

    
    //Get the government type and figure out legitimacy or tradition because of it
    temp = getFirstLevel(name, "government");
    $("#govType").val(temp);
    
    temp = getFirstLevel(name, "republican_tradition");
    if (temp === "N/A" || temp === 0) {
        $("#legit").val(getFirstLevel(name, "legitimacy"));
    } else {
        $("#legit").val(parseInt(temp*100));
    }
    
    //Province stuff
    populateProvinces(name);
    

}

//Count the number of tabs, and return a string prefixed with that
function countTabs (inString) {
    
    var i, j, temp = "";
    for (i = 0; i < inString.length; i++) {
        if (inString[i] !== "\t") {
            break;
        }
    }
    
    for (j = 0; j < i; j++) {
        temp += "\t";
    }
    
    return temp;
    
}

//Push the nation changes to the cached file. Try to maintain indentation..
function commitNationChanges () {
    
    nationChange = false;
    $("#unsavedChanges").html("");
    
    //Make sure this is an active country
    
    if (editCache["name"] === undefined) {
        alert("This doesn't seem to be an active nation");
        return;
    }
    
    //Handle monarch name   
    temp = countTabs(cachedFile[editCache["name"]]) + "name=\"";
    temp += $("#rulerName").val() + "\"";
    cachedFile[editCache["name"]] = temp;
    
    //Admin skill
    temp = countTabs(cachedFile[editCache["adminSkill"]]) + "ADM=";
    temp += $("#rulerAdmin").val();
    cachedFile[editCache["adminSkill"]] = temp;
    
    //Diplo skill
    temp = countTabs(cachedFile[editCache["diploSkill"]]) + "DIP=";
    temp += $("#rulerDiplo").val();
    cachedFile[editCache["diploSkill"]] = temp;    

    //Military skill
    temp = countTabs(cachedFile[editCache["milSkill"]]) + "MIL=";
    temp += $("#rulerMil").val();
    cachedFile[editCache["milSkill"]] = temp;
    
    //Admin power/diplo power/mil power
    temp = countTabs(cachedFile[editCache["power"]]);
    temp += $("#adminPow").val() + " " + $("#diploPow").val() + " " + $("#milPow").val();
    cachedFile[editCache["power"]] = temp;
    
    //Admin tech
    temp = countTabs(cachedFile[editCache["adm_tech"]]) + "adm_tech=";
    temp += parseInt($("#adminTech").val());
    cachedFile[editCache["adm_tech"]] = temp;
    
    //Diplo tech
    temp = countTabs(cachedFile[editCache["dip_tech"]]) + "dip_tech=";
    temp += parseInt($("#diploTech").val());
    cachedFile[editCache["dip_tech"]] = temp;    
    
    //Military tech
    temp = countTabs(cachedFile[editCache["mil_tech"]]) + "mil_tech=";
    temp += parseInt($("#milTech").val());
    cachedFile[editCache["mil_tech"]] = temp;
    
    //Religion
    temp = countTabs(cachedFile[editCache["religion"]]) + "religion=";
    temp += $("#natRel").val();
    cachedFile[editCache["religion"]] = temp;
    
    //Stability
    temp = countTabs(cachedFile[editCache["stability"]]) + "stability=";
    temp += $("#stab").val();
    cachedFile[editCache["stability"]] = temp;    

    //Prestige
    temp = countTabs(cachedFile[editCache["prestige"]]) + "prestige=";
    temp += $("#prest").val();
    cachedFile[editCache["prestige"]] = temp;
    
    //Teasury
    temp = countTabs(cachedFile[editCache["treasury"]]) + "treasury=";
    temp += $("#treasury").val();
    cachedFile[editCache["treasury"]] = temp;  
    
    //Legitimacy or Republican (Sketchy at best)
    if (editCache["legitimacy"] !== undefined) {     
        temp = countTabs(cachedFile[editCache["legitimacy"]]) + "legitimacy=";
        temp += $("#legit").val();
        cachedFile[editCache["legitimacy"]] = temp;              
    } else {
        temp = countTabs(cachedFile[editCache["republican_tradition"]]) + "republican_tradition=";
        temp += ($("#legit").val()/100).toFixed(2);
        cachedFile[editCache["republican_tradition"]] = temp;                 
    }
    
    //Merc
    temp = countTabs(cachedFile[editCache["mercantilism"]]) + "mercantilism=";
    temp += ($("#merc").val()/100).toFixed(2);
    cachedFile[editCache["mercantilism"]] = temp;  
    
    //Manpower
    temp = countTabs(cachedFile[editCache["manpower"]]) + "manpower=";
    temp += ($("#mpower").val()/1000).toFixed(3);
    cachedFile[editCache["manpower"]] = temp;      
    
    //Technology
    temp = countTabs(cachedFile[editCache["technology_group"]]) + "technology_group=";
    temp += $("#techGrp").val();
    cachedFile[editCache["technology_group"]] = temp;  
    
    //Government (Doesn't commit it yet)
    

    return;
    
}

function findMonarchInfo (country) {
    
    var ID = findMonarchID(country);
    
    //Find out where our nation begins, and set depth appropriately
    var i = nationCache[country] + 2;
    depth = 2;
    
    var temp = new Array ();
    
    //If we hit a depth of 1 we've gone off the end of this country
    while (depth >= 2 && i < cachedFile.length) {
        var res = preParse(cachedFile[i]);
        if (res.indexOf(ID) !== -1 && depth === 6) {
            if (((cachedFile[i-3].trim()).split("="))[1] === "yes") {
                i--;
            }
            
            //Cache all monarch stuff
            editCache["name"] = i - 6;
            editCache["adminSkill"] = i - 4;
            editCache["diploSkill"] = i - 5;
            editCache["milSkill"] = i - 3;
            
            temp.push(((cachedFile[i-6].trim()).split("="))[1]);
            temp.push(((cachedFile[i-4].trim()).split("="))[1]);
            temp.push(((cachedFile[i-5].trim()).split("="))[1]);
            temp.push(((cachedFile[i-3].trim()).split("="))[1]);
            return temp;
        }
        i++;
    }      
     
    return ["N/A", "N/A", "N/A", "N/A"];
    
}

function findMonarchID (country) {
    
    //Find out where our nation begins, and set depth appropriately
    var i = nationCache[country] + 2;
    depth = 2;
    
    //If we hit a depth of 1 we've gone off the end of this country
    while (depth >= 2 && i < cachedFile.length) {
        var res = preParse(cachedFile[i]);
        if (res.indexOf("monarch=") !== -1 && depth === 2) {
            return (preParse(cachedFile[i + 2]).split("="))[1];
        }
        i++;
    }  
    
    return 0;
    
}

function getPower (country) {
    
    
    //Find out where our nation begins, and set depth appropriately
    var i = nationCache[country] + 2;
    depth = 2;
    
    //If we hit a depth of 1 we've gone off the end of this country
    while (depth >= 2 && i < cachedFile.length) {
        var res = preParse(cachedFile[i]);
        if (res.indexOf("powers=") !== -1 && depth === 2) {
            
            //Cache power location
            editCache["power"] = i + 2;
            
            return preParse(cachedFile[i + 2]);
        }
        i++;
    }  
    
    
}

function getTech (country) {
    
    //Find out where our nation begins, and set depth appropriately
    var i = nationCache[country] + 2;
    depth = 2;
    
    //If we hit a depth of 1 we've gone off the end of this country
    while (depth >= 2 && i < cachedFile.length) {
        var res = preParse(cachedFile[i]);
        if (res.indexOf("technology=") !== -1 && depth === 2) {
            
            //Cache the tech location
            editCache["adm_tech"] = i + 2;
            editCache["dip_tech"] = i + 3;
            editCache["mil_tech"] = i + 4;
            
            var temp = new Array();
            temp.push((preParse(cachedFile[i+2]).split("="))[1]);
            temp.push((preParse(cachedFile[i+3]).split("="))[1]);
            temp.push((preParse(cachedFile[i+4]).split("="))[1]);
            return temp;
        }
        i++;
    }  
    
}

/*
 * Options for value:
 * techology_group
 * prestige
 * stability
 * treasury
 * legitimacy
 * mercantilism
 * score
 * manpower
 */
function getFirstLevel (country, value) {
    
    //Find out where our nation begins, and set depth appropriately
    var i = nationCache[country] + 2;
    depth = 2;
    
    //If we hit a depth of 1 we've gone off the end of this country
    while (depth >= 2 && i < cachedFile.length) {
        var res = preParse(cachedFile[i]);
        if (res.indexOf(value) !== -1 && depth === 2) {
            //Cache the location of this result
            editCache[value] = i;
            return (res.split("="))[1];
        }
        i++;
    }
    
    return "N/A";
    
}

function getProvFirstLevel (ID, value) {
    
    //Find out where our province begins, and set depth appropriately
    var i = provinceCache[ID] + 2;
    depth = 2;
    
    //If we hit a depth of 1 we've gone off the end of this country
    while (depth >= 2 && i < cachedFile.length) {
        var res = preParse(cachedFile[i]);
        if (res.indexOf(value) !== -1 && depth === 2) {
            //Cache the location of this result
            PeditCache[value] = i;
            return (res.split("="))[1];
        }
        i++;
    }
    
    return "N/A";
    
}




//Calculate the depth of our parse tree and trim properly
function preParse (unformatted) {
    
    //Purge whitespace and newlines
    var formatted = unformatted.trim();
    
    //Count number of opening brackets and add to depth
    var count = (formatted.match(/{/g) || []).length;
    depth += count;
    
    //Do the same for closing, then subtract
    count = (formatted.match(/}/g) || []).length;
    depth -= count;
    
    //Return our trimmed word for use
    return formatted;
    
}


