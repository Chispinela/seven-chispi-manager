const path=require('node:path');
module.exports=async function(context){
 const {rcedit}=await import('rcedit');
 await rcedit(path.join(context.appOutDir,'Seven Chispi Manager.exe'),{
  icon:path.join(context.packager.projectDir,'assets/icon.ico'),
  'version-string':{ProductName:'Seven Chispi Manager',FileDescription:'Seven Chispi Manager',CompanyName:'Chispi',OriginalFilename:'Seven Chispi Manager.exe'},
  'file-version':context.packager.appInfo.version,
  'product-version':context.packager.appInfo.version,
  'requested-execution-level':'asInvoker'
 });
};
