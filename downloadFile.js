
//Generate a savefile from our changes
function generateSave() {
    
    var result = "";
    var i;
    
    //alert("Compressing and preparing file. This WILL take time, do not refresh.");
    
    
    //Okay, we need to go through our cached file and concatenate the lines
    for (i = 0; i < cachedFile.length; i++) {
        result += cachedFile[i] + "\n"; //Can't forget the newline      
    }
    

    var enc = new string_transcoder("windows-1252");
    var tenc = enc.transcode(result);
    
    var data = btoa(JSZip.utils.uint8Array2String(tenc));
    
    return data;
       
    //var res = (new TextDecoder("iso-8859-1")).decode(new Uint8Array(bytes));
    

   
   //return tempRes;
   //return console.log((Base64["encode"])(tenc));
    
    //$("#saveInputStringN").val(res);
    //$("#saveInputStringP").val(res);
    
   
}



function prepareDownload() {
    
    if (nationChange === true || provinceChange === true) {  
        generateSave();
    } else {
        generateSave();
    }
    
}


//Set up downloadify
function prepareDownloadify() {
    
    
    Downloadify.create('downloadify', {
        filename: function() {
            return $("#NName").val() + ".eu4";
        },
        data: function() {
            return generateSave();
        },
        onComplete: function(){},
        onCancel: function() {},
        onError: function() {alert("Something went horribly wrong. Sorry!");},
        swf: 'downloadify/media/downloadify.swf',
        downloadImage: 'downloadify/images/download2.png',
        width: 168,
        height: 30,
        transparent: true,
        dataType: 'base64',
        append: false
    });
    
    Downloadify.create('downloadify2', {
        filename: function() {
            return $("#PName").val() + ".eu4";
        },
        data: function() {
            return generateSave();
        },
        onComplete: function(){},
        onCancel: function() {},
        onError: function() {alert("Something went horribly wrong. Sorry!");},
        swf: 'downloadify/media/downloadify.swf',
        downloadImage: 'downloadify/images/download2.png',
        width: 168,
        height: 30,
        transparent: true,
        dataType: 'base64',
        append: false
    });
    
}
