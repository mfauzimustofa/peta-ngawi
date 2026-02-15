document.addEventListener("DOMContentLoaded", function () {

const map = L.map("map");

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
attribution:"© OpenStreetMap"
}).addTo(map);

const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");
const kecSelect = document.getElementById("kecamatan");
const desaSelect = document.getElementById("desa");
const prev = document.getElementById("prevTahun");
const next = document.getElementById("nextTahun");

labelTahun.innerHTML = tahun.value;

let geoLayer;
let geoData;

/* WARNA */
function getColor(d){
return d>50?'#084594':
d>30?'#2171b5':
d>20?'#4292c6':
d>10?'#6baed6':
d>0?'#9ecae1':'#f1f1f1';
}

function style(feature){
let value = feature.properties["RTLH " + tahun.value] || 0;

return{
fillColor:getColor(value),
weight:1,
color:"#666",
fillOpacity:0.7
};
}

/* HIGHLIGHT */
function highlight(layer){
layer.setStyle({
color:"red",
weight:3,
dashArray:"5,5",
fillOpacity:0.9
});
}

/* LOAD GEOJSON */
fetch("./data-bsps-rtlh.geojson")
.then(res=>res.json())
.then(data=>{

geoData = data;

geoLayer = L.geoJSON(geoData,{
style:style,
onEachFeature:(feature,layer)=>{

layer.bindPopup(
"<b>Desa:</b> "+feature.properties.WADMKD+
"<br><b>Kecamatan:</b> "+feature.properties.WADMKC+
"<br><b>Jumlah:</b> "+(feature.properties["RTLH "+tahun.value]||0)
);

}
}).addTo(map);

map.fitBounds(geoLayer.getBounds());

isiDropdown();

});

/* DROPDOWN KECAMATAN */
function isiDropdown(){

let kecamatan = [...new Set(geoData.features.map(f=>f.properties.WADMKC))].sort();

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

let filtered = geoData.features.filter(f=>f.properties.WADMKC==this.value);

let bounds = L.geoJSON(filtered).getBounds();
map.fitBounds(bounds);

geoLayer.eachLayer(layer=>{
if(layer.feature.properties.WADMKC==this.value){
highlight(layer);
}
});

/* ISI DESA */
let desaList = [...new Set(filtered.map(f=>f.properties.WADMKD))].sort();

desaList.forEach(d=>{
desaSelect.innerHTML += `<option value="${d}">${d}</option>`;
});

};

/* FILTER DESA */
desaSelect.onchange=function(){

geoLayer.resetStyle();

geoLayer.eachLayer(layer=>{
if(layer.feature.properties.WADMKD==this.value){
highlight(layer);
map.fitBounds(layer.getBounds());
}
});

};

/* TAHUN */
tahun.oninput=function(){

labelTahun.innerHTML=tahun.value;

geoLayer.setStyle(style);

geoLayer.eachLayer(layer=>{
layer.setPopupContent(
"<b>Desa:</b> "+layer.feature.properties.WADMKD+
"<br><b>Kecamatan:</b> "+layer.feature.properties.WADMKC+
"<br><b>Jumlah:</b> "+(layer.feature.properties["RTLH "+tahun.value]||0)
);
});

};

/* TOMBOL TAHUN */
prev.onclick=()=>{tahun.stepDown();tahun.oninput();}
next.onclick=()=>{tahun.stepUp();tahun.oninput();}

});
