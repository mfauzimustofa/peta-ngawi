document.addEventListener("DOMContentLoaded", function(){

const map = L.map('map').setView([-7.4,111.4],11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
map.zoomControl.setPosition('topleft');

const jenis = document.getElementById("jenis");
const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");
const filterKecamatan = document.getElementById("filterKecamatan");
const filterDesa = document.getElementById("filterDesa");
const infoProgram = document.getElementById("infoProgram");

let geoLayer, titikLayer, dataGeojson;
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

return{
fillColor:getColor(value),
weight:1,
color:"#444",
fillOpacity:0.7
};
}

fetch("./data-bsps-rtlh.geojson")
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
filterKecamatan.innerHTML+=`<option>${kec}</option>`;
}

dataDesaPerKecamatan[kec].push(desa);

layer.on("click",()=>{
map.fitBounds(layer.getBounds());
});

}
}).addTo(map);

map.fitBounds(geoLayer.getBounds());
updateTitik();

});

function getRadius(j){return Math.sqrt(j)*2;}

function updateTitik(){

if(titikLayer)map.removeLayer(titikLayer);
titikLayer=L.layerGroup();

let field=jenis.value+" "+tahun.value;

dataGeojson.features.forEach(f=>{

let jumlah=f.properties[field]||0;
let center=L.geoJSON(f).getBounds().getCenter();

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

jenis.onchange=()=>{geoLayer.setStyle(style);updateTitik();}
tahun.oninput=()=>{labelTahun.innerHTML=tahun.value;geoLayer.setStyle(style);updateTitik();}

});
