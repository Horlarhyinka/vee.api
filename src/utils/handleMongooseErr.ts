export default (ex:any)=>{
    console.log(ex.code)
    if(ex.code == 11000)return "resource already existed";
    if(ex._message?.toLowerCase().includes("validation failed")){
   return Object.keys(ex.errors).map((k)=>{
        return ex.errors[k].properties.message
    }).join("\n")
    }
    return false;
}