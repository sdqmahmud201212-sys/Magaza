function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle('hidden');
  }
}

function copyCard() {
  const cardText = document.getElementById('chat-card-number').innerText;
  navigator.clipboard.writeText(cardText).then(() => {
    showToast('Kart nömrəsi kopyalandı!');
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (toast && toastMsg) {
    toastMsg.innerText = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

function goHome() {
  document.getElementById('main-content').classList.remove('hidden');
  document.getElementById('seller-dashboard-page').classList.add('hidden');
}

// Məhsulları oxumaq (Description və Nömrə ilə)
function loadProducts() {
  const productsGrid = document.getElementById('products-grid');
  const productCount = document.getElementById('product-count');
  
  if (!productsGrid) return;

  database.ref('materials').on('value', (snapshot) => {
    productsGrid.innerHTML = '';
    const data = snapshot.val();
    
    if (data) {
      let count = 0;
      Object.keys(data).forEach((key) => {
        const item = data[key];
        count++;
        
        productsGrid.innerHTML += `
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl space-y-3">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="bg-purple-600/20 text-purple-400 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-500/30">PDF Fayl</span>
                <span class="text-emerald-400 font-bold text-sm">${item.price} AZN</span>
              </div>
              <h3 class="text-base font-bold text-white mb-1">${item.title}</h3>
              <p class="text-xs text-slate-300 line-clamp-2 mb-2">${item.description}</p>
              <div class="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span>Müəllif: ${item.author}</span>
                <span class="text-purple-400 font-mono"><i class="fa-solid fa-phone mr-1"></i>${item.phone}</span>
              </div>
            </div>
            <button onclick="openChat('${key}', '${item.title}', '${item.author}', '${item.price}', '${item.card}', '${item.phone}')" class="w-full bg-slate-800 hover:bg-purple-600 text-white font-bold py-2.5 rounded-2xl text-xs transition cursor-pointer flex items-center justify-center space-x-2">
              <i class="fa-solid fa-cart-shopping"></i>
              <span>Satın Al / Faylı Əldə Et</span>
            </button>
          </div>
        `;
      });
      productCount.innerText = `${count} material`;
    } else {
      productsGrid.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-500 text-xs">
          Hələ ki, satışda heç bir material yoxdur.
        </div>
      `;
      productCount.innerText = `0 material`;
    }
  });
}

// Material Yükləmə (Description, Telefon, Gmail və Şifrə ilə)
function handlePDFUpload(event) {
  event.preventDefault();
  
  const title = document.getElementById('pdf-title').value;
  const description = document.getElementById('pdf-desc').value;
  const author = document.getElementById('pdf-author').value;
  const price = document.getElementById('pdf-price').value;
  const phone = document.getElementById('seller-phone').value;
  const card = document.getElementById('seller-card').value;
  const email = document.getElementById('seller-email').value;
  const password = document.getElementById('seller-password').value;
  const fileInput = document.getElementById('pdf-file');

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    
    database.ref('materials').orderByChild('fileName').equalTo(file.name).once('value', (snapshot) => {
      if (snapshot.exists()) {
        showToast('Xəbərdarlıq: Bu fayl əvvəlcədən sistemə yüklənib!');
      } else {
        database.ref('materials').push({
          title, description, author, price, phone, card, email, password,
          fileName: file.name,
          timestamp: Date.now()
        }, (error) => {
          if (!error) {
            showToast('Material uğurla satışa çıxarıldı!');
            toggleModal('upload-modal');
            event.target.reset();
          } else {
            showToast('Xəta baş verdi: ' + error.message);
          }
        });
      }
    });
  }
}

// Satıcı Girişi və Öz Səhifəsinə Keçid
function handleSellerLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  database.ref('materials').orderByChild('email').equalTo(email).once('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      let matched = false;
      let sellerMaterials = [];
      
      Object.keys(data).forEach(key => {
        if (data[key].password === password) {
          matched = true;
          sellerMaterials.push({ id: key, ...data[key] });
        }
      });

      if (matched) {
        toggleModal('seller-login-modal');
        showToast('Giriş uğurludur!');
        openSellerDashboard(email, sellerMaterials);
      } else {
        showToast('Şifrə yanlışdır!');
      }
    } else {
      showToast('Bu Gmail ilə qeydiyyat tapılmadı!');
    }
  });
}

function openSellerDashboard(email, materials) {
  document.getElementById('main-content').classList.add('hidden');
  document.getElementById('seller-dashboard-page').classList.remove('hidden');
  document.getElementById('seller-logged-email').innerText = `Giriş edən Gmail: ${email}`;

  const grid = document.getElementById('seller-products-grid');
  grid.innerHTML = '';

  if (materials.length > 0) {
    materials.forEach(item => {
      grid.innerHTML += `
        <div class="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-2">
          <div>
            <h4 class="text-xs font-bold text-white">${item.title}</h4>
            <p class="text-[11px] text-slate-400 mt-1">${item.description}</p>
            <span class="text-emerald-400 font-bold text-xs mt-2 block">${item.price} AZN</span>
          </div>
          <button onclick="deleteMaterial('${item.id}')" class="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer">
            Sil
          </button>
        </div>
      `;
    });
  } else {
    grid.innerHTML = `<p class="text-xs text-slate-500 col-span-full">Hələ heç bir materialınız yoxdur.</p>`;
  }
}

function sellerLogout() {
  goHome();
  showToast('Sistemdən çıxış edildi.');
}

function deleteMaterial(id) {
  if (confirm('Bu materialı silmək istədiyinizə əminsiniz?')) {
    database.ref('materials/' + id).remove().then(() => {
      showToast('Material silindi.');
      goHome();
    });
  }
}

// Alış Pəncərəsi və Gmail Bildiriş Simulyasiyası
function openChat(id, title, author, price, card, phone) {
  document.getElementById('chat-product-title').innerText = title;
  document.getElementById('chat-seller-info').innerText = `Müəllif: ${author} | Nömrə: ${phone}`;
  document.getElementById('chat-price').innerText = `${price} AZN`;
  document.getElementById('chat-card-number').innerText = card;
  
  // Gmail bildiriş simulyasiyası (Alış zamanı satıcıya bildiriş simulyasiya olunur)
  showToast('Satıcının Gmail ünvanına alış sorğusu göndərildi!');
  toggleModal('chat-modal');
}

function sendReceiptMessage(event) {
  const container = document.getElementById('chat-messages');
  container.innerHTML += `
    <div class="flex justify-end">
      <div class="bg-purple-600 text-white text-xs px-3.5 py-2 rounded-2xl max-w-[80%]">
        <i class="fa-solid fa-receipt mr-1"></i> Ödəniş qəbzi göndərildi. Təsdiq gözlənilir... 
        <br><span class="text-[10px] text-purple-200">3-4 saat ərzində cavab gəlməsə, satıcının nömrəsinə yazın.</span>
      </div>
    </div>
  `;
  container.scrollTop = container.scrollHeight;
  showToast('Qəbz uğurla göndərildi!');
}
