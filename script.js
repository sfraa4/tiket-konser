let vipTersedia = 10;
let regTersedia = 20;
let vipTerjual = 0;
let regTerjual = 0;

const form = document.getElementById("ticketForm");
const daftarBeli = document.getElementById("daftarBeli");
const buktiPembayaran = document.getElementById("buktiPembayaran");
const buktiIsi = document.getElementById("buktiIsi");
const editInfo = document.getElementById("editInfo");
const submitBtn = form.querySelector(".submit-btn");

let editIndex = null;
let tempData = [];

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nama = document.getElementById("nama").value.trim();
  const email = document.getElementById("email").value.trim();
  const hp = document.getElementById("hp").value.trim();
  const jenisTiket = document.getElementById("jenisTiket").value;
  const jumlah = parseInt(document.getElementById("jumlah").value);
  const pembayaran = document.getElementById("pembayaran").value;

  if ((jenisTiket === "VIP" && jumlah > vipTersedia) || (jenisTiket === "Regular" && jumlah > regTersedia)) {
    alert("Jumlah tiket melebihi stok tersedia.");
    return;
  }

  if (editIndex === null) {
    if (jenisTiket === "VIP") {
      vipTersedia -= jumlah;
      vipTerjual += jumlah;
    } else {
      regTersedia -= jumlah;
      regTerjual += jumlah;
    }
  } else {
    const old = tempData[editIndex];
    // Kembalikan stok dulu
    if (old.jenisTiket === "VIP") {
      vipTersedia += old.jumlah;
      vipTerjual -= old.jumlah;
    } else {
      regTersedia += old.jumlah;
      regTerjual -= old.jumlah;
    }

    // Kurangi stok sesuai perubahan
    if (jenisTiket === "VIP") {
      vipTersedia -= jumlah;
      vipTerjual += jumlah;
    } else {
      regTersedia -= jumlah;
      regTerjual += jumlah;
    }

    tempData[editIndex] = null;
    editIndex = null;
    editInfo.classList.add("hidden");
    submitBtn.textContent = "Beli Tiket";
  }

  updateStok();

  const data = { nama, email, hp, jenisTiket, jumlah, pembayaran };
  tempData.push(data);
  renderList();
  showBukti(data);
  form.reset();
});

function renderList() {
  daftarBeli.innerHTML = "";

  tempData.forEach((data, index) => {
    if (!data) return;

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${data.nama}</strong> - ${data.jenisTiket} x ${data.jumlah}<br/>
      Email: ${data.email}, HP: ${data.hp}<br/>
      Metode: ${data.pembayaran}<br/>
      <div class="button-group">
        <button class="edit">Edit</button>
        <button class="delete">Hapus</button>
      </div>
    `;

    li.querySelector(".edit").addEventListener("click", () => {
      document.getElementById("nama").value = data.nama;
      document.getElementById("email").value = data.email;
      document.getElementById("hp").value = data.hp;
      document.getElementById("jenisTiket").value = data.jenisTiket;
      document.getElementById("jumlah").value = data.jumlah;
      document.getElementById("pembayaran").value = data.pembayaran;

      editIndex = index;
      editInfo.classList.remove("hidden");
      submitBtn.textContent = "Simpan Perubahan";
      buktiPembayaran.classList.add("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    li.querySelector(".delete").addEventListener("click", () => {
      if (data.jenisTiket === "VIP") {
        vipTersedia += data.jumlah;
        vipTerjual -= data.jumlah;
      } else {
        regTersedia += data.jumlah;
        regTerjual -= data.jumlah;
      }

      tempData[index] = null;
      updateStok();
      renderList();
      buktiPembayaran.classList.add("hidden");
    });

    daftarBeli.appendChild(li);
  });
}

function updateStok() {
  document.getElementById("vipTersedia").innerText = vipTersedia;
  document.getElementById("regTersedia").innerText = regTersedia;
  document.getElementById("vipTerjual").innerText = vipTerjual;
  document.getElementById("regTerjual").innerText = regTerjual;
}

function showBukti(data) {
  buktiIsi.innerHTML = `
    <p><strong>Terima kasih, ${data.nama}!</strong></p>
    <p>Pemesanan tiket ${data.jenisTiket} sebanyak ${data.jumlah} berhasil.</p>
    <p>Metode Pembayaran: ${data.pembayaran}</p>
    <p>Tiket digital telah dikirim ke email: <strong>${data.email}</strong></p>
    <p><strong>ID Tiket:</strong> #${Math.floor(100000 + Math.random() * 900000)}</p>
  `;
  buktiPembayaran.classList.remove("hidden");
}
