let pesananList = [];
let editIndex = -1;

const ticketForm = document.getElementById('ticketForm');
const jenisTiketSelect = document.getElementById('jenisTiket');
const jumlahInput = document.getElementById('jumlah');
const tanggalKonserSelect = document.getElementById('tanggalKonser');
const hargaPerTiketSpan = document.getElementById('hargaPerTiket');
const totalPembayaranSpan = document.getElementById('totalPembayaran');
const daftarBeliUl = document.getElementById('daftarBeli');
const modalKonfirmasi = document.getElementById('modalKonfirmasi');
const konfirmasiData = document.getElementById('konfirmasiData');
const konfirmasiBtn = document.getElementById('konfirmasiBtn');
const batalBtn = document.getElementById('batalBtn');
const buktiPembayaran = document.getElementById('buktiPembayaran');
const buktiIsi = document.getElementById('buktiIsi');
const kembaliBtn = document.getElementById('kembaliBtn');
const editInfo = document.getElementById('editInfo');

document.addEventListener('DOMContentLoaded', function() {
  updateHargaDisplay();
  loadPesananFromStorage();
  tampilkanDaftarPemesanan();
});

jenisTiketSelect.addEventListener('change', updateHargaDisplay);
jumlahInput.addEventListener('input', updateHargaDisplay);
tanggalKonserSelect.addEventListener('change', updateHargaDisplay);

ticketForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const nama = document.getElementById('nama').value;
  const email = document.getElementById('email').value;
  const hp = document.getElementById('hp').value;
  const jenisTiket = jenisTiketSelect.value;
  const jumlah = parseInt(jumlahInput.value);
  const pembayaran = document.getElementById('pembayaran').value;
  const tanggalKonser = tanggalKonserSelect.value;
  const tanggalPemesanan = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const harga = jenisTiket === 'VIP' ? 1000000 : 500000;
  const total = harga * jumlah;

  if (!validateTicketAvailability(jenisTiket, jumlah)) {
    alert(`Maaf, tiket ${jenisTiket} tidak mencukupi. Silakan kurangi jumlah atau pilih jenis lain.`);
    return;
  }

  showKonfirmasiModal({
    nama, email, hp, jenisTiket, jumlah, pembayaran, 
    tanggalKonser, tanggalPemesanan, total
  });
});

konfirmasiBtn.addEventListener('click', function() {
  processPembelian();
  modalKonfirmasi.classList.add('hidden');
});

batalBtn.addEventListener('click', function() {
  modalKonfirmasi.classList.add('hidden');
});

kembaliBtn.addEventListener('click', function() {
  buktiPembayaran.classList.add('hidden');
  ticketForm.reset();
  updateHargaDisplay();
});

function updateHargaDisplay() {
  const jenisTiket = jenisTiketSelect.value;
  const jumlah = parseInt(jumlahInput.value) || 0;
  const harga = jenisTiket === 'VIP' ? 1000000 : 500000;
  
  hargaPerTiketSpan.textContent = `Rp ${harga.toLocaleString('id-ID')}`;
  totalPembayaranSpan.textContent = `Rp ${(harga * jumlah).toLocaleString('id-ID')}`;
}

function validateTicketAvailability(jenisTiket, jumlah) {
  const tersediaElement = jenisTiket === 'VIP' ? 
    document.getElementById('vipTersedia') : 
    document.getElementById('regTersedia');

  const tersedia = parseInt(tersediaElement.textContent);
  return jumlah <= tersedia;
}

function showKonfirmasiModal(data) {
  konfirmasiData.innerHTML = `
    <div class="confirm-detail">
      <h3>Detail Pemesanan</h3>
      <p><strong>Nama:</strong> ${data.nama}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>No HP:</strong> ${data.hp}</p>
      <p><strong>Jenis Tiket:</strong> ${data.jenisTiket}</p>
      <p><strong>Jumlah:</strong> ${data.jumlah}</p>
      <p><strong>Tanggal Konser:</strong> ${formatTanggal(data.tanggalKonser)}</p>
      <p><strong>Tanggal Pemesanan:</strong> ${data.tanggalPemesanan}</p>
      <p><strong>Total Pembayaran:</strong> Rp ${data.total.toLocaleString('id-ID')}</p>
      <p><strong>Metode Pembayaran:</strong> ${data.pembayaran}</p>
    </div>
    <p class="confirm-warning">Pastikan data sudah benar sebelum konfirmasi.</p>
  `;
  
  modalKonfirmasi.classList.remove('hidden');
}

function formatTanggal(tanggalString) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(tanggalString).toLocaleDateString('id-ID', options);
}

function processPembelian() {
  const nama = document.getElementById('nama').value;
  const email = document.getElementById('email').value;
  const hp = document.getElementById('hp').value;
  const jenisTiket = jenisTiketSelect.value;
  const jumlah = parseInt(jumlahInput.value);
  const pembayaran = document.getElementById('pembayaran').value;
  const tanggalKonser = tanggalKonserSelect.value;
  const tanggalPemesanan = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const harga = jenisTiket === 'VIP' ? 1000000 : 500000;
  const total = harga * jumlah;
  
  const data = {
    nama, email, hp, jenisTiket, jumlah, pembayaran, 
    tanggalKonser, tanggalPemesanan, total
  };
  
  if (editIndex === -1) {
    pesananList.push(data);
    updateTicketAvailability(jenisTiket, jumlah, 'reduce');
  } else {
    const oldJenisTiket = pesananList[editIndex].jenisTiket;
    const oldJumlah = pesananList[editIndex].jumlah;

    updateTicketAvailability(oldJenisTiket, oldJumlah, 'increase');
    updateTicketAvailability(jenisTiket, jumlah, 'reduce');

    pesananList[editIndex] = data;
    editIndex = -1;
    editInfo.classList.add('hidden');
  }
  
  savePesananToStorage();
  tampilkanDaftarPemesanan();
  showBukti(data);

  ticketForm.reset();
  updateHargaDisplay();
}

