<?php 


   $res = $_POST["saveString"];
   $zipInMem = base64_decode($res);
  
   $file = tempnam("tmp", "zip"); 
   file_put_contents ($file, $zipInMem);
  
   $zip = zip_open($file);
  
   $zip_entry = zip_read($zip);
  
   zip_entry_open($zip, $zip_entry);
  
   $contents = utf8_decode(zip_entry_read($zip_entry, zip_entry_filesize($zip_entry)));
  
   $zip = new ZipArchive();
   $zip->open($file, ZipArchive::OVERWRITE);
  
   $zip->addFromString('genFile.eu4', $contents);
   $zip->close();
  
   header('Content-Type: application/zip');
   header('Content-Disposition: attachment; filename="genSave.zip"');
   header("Content-Length: " . filesize($file));

   readfile($file);
    
   unlink($file);
  
?>