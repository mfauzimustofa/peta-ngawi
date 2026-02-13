document.addEventListener("DOMContentLoaded", function(){

const map = L.map('map').setView([-7.4,111.4],11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const jenis = document.getElementById("jenis");
const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");
const filterKecamatan = document.getElementById("filterKecamatan");
const filterDesa = document.getElementById("filterDesa");

let geoLayer,dataGeojson;
let dataDesaPerKecamatan={};
let highlightedLayers=[];

/* RESET HIGHLIGHT */
function resetHighlight(){
highlightedLayers.forEach(l=>geoLayer.resetStyle(l));
highlightedLayers=[];
}

/* HIGHLIGHT KUNING */
function highlight(layer){
layer.setStyle({
color:"yellow",
weight:3,
dashArray:"6,6",
fillOpacity:0.9
});
highlightedLayers.push(layer);
}

/* STYLE */
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

/* LOAD GEOJSON */
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

/* KLIK MANUAL DESA */
layer.on("click",()=>{
resetHighlight();
highlight(layer);
map.flyToBounds(layer.getBounds(),{duration:0.7});
});

}
}).addTo(map);

map.fitBounds(geoLayer.getBounds());

});

/* DROPDOWN KECAMATAN */
filterKecamatan.onchange=function(){

resetHighlight();

filterDesa.innerHTML='<option value="">Pilih Desa</option>';

geoLayer.eachLayer(l=>{

if(l.feature.properties.KECAMATAN===this.value){

highlight(l);

dataDesaPerKecamatan[this.value].forEach(d=>{
filterDesa.innerHTML+=`<option value="${d}">${d}</option>`;
});

}

});

let layers=highlightedLayers;
map.flyToBounds(L.featureGroup(layers).getBounds(),{duration:0.7});

};

/* DROPDOWN DESA */
filterDesa.onchange=function(){

resetHighlight();

geoLayer.eachLayer(l=>{

if(l.feature.properties.DESA===this.value){

highlight(l);
map.flyToBounds(l.getBounds(),{duration:0.7});

}

});

};

/* UPDATE STYLE SAAT FILTER */
jenis.onchange=()=>geoLayer.setStyle(style);
tahun.oninput=()=>{
labelTahun.innerHTML=tahun.value;
geoLayer.setStyle(style);
};

});
