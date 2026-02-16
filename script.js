document.addEventListener("DOMContentLoaded", function () {

const FIELD_KEC = "KECAMATAN";
const FIELD_DESA = "DESA";

const map = L.map("map");
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const jenis = document.getElementById("jenis");
const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");
const prev = document.getElementById("prevTahun");
const next = document.getElementById("nextTahun");
const kecSelect = document.getElementById("kecamatan");
const desaSelect = document.getElementById("desa");

labelTahun.textContent = tahun.value;

let geoLayer, geoData;

/* AMBIL NILAI DINAMIS */
function getValue(props){
let prefix = jenis.value;
let f1 = prefix+" "+tahun.value;
let f2 = prefix+"_"+tahun.value;
return props[f1] ?? props[f2] ?? 0;
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
fillColor:getColor(getValue(feature.properties)),
weight:1,
color:"#666",
fillOpacity:0.7
};
}

function highlight(layer){
layer.setStyle({
color:"red",
weight:3,
dashArray:"5,5"
});
}

/* LOAD GEOJSON */
fetch("./data-bsps-rtlh.geojson")
.then(res=>res.json())
.then(data=>{

geoData = data;

geoLayer = L.geoJSON(data,{
style:style,
onEachFeature:(feature,layer)=>{
layer.bindPopup(`
<b>Desa:</b> ${feature.properties[FIELD_DESA]}<br>
<b>Kecamatan:</b> ${feature.properties[FIELD_KEC]}<br>
<b>Jumlah:</b> ${getValue(feature.properties)}
`);
}
}).addTo(map);

map.fitBounds(geoLayer.getBounds());

isiKecamatan();
});

/* DROPDOWN KECAMATAN */
function isiKecamatan(){
let kecamatan = [...new Set(geoData.features.map(f=>f.properties[FIELD_KEC]))].sort();
kecamatan.forEach(k=>{
kecSelect.innerHTML += `<option value="${k}">${k}</option>`;
});
}

/* FILTER KECAMATAN */
kecSelect.onchange=function(){

desaSelect.innerHTML=`<option value="">Semua Desa</option>`;
geoLayer.resetStyle();

if(!this.value){
map.fitBounds(geoLayer.getBounds());
return;
}

let filtered = geoData.features.filter(f=>f.properties[FIELD_KEC]==this.value);
map.fitBounds(L.geoJSON(filtered).getBounds());

geoLayer.eachLayer(layer=>{
if(layer.feature.properties[FIELD_KEC]==this.value) highlight(layer);
});

let desaList = [...new Set(filtered.map(f=>f.properties[FIELD_DESA]))].sort();
desaList.forEach(d=>{
desaSelect.innerHTML += `<option value="${d}">${d}</option>`;
});
};

/* FILTER DESA */
desaSelect.onchange=function(){
geoLayer.resetStyle();
geoLayer.eachLayer(layer=>{
if(layer.feature.properties[FIELD_DESA]==this.value){
highlight(layer);
map.fitBounds(layer.getBounds());
}
});
};

/* UPDATE TAHUN / JENIS */
function updateMap(){

if(!geoLayer) return;

labelTahun.textContent = tahun.value;

geoLayer.setStyle(style);

geoLayer.eachLayer(layer=>{
layer.setPopupContent(`
<b>Desa:</b> ${layer.feature.properties[FIELD_DESA]}<br>
<b>Kecamatan:</b> ${layer.feature.properties[FIELD_KEC]}<br>
<b>Jumlah:</b> ${getValue(layer.feature.properties)}
`);
});
}

/* EVENT */
tahun.addEventListener("input", updateMap);
jenis.addEventListener("change", updateMap);

prev.onclick=()=>{tahun.stepDown();updateMap();}
next.onclick=()=>{tahun.stepUp();updateMap();}

});
