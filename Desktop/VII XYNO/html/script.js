// ========== GLOBAL DEĞİŞKENLER ==========
let currentUser = null;
let audio = null;
let selectedFile = null;
let selectedChatUser = null;

// ========== SAYFA YÜKLENDİĞİNDE ==========
document.addEventListener('DOMContentLoaded', function() {
    // Yönetici emailini tanımla
    localStorage.setItem('xyno_admin', 'setcraos1@gmail.com');
    
    // Müzik sistemini başlat
    initMusic();
    
    // Ürünleri yükle
    loadProducts();
    
    // Oturum kontrolü
    checkSession();
    
    addLog('SİSTEM', 'Site başlatıldı');
});

// ========== MÜZİK SİSTEMİ ==========
function initMusic() {
    audio = document.getElementById('bgMusic');
    const toggle = document.getElementById('musicToggle');
    const volume = document.getElementById('volumeControl');
    
    if (audio && toggle && volume) {
        audio.volume = 0.5;
        
        // Sayfa yüklenir otomatik çal
        audio.play().catch(e => console.log('Otomatik oynatma engellendi'));
        
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (audio.paused) {
                audio.play()
                    .then(() => {
                        this.classList.remove('muted');
                        showNotification('🎵 Müzik başlatıldı');
                    })
                    .catch(err => {
                        showNotification('⚠️ Müzik için sayfaya tıklayın');
                    });
            } else {
                audio.pause();
                this.classList.add('muted');
                showNotification('🔇 Müzik durduruldu');
            }
        });
        
        volume.addEventListener('input', function() {
            audio.volume = this.value;
        });
    }
}

// ========== OTURUM KONTROLÜ ==========
function checkSession() {
    const userJson = localStorage.getItem('xyno_current_user');
    if (userJson) {
        currentUser = JSON.parse(userJson);
        updateUIForLoggedIn();
        showNotification('👋 Hoş geldiniz, ' + currentUser.name);
    }
}

// ========== UI GÜNCELLEME (ÇIKIŞ BUTONU KALDIRILDI) ==========
function updateUIForLoggedIn() {
    const buttonsDiv = document.getElementById('mainButtons');
    
    // Admin mi kontrol et
    const isAdminUser = isAdmin();
    
    let adminButton = '';
    if (isAdminUser) {
        adminButton = `
            <button class="btn-neon stagger-btn" onclick="openAdminPanel()">
                <span>𝖆</span><span>𝖉</span><span>𝖒</span><span>𝖎</span><span>𝖓</span>
            </button>
        `;
    }
    
    // ÇIKIŞ BUTONU KALDIRILDI - SADECE PROFİLDE OLACAK
    buttonsDiv.innerHTML = `
        <button class="btn-neon stagger-btn" onclick="showProfile()">
            <span>𝖕</span><span>𝖗</span><span>𝖔</span><span>𝖋</span><span>𝖎</span><span>𝖑</span>
        </button>
        ${adminButton}
        <button class="btn-neon stagger-btn" onclick="showPanel('info')">
            <span>𝖇</span><span>𝖎</span><span>𝖑</span><span>𝖌</span><span>𝖎</span>
        </button>
        <button class="btn-neon stagger-btn" onclick="showPanel('store')">
            <span>𝖒</span><span>𝖆</span><span>𝖌̧</span><span>𝖆</span><span>𝖟</span><span>𝖆</span>
        </button>
    `;
    
    // Profil bilgilerini güncelle
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    
    if (currentUser.registeredAt) {
        const date = new Date(currentUser.registeredAt);
        document.getElementById('profileJoinDate').textContent = date.toLocaleDateString('tr-TR');
    }
    
    if (currentUser.avatar) {
        const avatarImg = document.getElementById('avatarImg');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        avatarImg.src = currentUser.avatar;
        avatarImg.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
    }
}

// ========== PROFİL İŞLEMLERİ ==========
function showProfile() {
    hideAllPanels();
    document.getElementById('profilePanel').style.display = 'block';
    setTimeout(() => {
        document.getElementById('profilePanel').classList.add('active');
    }, 10);
}

function hideProfile() {
    document.getElementById('profilePanel').classList.remove('active');
    setTimeout(() => {
        document.getElementById('profilePanel').style.display = 'none';
    }, 500);
}