function updateTicketAvailability(jenisTiket, jumlah, operation) {
  const tersediaElement = jenisTiket === 'VIP' ? 
    document.getElementById('vipTersedia') : 
    document.getElementById('regTersedia');
  
  const terjualElement = jenisTiket === 'VIP' ? 
    document.getElementById('vipTerjual') : 
    document.getElementById('regTerjual');
  
  let tersedia = parseInt(tersediaElement.textContent);
  let terjual = parseInt(terjualElement.textContent);
  
  if (operation === 'reduce') {
    tersedia -= jumlah;
    terjual += jumlah;
  } else {
    tersedia += jumlah;
    terjual -= jumlah;
  }
  
  tersediaElement.textContent = tersedia;
  terjualElement.textContent = terjual;
}

function tampilkanDaftarPemesanan() {
  daftarBeliUl.innerHTML = '';
  
  pesananList.forEach((pesanan, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${pesanan.nama}</strong> 
      <p>${pesanan.jenisTiket} (${pesanan.jumlah} tiket)</p>
      <p>Tanggal: ${formatTanggal(pesanan.tanggalKonser)}</p>
      <p>Pemesanan: ${pesanan.tanggalPemesanan}</p>
      <p>Total: Rp ${pesanan.total.toLocaleString('id-ID')}</p>
      <div class="button-group">
        <button class="edit" onclick="editPesanan(${index})">Edit</button>
        <button class="delete" onclick="hapusPesanan(${index})">Hapus</button>
      </div>
    `;
    daftarBeliUl.appendChild(li);
  });
}

function editPesanan(index) {
  const pesanan = pesananList[index];
  
  document.getElementById('nama').value = pesanan.nama;
  document.getElementById('email').value = pesanan.email;
  document.getElementById('hp').value = pesanan.hp;
  jenisTiketSelect.value = pesanan.jenisTiket;
  jumlahInput.value = pesanan.jumlah;
  document.getElementById('pembayaran').value = pesanan.pembayaran;

  const optionToSelect = Array.from(tanggalKonserSelect.options).find(
    option => option.value === pesanan.tanggalKonser
  );
  if (optionToSelect) {
    tanggalKonserSelect.value = optionToSelect.value;
  }
  
  updateHargaDisplay();
  editIndex = index;
  editInfo.classList.remove('hidden');
  document.querySelector('.form-container').scrollIntoView({ 
    behavior: 'smooth' 
  });
}

function hapusPesanan(index) {
  if (confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
    const pesanan = pesananList[index];
    updateTicketAvailability(pesanan.jenisTiket, pesanan.jumlah, 'increase');
    
    pesananList.splice(index, 1);
    savePesananToStorage();
    tampilkanDaftarPemesanan();
  }
}

function savePesananToStorage() {
  localStorage.setItem('pesananList', JSON.stringify(pesananList));
}

function loadPesananFromStorage() {
  const saved = localStorage.getItem('pesananList');
  if (saved) {
    pesananList = JSON.parse(saved);
    let vipTerjual = 0;
    let regTerjual = 0;
    
    pesananList.forEach(pesanan => {
      if (pesanan.jenisTiket === 'VIP') {
        vipTerjual += pesanan.jumlah;
      } else {
        regTerjual += pesanan.jumlah;
      }});
    
    document.getElementById('vipTerjual').textContent = vipTerjual;
    document.getElementById('regTerjual').textContent = regTerjual;
    
    const vipTersediaAwal = 10;
    const regTersediaAwal = 20;
    
    document.getElementById('vipTersedia').textContent = vipTersediaAwal - vipTerjual;
    document.getElementById('regTersedia').textContent = regTersediaAwal - regTerjual;
  }
}

function showBukti(data) {
  let tanggalTransaksi = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short"
  });

  buktiIsi.innerHTML = `
    <p><strong>Terima kasih, ${data.nama}!</strong></p>
    <p>Pemesanan tiket <strong>${data.jenisTiket}</strong> sebanyak <strong>${data.jumlah}</strong> berhasil.</p>
    <p>Tanggal Konser: <strong>${formatTanggal(data.tanggalKonser)}</strong></p>
    <p>Tanggal Pemesanan: <strong>${data.tanggalPemesanan}</strong></p>
    <p>Metode Pembayaran: ${data.pembayaran}</p>
    <p>Total Nominal: <strong>Rp ${data.total.toLocaleString("id-ID")}</strong></p>
    <p>Tanggal Transaksi: ${tanggalTransaksi}</p>
    <p>Tiket digital telah dikirim ke email: <strong>${data.email}</strong></p>
    <p><strong>ID Tiket:</strong> #${Math.floor(100000 + Math.random() * 900000)}</p>
    <hr/>
    <p style="color:green; font-weight:bold; text-align:center;">✅ Pembayaran Berhasil Dikonfirmasi</p>
  `;
  buktiPembayaran.classList.remove("hidden");
  buktiPembayaran.scrollIntoView({ behavior: 'smooth' });}