document.addEventListener("DOMContentLoaded", function(){

const map = L.map('map').setView([-7.4,111.4],11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const jenis = document.getElementById("jenis");
const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");
const filterKecamatan = document.getElementById("filterKecamatan");
const filterDesa = document.getElementById("filterDesa");
const infoProgram = document.getElementById("infoProgram");

let geoLayer,titikLayer,labelLayer,selectedLayer,dataGeojson;
let dataDesaPerKecamatan={};

function getColor(d){
return d>50?'#084594':
d>30?'#2171b5':
d>20?'#4292c6':
d>10?'#6baed6':
d>0?'#9ecae1':'#f1f1f1';
}

function style(feature){
let field=jenis.value+" "+tahun.value;
let value=feature.properties[field]||0;
return{fillColor:getColor(value),weight:1,color:"#444",fillOpacity:0.7};
}

function highlightLayer(layer){
if(selectedLayer){geoLayer.resetStyle(selectedLayer);}
layer.setStyle({color:"yellow",weight:3,dashArray:"6,6"});
selectedLayer=layer;
}

function updateInfo(){
let thn=tahun.value,jns=jenis.value;
if(jns==="RTLH"){
infoProgram.innerHTML=thn==="2023"?
"<b>RTLH 2023</b><br>DPMD Kabupaten Ngawi<br><i>Dana Desa</i>":
"<b>RTLH "+thn+"</b><br>Disperkim Kabupaten Ngawi";
}else{
infoProgram.innerHTML="<b>BSPS "+thn+"</b><br>BP3KP Jawa IV<br>Kementerian PKP";
}
}

function updateLegend(){
let grades=[0,10,20,30,50],html="<b>Jumlah Unit</b><br>";
grades.forEach((g,i)=>{
html+='<i style="background:'+getColor(g+1)+'"></i>'+g+(grades[i+1]?'–'+grades[i+1]+'<br>':'+');
});
document.getElementById("legend").innerHTML=html;
}

function updateStatistik(){
let field=jenis.value+" "+tahun.value,total=0;
dataGeojson.features.forEach(f=>total+=f.properties[field]||0);
document.getElementById("statistik").innerHTML="<b>Total "+jenis.value+" "+tahun.value+"</b><br>"+total+" Unit";
}

function getRadius(j){return Math.sqrt(j)*2;}

function updateTitik(){
if(titikLayer)map.removeLayer(titikLayer);
titikLayer=L.layerGroup();
let field=jenis.value+" "+tahun.value;
dataGeojson.features.forEach(f=>{
let jumlah=f.properties[field]||0;
let center=L.geoJSON(f).getBounds().getCenter();
titikLayer.addLayer(L.circleMarker(center,{
radius:getRadius(jumlah),
fillColor:jenis.value==="RTLH"?"green":"blue",
color:"#fff",weight:1,fillOpacity:0.9
}));
});
titikLayer.addTo(map);
}

function updateLabel(){
if(labelLayer)map.removeLayer(labelLayer);
labelLayer=L.layerGroup();
if(map.getZoom()>=13){
let field=jenis.value+" "+tahun.value;
geoLayer.eachLayer(l=>{
let center=l.getBounds().getCenter();
let jumlah=l.feature.properties[field]||0;
labelLayer.addLayer(L.marker(center,{icon:L.divIcon({className:"label-jumlah",html:jumlah})}));
});
}
labelLayer.addTo(map);
}

fetch("data-bsps-rtlh.geojson")
.then(res=>res.json())
.then(data=>{
dataGeojson=data;

geoLayer=L.geoJSON(data,{
style:style,
onEachFeature:(feature,layer)=>{

let kec=feature.properties.KECAMATAN;
let desa=feature.properties.DESA;

if(!dataDesaPerKecamatan[kec]){
dataDesaPerKecamatan[kec]=[];
filterKecamatan.innerHTML+=`<option value="${kec}">${kec}</option>`;
}
dataDesaPerKecamatan[kec].push(desa);

layer.on("click",()=>{
highlightLayer(layer);
map.flyToBounds(layer.getBounds(),{duration:0.8});
});

}
}).addTo(map);

map.fitBounds(geoLayer.getBounds());
updateTitik();
updateLegend();
updateStatistik();
updateInfo();
});

map.on("zoomend",()=>updateLabel());

jenis.onchange=()=>{geoLayer.setStyle(style);updateTitik();updateLegend();updateStatistik();updateInfo();}
tahun.oninput=()=>{labelTahun.innerHTML=tahun.value;geoLayer.setStyle(style);updateTitik();updateLegend();updateStatistik();updateInfo();}

filterKecamatan.onchange=function(){
filterDesa.innerHTML='<option value="">Pilih Desa</option>';
dataDesaPerKecamatan[this.value].forEach(d=>filterDesa.innerHTML+=`<option value="${d}">${d}</option>`);
let layers=[];
geoLayer.eachLayer(l=>{if(l.feature.properties.KECAMATAN===this.value)layers.push(l);});
map.flyToBounds(L.featureGroup(layers).getBounds(),{duration:0.8});
}

filterDesa.onchange=function(){
geoLayer.eachLayer(l=>{
if(l.feature.properties.DESA===this.value){
highlightLayer(l);
map.flyToBounds(l.getBounds(),{duration:0.8});
}
});
}

});