function uploadAvatar(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const avatarImg = document.getElementById('avatarImg');
            const avatarPlaceholder = document.getElementById('avatarPlaceholder');
            
            avatarImg.src = e.target.result;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
            
            if (currentUser) {
                currentUser.avatar = e.target.result;
                localStorage.setItem('xyno_current_user', JSON.stringify(currentUser));
                
                const users = JSON.parse(localStorage.getItem('xyno_users') || '[]');
                const userIndex = users.findIndex(u => u.email === currentUser.email);
                if (userIndex !== -1) {
                    users[userIndex].avatar = e.target.result;
                    localStorage.setItem('xyno_users', JSON.stringify(users));
                }
                
                showNotification('✅ Profil fotoğrafı güncellendi');
                addLog('PROFİL', 'Profil fotoğrafı güncellendi');
            }
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// ========== GİRİŞ İŞLEMİ ==========
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('xyno_users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('xyno_current_user', JSON.stringify(user));
        
        addLog('GİRİŞ', email + ' başarıyla giriş yaptı');
        showNotification('✅ Hoş geldiniz, ' + user.name);
        
        setTimeout(() => {
            hidePanel('login');
            updateUIForLoggedIn();
        }, 1500);
    } else {
        addLog('GİRİŞ', email + ' için başarısız giriş');
        showNotification('❌ Kullanıcı bulunamadı');
    }
}

// ========== KAYIT İŞLEMİ ==========
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    
    const users = JSON.parse(localStorage.getItem('xyno_users') || '[]');
    
    if (users.some(u => u.email === email)) {
        showNotification('❌ Bu email zaten kayıtlı');
        return;
    }
    
    const newUser = {
        name: name,
        email: email,
        registeredAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('xyno_users', JSON.stringify(users));
    
    addLog('KAYIT', email + ' kayıt oldu');
    showNotification('✅ Kayıt başarılı!');
    
    setTimeout(() => {
        hidePanel('register');
        showPanel('login');
    }, 1500);
}

// ========== ÇIKIŞ İŞLEMİ (SADECE PROFİLDEN) ==========
function logout() {
    currentUser = null;
    localStorage.removeItem('xyno_current_user');
    
    const buttonsDiv = document.getElementById('mainButtons');
    buttonsDiv.innerHTML = `
        <button class="btn-neon stagger-btn" onclick="showPanel('login')">
            <span>𝖌</span><span>𝖎</span><span>𝖗</span><span>𝖎</span><span>𝖘̧</span><span> </span><span>𝖞</span><span>𝖆</span><span>𝖕</span>
        </button>
        <button class="btn-neon stagger-btn" onclick="showPanel('register')">
            <span>𝖐</span><span>𝖆</span><span>𝖞</span><span>ı</span><span>𝖙</span><span> </span><span>𝖔</span><span>𝖑</span>
        </button>
        <button class="btn-neon stagger-btn" onclick="showPanel('info')">
            <span>𝖇</span><span>𝖎</span><span>𝖑</span><span>𝖌</span><span>𝖎</span>
        </button>
        <button class="btn-neon stagger-btn" onclick="showPanel('store')">
            <span>𝖒</span><span>𝖆</span><span>𝖌̧</span><span>𝖆</span><span>𝖟</span><span>𝖆</span>
        </button>
    `;
    
    hideProfile();
    showNotification('👋 Çıkış yapıldı');
    addLog('ÇIKIŞ', 'Kullanıcı çıkış yaptı');
}

// ========== YARDIM MERKEZİ ==========
function toggleHelp() {
    const panel = document.getElementById('helpPanel');
    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
        loadUserHelpMessages();
    }
}

