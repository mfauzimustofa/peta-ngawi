document.addEventListener("DOMContentLoaded", function () {

const FIELD_KEC = "KECAMATAN";
const FIELD_DESA = "DESA";

const map = L.map("map");
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");
const kecSelect = document.getElementById("kecamatan");
const desaSelect = document.getElementById("desa");

labelTahun.innerHTML = tahun.value;

let geoLayer, geoData;

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
<b>Jumlah:</b> ${feature.properties["RTLH "+tahun.value] || 0}
`);

}
}).addTo(map);

map.fitBounds(geoLayer.getBounds());

isiKecamatan();

});

/* ISI KECAMATAN */
function isiKecamatan(){

let kecamatan = [...new Set(
geoData.features.map(f=>f.properties[FIELD_KEC])
)].sort();

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

let filtered = geoData.features.filter(
f=>f.properties[FIELD_KEC]==this.value
);

map.fitBounds(L.geoJSON(filtered).getBounds());

geoLayer.eachLayer(layer=>{
if(layer.feature.properties[FIELD_KEC]==this.value){
highlight(layer);
}
});

let desaList = [...new Set(
filtered.map(f=>f.properties[FIELD_DESA])
)].sort();

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

/* TAHUN */
tahun.oninput=function(){

labelTahun.innerHTML=tahun.value;

geoLayer.setStyle(style);

};

});
