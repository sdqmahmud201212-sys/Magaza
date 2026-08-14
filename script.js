// --- SİSTEM PARAMETRLƏRİ ---
let userBalance = 5; // İlk qeydiyyat hədiyyəsi (1 AZN dəyərində)
let platformOwnerBalance = 0; // Sizə çatan 5% komissiya

let products = [
  {
    id: 1,
    title: "JavaScript Tam Qaydalar",
    author: "Kamran M.",
    price: 15,
    fileUrl: "kitab.pdf",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    title: "Biznes və Marketing Bələdçisi",
    author: "Aysel K.",
    price: 10,
    fileUrl: "kitab.pdf",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  updateUI();
  renderProducts();
  generatePaymentCode();
});

function updateUI() {
  document.getElementById("user-coins").innerText = userBalance;
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "glass rounded-2xl overflow-hidden shadow-lg border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition";

    card.innerHTML = `
      <div>
        <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-cover">
        <div class="p-5">
          <div class="text-xs text-indigo-400 uppercase font-semibold tracking-wider mb-1">Müəllif: ${product.author}</div>
          <h3 class="text-lg font-bold text-white mb-2">${product.title}</h3>
        </div>
      </div>
      
      <div class="p-5 pt-0 flex items-center justify-between mt-auto">
        <div class="flex items-center space-x-1">
          <i class="fa-solid fa-coins text-amber-400"></i>
          <span class="text-xl font-extrabold text-amber-400">${product.price}</span>
          <span class="text-xs text-slate-400">Sikkə</span>
        </div>
        <button onclick="buyProduct(${product.id})" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-2 shadow-lg shadow-emerald-600/20">
          <i class="fa-solid fa-cart-shopping"></i>
          <span>Al & Yüklə</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// MODAL AÇIB-BAĞLAMAQ
function toggleUploadModal() {
  document.getElementById("upload-modal").classList.toggle("hidden");
}

function togglePaymentModal() {
  document.getElementById("payment-modal").classList.toggle("hidden");
}

// UNİKAL MÜŞTƏRİ KODU GENERASİYASI
function generatePaymentCode() {
  const randomCode = "KOD-" + Math.floor(1000 + Math.random() * 9000);
  const codeElem = document.getElementById("user-payment-code");
  if(codeElem) codeElem.innerText = randomCode;
}

// ÖDƏNİŞ SORĞUSU
function submitPaymentRequest() {
  togglePaymentModal();
  showToast("Ödəniş sorğunuz qəbul olundu. Yoxlanıldıqdan sonra sikkələr yüklənəcək!");
}

// PDF YÜKLƏMƏ
function handlePDFUpload(event) {
  event.preventDefault();

  const title = document.getElementById("pdf-title").value;
  const author = document.getElementById("pdf-author").value;
  const price = parseInt(document.getElementById("pdf-price").value);
  const fileInput = document.getElementById("pdf-file");
  const file = fileInput.files[0];

  if (!file) return;

  const fileObjectUrl = URL.createObjectURL(file);

  const newProduct = {
    id: Date.now(),
    title: title,
    author: author,
    price: price,
    fileUrl: fileObjectUrl,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80"
  };

  products.unshift(newProduct);
  renderProducts();
  toggleUploadModal();
  document.getElementById("upload-form").reset();

  showToast("Təbriklər! PDF uğurla satışa çıxarıldı.");
}

// SATIN ALMA VƏ 5% KOMİSSİYA
function buyProduct(productId) {
  const product = products.find(p => p.id === productId);

  if (userBalance < product.price) {
    showToast("Sikkəniz çatmir! Lütfən 'Sikkə Al' düyməsindən balans artırın.", true);
    return;
  }

  userBalance -= product.price;

  const commission = product.price * 0.05; 
  platformOwnerBalance += commission;

  updateUI();
  downloadPDF(product.fileUrl, product.title);

  showToast(`"${product.title}" alındı və avtomatik yükləndi!`);
}

function downloadPDF(url, title) {
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  toastMessage.innerText = message;
  toast.classList.remove("hidden", "bg-emerald-600", "bg-rose-600");

  if (isError) {
    toast.classList.add("bg-rose-600");
  } else {
    toast.classList.add("bg-emerald-600");
  }

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
}