function loadUserHelpMessages() {
    const messagesDiv = document.getElementById('helpMessages');
    if (!messagesDiv) return;
    
    const allMessages = JSON.parse(localStorage.getItem('xyno_help_messages') || '[]');
    const userEmail = currentUser ? currentUser.email : 'misafir';
    
    const userMessages = allMessages.filter(msg => msg.user === userEmail);
    
    let html = '';
    userMessages.forEach(msg => {
        const messageClass = msg.fromAdmin ? 'admin-message' : 'own-message';
        html += `
            <div class="help-message ${messageClass}">
                ${msg.fromAdmin ? '<small>👑 Admin</small>' : ''}
                <div class="message-text">${msg.message || 'Dosya gönderildi'}</div>
                ${msg.file ? '<div class="message-file">📎 ' + msg.file + '</div>' : ''}
                <small>${new Date(msg.time).toLocaleTimeString('tr-TR')}</small>
            </div>
        `;
    });
    
    messagesDiv.innerHTML = html;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendHelpMessage() {
    const input = document.getElementById('helpMessageInput');
    const message = input.value.trim();
    
    if (!message && !selectedFile) {
        showNotification('❌ Mesaj veya dosya seçin');
        return;
    }
    
    const allMessages = JSON.parse(localStorage.getItem('xyno_help_messages') || '[]');
    allMessages.push({
        user: currentUser ? currentUser.email : 'misafir',
        message: message,
        file: selectedFile ? selectedFile.name : null,
        time: new Date().toISOString(),
        fromAdmin: false
    });
    localStorage.setItem('xyno_help_messages', JSON.stringify(allMessages));
    
    loadUserHelpMessages();
    
    input.value = '';
    selectedFile = null;
}

function sendHelpFile(input) {
    if (input.files && input.files[0]) {
        selectedFile = input.files[0];
        showNotification('📷 Dosya seçildi: ' + input.files[0].name);
        document.getElementById('helpMessageInput').placeholder = 'Mesaj yazın veya gönderin...';
    }
}

// ========== PANEL KONTROLLERİ ==========
function showPanel(panelName) {
    hideAllPanels();
    const panel = document.getElementById(panelName + 'Panel');
    if (panel) {
        panel.classList.add('active');
        document.body.style.overflow = 'hidden';
        addLog('PANEL', panelName + ' paneli açıldı');
    }
}

function hidePanel(panelName) {
    const panel = document.getElementById(panelName + 'Panel');
    if (panel) {
        panel.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function hideAllPanels() {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(p => p.classList.remove('active'));
}

// ========== ÜRÜNLER ==========
const products = [
    { id: 1, name: 'One Piece Cilt 1', price: 89.90, category: 'manga', stock: 15 },
    { id: 2, name: 'Naruto Cilt 1', price: 79.90, category: 'manga', stock: 12 },
    { id: 3, name: 'Batman: Year One', price: 129.90, category: 'comic', stock: 8 },
    { id: 4, name: 'Watchmen', price: 159.90, category: 'comic', stock: 5 },
    { id: 5, name: '1984 - George Orwell', price: 49.90, category: 'book', stock: 25 },
    { id: 6, name: 'Dune - Frank Herbert', price: 79.90, category: 'book', stock: 18 },
    { id: 7, name: 'iPhone 13 Pro (2. El)', price: 24999.90, category: 'phone', stock: 3 },
    { id: 8, name: 'Samsung S23 Ultra (2. El)', price: 21999.90, category: 'phone', stock: 4 }
];

function loadProducts(filter = 'all') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    let filtered = products;
    if (filter !== 'all') {
        filtered = products.filter(p => p.category === filter);
    }
    
    let html = '';
    filtered.forEach(p => {
        html += `
            <div class="product-card">
                <div class="product-image" style="background: linear-gradient(45deg, #ff00aa, #00ffff);"></div>
                <div class="product-info">
                    <h3 class="product-name">${p.name}</h3>
                    <p class="product-price">₺${p.price.toFixed(2)}</p>
                    <p class="product-stock">Stok: ${p.stock}</p>
                    <button class="product-btn" onclick="addToCart(${p.id})">Sepete Ekle</button>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

function filterProducts(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    loadProducts(category);
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        showNotification('🛒 ' + product.name + ' sepete eklendi');
        addLog('SEPET', product.name + ' sepete eklendi');
    }
}

// ========== YÖNETİCİ FONKSİYONLARI ==========
function isAdmin() {
    const adminEmail = localStorage.getItem('xyno_admin');
    return currentUser && currentUser.email === adminEmail;
}

function openAdminPanel() {
    if (!isAdmin()) {
        showNotification('❌ Bu bölüme erişim yetkiniz yok');
        return;
    }
    showAdminPanel();
}

function showAdminPanel() {
    if (!isAdmin()) return;
    
    // Eğer zaten açık bir admin paneli varsa kapat
    const existingPanel = document.getElementById('adminPanel');
    if (existingPanel) {
        closeAdminPanel();
        return;
    }
    
    const adminPanel = document.createElement('div');
    adminPanel.className = 'admin-panel';
    adminPanel.id = 'adminPanel';
    adminPanel.innerHTML = `
        <div class="admin-header">
            <h3>👑 Yönetici Paneli</h3>
            <button onclick="closeAdminPanel()">✕</button>
        </div>
        <div class="admin-body">
            <div class="admin-users" id="adminUsersList"></div>
            <div class="admin-chat" id="adminChatArea">
                <div class="admin-chat-header">
                    <h4 id="selectedUser">Kullanıcı seçin</h4>
                </div>
                <div class="admin-messages" id="adminMessages"></div>
                <div class="admin-input">
                    <input type="text" id="adminReplyInput" placeholder="Cevabınızı yazın...">
                    <button onclick="sendAdminReply()">Gönder</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(adminPanel);
    setTimeout(() => adminPanel.classList.add('active'), 100);
    loadUsersForAdmin();
}

function loadUsersForAdmin() {
    const users = JSON.parse(localStorage.getItem('xyno_users') || '[]');
    const messages = JSON.parse(localStorage.getItem('xyno_help_messages') || '[]');
    const listDiv = document.getElementById('adminUsersList');
    
    if (!listDiv) return;
    
    const usersWithLastMsg = users.map(user => {
        const userMessages = messages.filter(m => m.user === user.email);
        const lastMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
        return {
            ...user,
            lastMessage: lastMsg ? (lastMsg.message || 'Dosya gönderildi') : 'Henüz mesaj yok',
            lastMessageTime: lastMsg ? lastMsg.time : user.registeredAt
        };
    });
    
    usersWithLastMsg.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    
    let html = '';
    usersWithLastMsg.forEach(user => {
        html += `
            <div class="admin-user-item" onclick="selectUserForChat('${user.email}')">
                <div class="admin-user-avatar">
                    ${user.avatar ? `<img src="${user.avatar}" alt="">` : '👤'}
                </div>
                <div class="admin-user-info">
                    <div class="admin-user-name">${user.name}</div>
                    <div class="admin-user-lastmsg">${user.lastMessage}</div>
                </div>
                <div class="admin-user-status">●</div>
            </div>
        `;
    });
    
    listDiv.innerHTML = html;
}

function selectUserForChat(userEmail) {
    document.getElementById('selectedUser').textContent = userEmail;
    selectedChatUser = userEmail;
    
    const messages = JSON.parse(localStorage.getItem('xyno_help_messages') || '[]');
    const userMessages = messages.filter(m => m.user === userEmail);
    const messagesDiv = document.getElementById('adminMessages');
    
    let html = '';
    userMessages.forEach(msg => {
        html += `
            <div class="admin-message ${msg.fromAdmin ? 'admin' : 'user'}">
                <div class="message-time">${new Date(msg.time).toLocaleTimeString('tr-TR')}</div>
                <div class="message-content">${msg.message || 'Dosya gönderildi'}</div>
                ${msg.file ? '<div class="message-file">📎 ' + msg.file + '</div>' : ''}
            </div>
        `;
    });
    
    messagesDiv.innerHTML = html;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendAdminReply() {
    if (!selectedChatUser) {
        showNotification('❌ Lütfen önce bir kullanıcı seçin');
        return;
    }
    
    const input = document.getElementById('adminReplyInput');
    const reply = input.value.trim();
    
    if (!reply) {
        showNotification('❌ Cevap yazın');
        return;
    }
    
    const messages = JSON.parse(localStorage.getItem('xyno_help_messages') || '[]');
    messages.push({
        user: selectedChatUser,
        message: reply,
        time: new Date().toISOString(),
        fromAdmin: true,
        adminEmail: currentUser.email
    });
    
    localStorage.setItem('xyno_help_messages', JSON.stringify(messages));
    
    const messagesDiv = document.getElementById('adminMessages');
    messagesDiv.innerHTML += `
        <div class="admin-message admin">
            <div class="message-time">${new Date().toLocaleTimeString('tr-TR')}</div>
            <div class="message-content">${reply}</div>
        </div>
    `;
    
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    showNotification('✅ Cevap gönderildi');
    addLog('YÖNETİCİ', `${selectedChatUser} kullanıcısına cevap gönderildi: ${reply}`);
}

function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.classList.remove('active');
        setTimeout(() => panel.remove(), 500);
    }
}

// ========== LOG SİSTEMİ ==========
function addLog(type, message) {
    const logs = JSON.parse(localStorage.getItem('xyno_logs') || '[]');
    logs.push({
        time: new Date().toLocaleString('tr-TR'),
        type: type,
        message: message,
        user: currentUser ? currentUser.email : 'misafir'
    });
    
    if (logs.length > 100) logs.shift();
    localStorage.setItem('xyno_logs', JSON.stringify(logs));
    
    console.log(`[${type}] ${message}`);
}

// ========== BİLDİRİM SİSTEMİ ==========
function showNotification(message) {
    const old = document.querySelector('.notification');
    if (old) old.remove();
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.add('hide');
        setTimeout(() => notif.remove(), 500);
    }, 3000);
}