document.addEventListener("DOMContentLoaded", function(){

const map = L.map('map').setView([-7.4,111.4],11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:'&copy; OpenStreetMap'
}).addTo(map);

const jenis = document.getElementById("jenis");
const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");
const filterKecamatan = document.getElementById("filterKecamatan");
const filterDesa = document.getElementById("filterDesa");

let geoLayer,titikLayer,selectedLayer,dataGeojson;
let dataDesaPerKecamatan={};

labelTahun.innerHTML = tahun.value;

/* ================= WARNA CHOROPLETH ================= */
function getColor(d){
return d>50?'#084594':
d>30?'#2171b5':
d>20?'#4292c6':
d>10?'#6baed6':
d>0?'#9ecae1':'#f1f1f1';
}

/* ================= STYLE POLYGON ================= */
function style(feature){
let field = jenis.value+" "+tahun.value;
let value = feature.properties[field] || 0;

return{
fillColor:getColor(value),
weight:1,
color:"#444",
fillOpacity:0.7
};
}

/* ================= POPUP ================= */
function popupContent(feature){

let thn = tahun.value;

let rtlh = feature.properties["RTLH "+thn] || 0;
let bsps = feature.properties["BSPS "+thn] || 0;

return `
<div style="font-size:13px">
<b style="font-size:14px">${feature.properties.DESA}</b><br>
Kecamatan ${feature.properties.KECAMATAN}
<hr style="margin:6px 0">

<table>
<tr><td>RTLH ${thn}</td><td><b>${rtlh}</b> unit</td></tr>
<tr><td>BSPS ${thn}</td><td><b>${bsps}</b> unit</td></tr>
</table>
</div>
`;
}

/* ================= INFO PROGRAM ================= */
function updateInfo(){

let thn = tahun.value;
let jns = jenis.value;

document.getElementById("infoProgram").innerHTML =
jns==="RTLH"
? (thn==="2023"
? `<b>RTLH 2023</b><br>Dinas Pemberdayaan Masyarakat dan Desa Kabupaten Ngawi`
: `<b>RTLH ${thn}</b><br>Dinas Perumahan Rakyat dan Kawasan Permukiman Kabupaten Ngawi`)
: `<b>BSPS ${thn}</b><br>Balai Pelaksana Penyediaan Perumahan dan Kawasan Permukiman Jawa IV<br>Kementerian PKP`;

}

/* ================= STATISTIK ================= */
function updateStatistik(){

let total=0;
let field=jenis.value+" "+tahun.value;

dataGeojson.features.forEach(f=>{
total += f.properties[field] || 0;
});

document.getElementById("statistik").innerHTML =
`<b>Total ${jenis.value} ${tahun.value}</b><br>${total} Unit`;

}

/* ================= LEGEND ================= */
function updateLegend(){

let grades=[0,10,20,30,50];
let html="<b>Jumlah Unit</b><br>";

grades.forEach((g,i)=>{
html+=`<i style="background:${getColor(g+1)}"></i>${g}${
grades[i+1]?'–'+grades[i+1]+'<br>':'+'
}`;
});

document.getElementById("legend").innerHTML = html;

}

/* ================= TITIK PROPORSIONAL ================= */
function getRadius(j){return Math.sqrt(j)*2;}

function updateTitik(){

if(titikLayer) map.removeLayer(titikLayer);

titikLayer = L.layerGroup();

let field = jenis.value+" "+tahun.value;

dataGeojson.features.forEach(f=>{

let jumlah = f.properties[field] || 0;

let center = L.geoJSON(f).getBounds().getCenter();

titikLayer.addLayer(
L.circleMarker(center,{
radius:getRadius(jumlah),
fillColor:jenis.value==="RTLH"?"green":"blue",
color:"#fff",
weight:1,
fillOpacity:0.9
})
);

});

titikLayer.addTo(map);

}

/* ================= LOAD GEOJSON ================= */
fetch("data-bsps-rtlh.geojson")
.then(res=>res.json())
.then(data=>{

dataGeojson = data;

geoLayer = L.geoJSON(data,{

style:style,

onEachFeature:(feature,layer)=>{

let kec = feature.properties.KECAMATAN;
let desa = feature.properties.DESA;

/* ISI DROPDOWN */
if(!dataDesaPerKecamatan[kec]){
dataDesaPerKecamatan[kec]=[];
filterKecamatan.innerHTML += `<option value="${kec}">${kec}</option>`;
}

dataDesaPerKecamatan[kec].push(desa);

/* EVENT KLIK */
layer.on("click",function(){

layer.bindPopup(popupContent(feature)).openPopup();

map.flyToBounds(layer.getBounds(),{duration:0.7});

});

}

}).addTo(map);

map.fitBounds(geoLayer.getBounds());

updateTitik();
updateLegend();
updateStatistik();
updateInfo();

});

/* ================= EVENT FILTER ================= */

jenis.onchange = function(){
geoLayer.setStyle(style);
updateTitik();
updateLegend();
updateStatistik();
updateInfo();
};

tahun.oninput = function(){
labelTahun.innerHTML = tahun.value;
geoLayer.setStyle(style);
updateTitik();
updateLegend();
updateStatistik();
updateInfo();
};

/* ================= DROPDOWN KECAMATAN ================= */

filterKecamatan.onchange = function(){

filterDesa.innerHTML = '<option value="">Pilih Desa</option>';

dataDesaPerKecamatan[this.value].forEach(d=>{
filterDesa.innerHTML += `<option value="${d}">${d}</option>`;
});

let layers=[];

geoLayer.eachLayer(l=>{
if(l.feature.properties.KECAMATAN===this.value){
layers.push(l);
}
});

map.flyToBounds(L.featureGroup(layers).getBounds(),{duration:0.7});

};

/* ================= DROPDOWN DESA ================= */

filterDesa.onchange = function(){

geoLayer.eachLayer(l=>{

if(l.feature.properties.DESA===this.value){

l.bindPopup(popupContent(l.feature)).openPopup();

map.flyToBounds(l.getBounds(),{duration:0.7});

}

});

};

});
