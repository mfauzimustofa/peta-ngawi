document.addEventListener("DOMContentLoaded", function () {

const FIELD_KEC="KECAMATAN";
const FIELD_DESA="DESA";

const map=L.map("map");
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const jenis=document.getElementById("jenis");
const tahun=document.getElementById("tahun");
const labelTahun=document.getElementById("labelTahun");
const kecSelect=document.getElementById("kecamatan");
const desaSelect=document.getElementById("desa");
const prev=document.getElementById("prevTahun");
const next=document.getElementById("nextTahun");
const infoTotal=document.getElementById("infoTotal");

labelTahun.textContent=tahun.value;

let geoData,geoLayer;

/* AMBIL NILAI */
function getValue(props,prefix){
let f1=prefix+" "+tahun.value;
let f2=prefix+"_"+tahun.value;
return props[f1]??props[f2]??0;
}

/* WARNA */
function getColor(d){
return d>50?'#084594':
d>30?'#2171b5':
d>20?'#4292c6':
d>10?'#6baed6':
d>0?'#9ecae1':'#f1f1f1';
}

function style(feature){
return{
fillColor:getColor(getValue(feature.properties,jenis.value)),
weight:1,
color:"#666",
fillOpacity:0.7
};
}

function highlight(layer){
layer.setStyle({color:"red",weight:3,dashArray:"5,5"});
}

/* HITUNG TOTAL */
function hitungTotal(features){

let rtlh=0,bsps=0;

features.forEach(f=>{
rtlh+=getValue(f.properties,"RTLH");
bsps+=getValue(f.properties,"BSPS");
});

infoTotal.innerHTML=
`RTLH: ${rtlh.toLocaleString()} | BSPS: ${bsps.toLocaleString()}`;
}

/* LOAD DATA */
fetch("./data-bsps-rtlh.geojson")
.then(res=>res.json())
.then(data=>{

geoData=data;

geoLayer=L.geoJSON(data,{
style:style,
onEachFeature:(f,l)=>{
l.bindPopup(`
<b>Desa:</b> ${f.properties[FIELD_DESA]}<br>
<b>Kecamatan:</b> ${f.properties[FIELD_KEC]}<br>
<b>Jumlah:</b> ${getValue(f.properties,jenis.value)}
`);
}
}).addTo(map);

map.fitBounds(geoLayer.getBounds());

isiKecamatan();
hitungTotal(geoData.features);

});

/* ISI KECAMATAN */
function isiKecamatan(){
let kec=[...new Set(geoData.features.map(f=>f.properties[FIELD_KEC]))].sort();
kec.forEach(k=>kecSelect.innerHTML+=`<option value="${k}">${k}</option>`);
}

/* FILTER KEC */
kecSelect.onchange=function(){

desaSelect.innerHTML=`<option value="">Semua Desa</option>`;
geoLayer.resetStyle();

if(!this.value){
map.fitBounds(geoLayer.getBounds());
hitungTotal(geoData.features);
return;
}

let filtered=geoData.features.filter(f=>f.properties[FIELD_KEC]==this.value);

map.fitBounds(L.geoJSON(filtered).getBounds());
hitungTotal(filtered);

geoLayer.eachLayer(l=>{
if(l.feature.properties[FIELD_KEC]==this.value)highlight(l);
});

let desa=[...new Set(filtered.map(f=>f.properties[FIELD_DESA]))].sort();
desa.forEach(d=>desaSelect.innerHTML+=`<option value="${d}">${d}</option>`);

};

/* FILTER DESA */
desaSelect.onchange=function(){

geoLayer.resetStyle();

let filtered=geoData.features.filter(f=>f.properties[FIELD_DESA]==this.value);

hitungTotal(filtered);

geoLayer.eachLayer(l=>{
if(l.feature.properties[FIELD_DESA]==this.value){
highlight(l);
map.fitBounds(l.getBounds());
}
});

};

/* UPDATE MAP */
function updateMap(){

if(!geoLayer)return;

labelTahun.textContent=tahun.value;

geoLayer.setStyle(style);

geoLayer.eachLayer(l=>{
l.setPopupContent(`
<b>Desa:</b> ${l.feature.properties[FIELD_DESA]}<br>
<b>Kecamatan:</b> ${l.feature.properties[FIELD_KEC]}<br>
<b>Jumlah:</b> ${getValue(l.feature.properties,jenis.value)}
`);
});

if(desaSelect.value){
desaSelect.onchange();
}
else if(kecSelect.value){
kecSelect.onchange();
}
else{
hitungTotal(geoData.features);
}

}

/* EVENT */
tahun.oninput=updateMap;
jenis.onchange=updateMap;

prev.onclick=()=>{tahun.stepDown();updateMap();}
next.onclick=()=>{tahun.stepUp();updateMap();}

});
