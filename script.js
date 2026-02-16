let selectedTahun = 2025;

const slider = document.getElementById("tahunSlider");
const tahunLabel = document.getElementById("tahunLabel");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const MIN_TAHUN = parseInt(slider.min);
const MAX_TAHUN = parseInt(slider.max);


// ⬅️ tombol kiri
prevBtn.onclick = function(){

  if(selectedTahun > MIN_TAHUN){

    selectedTahun--;
    updateTahun();

  }

};


// ➡️ tombol kanan
nextBtn.onclick = function(){

  if(selectedTahun < MAX_TAHUN){

    selectedTahun++;
    updateTahun();

  }

};


// 🎚️ slider digeser
slider.oninput = function(){

  selectedTahun = parseInt(this.value);
  updateTahunLabel();

};


// 🔄 update tampilan
function updateTahun(){

  slider.value = selectedTahun;
  updateTahunLabel();

}


// update teks tahun
function updateTahunLabel(){

  tahunLabel.textContent = selectedTahun;

}
