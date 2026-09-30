import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  logoGoogle, bedOutline, cartOutline, trashOutline, addCircleOutline, 
  imageOutline, videocamOutline, addOutline, removeOutline, 
  homeOutline, chatbubblesOutline, personOutline, sendOutline, micOutline, logOutOutline, eyeOutline, checkmarkCircleOutline, closeOutline, searchOutline, heartOutline, heart, star, listOutline, eye, cameraOutline 
} from 'ionicons/icons';
import { signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, googleProvider } from './firebase.config';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage implements OnInit, OnDestroy {
  activeTab: string = 'home';

  isLoggedIn: boolean = false;
  isAdminUser: boolean = false;
  selectedRole: string = ''; 
  userEmail: string = '';
  userName: string = '';
  
  // Flash Sale Live Timer Variables
  flashSaleTime: string = "12h : 45m : 30s";
  private timerInterval: any;

  // एडमिन भ्यु र ट्याब कन्फिगरेसन
  adminViewMode: 'admin' | 'customer' = 'customer';
  adminTab: string = 'entry';

  // युजर प्रोफाइल डेटा
  userProfile = {
    name: '',
    bio: '',
    photo: ''
  };

  registeredUsersList: any[] = [];

  searchQuery: string = '';
  selectedCategory: string = 'All';
  availableCategories: string[] = ['All', 'Bed', 'Table', 'Sofa', 'Chair', 'Wardrobe'];
  customCategoryInput: string = '';

  wishlistIds: number[] = [];

  selectedProductDetail: any = null;
  showDetailModal: boolean = false;

  selectedOrderItemsModal: any = null;
  showOrderItemsModal: boolean = false;

  get filteredCategories(): string[] {
    return this.availableCategories.filter(cat => cat !== 'All');
  }

  get activeCategoriesInCatalog(): string[] {
    const list = ['All'];
    this.availableCategories.forEach(cat => {
      if (cat !== 'All') {
        const hasProducts = this.productsList.some(p => p.category === cat);
        if (hasProducts) {
          list.push(cat);
        }
      }
    });
    return list;
  }

  newProduct: any = {
    name: '',
    category: '',
    price: null,
    discount: 0,
    finalPrice: 0,
    image: '',
    desc: ''
  };

  productsList: any[] = [
    {
      id: 1,
      name: 'Luxury Wooden Bed',
      category: 'Bed',
      price: 45000,
      discount: 10,
      finalPrice: 40500,
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
      desc: 'Strong and durable king size wooden bed with fine finishing and premium teak wood.',
      rating: 4.8,
      reviewsCount: 14
    },
    {
      id: 2,
      name: 'Modern Office Table',
      category: 'Table',
      price: 15000,
      discount: 5,
      finalPrice: 14250,
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500',
      desc: 'Elegant office table with smooth wooden finish, drawers, and heavy-duty frame.',
      rating: 4.6,
      reviewsCount: 9
    }
  ];

  cart: any[] = [];
  showCheckoutModal: boolean = false;
  
  checkoutData: any = {
    fullName: '',
    phone: '',
    address: '',
    email: ''
  };

  ordersRequestsList: any[] = [];
  myCustomerOrders: any[] = [];

  messagesList: any[] = [
    {
      id: 1,
      senderEmail: 'rajandhakal520@gmail.com',
      senderName: 'Salina Furniture Support',
      receiverEmail: 'all',
      text: 'स्वागत छ सलिना फर्निचर एपमा! तपाईंलाई कस्तो सहयोग चाहिएको छ?',
      type: 'text',
      timestamp: Date.now() - 100000
    }
  ];
  newMessageText: string = '';
  selectedChatUser: string = '';

  constructor() {
    addIcons({ 
      logoGoogle, bedOutline, cartOutline, trashOutline, addCircleOutline, 
      imageOutline, videocamOutline, addOutline, removeOutline, 
      homeOutline, chatbubblesOutline, personOutline, sendOutline, micOutline, logOutOutline, eyeOutline, checkmarkCircleOutline, closeOutline, searchOutline, heartOutline, heart, star, listOutline, eye, cameraOutline 
    });
  }

  ngOnInit() {
    this.startLiveCountdown();

    const savedLogin = localStorage.getItem('salina_logged_user');
    if (savedLogin) {
      try {
        const userData = JSON.parse(savedLogin);
        this.isLoggedIn = true;
        this.userEmail = userData.email;
        this.userName = userData.name;
        this.isAdminUser = userData.isAdmin;
        this.selectedRole = userData.isAdmin ? 'admin' : 'customer';
      } catch (e) {}
    }

    const savedProfile = localStorage.getItem('salina_user_profile');
    if (savedProfile) {
      try {
        this.userProfile = JSON.parse(savedProfile);
        if (this.userProfile.name) {
          this.userName = this.userProfile.name;
        }
      } catch (e) {}
    }

    const savedAllUsers = localStorage.getItem('salina_all_users');
    if (savedAllUsers) {
      try {
        this.registeredUsersList = JSON.parse(savedAllUsers);
      } catch (e) {}
    }

    const savedProducts = localStorage.getItem('salina_products');
    if (savedProducts) {
      try {
        this.productsList = JSON.parse(savedProducts);
      } catch (e) {}
    }

    const savedCategories = localStorage.getItem('salina_categories');
    if (savedCategories) {
      try {
        this.availableCategories = JSON.parse(savedCategories);
      } catch (e) {}
    }

    const savedWishlist = localStorage.getItem('salina_wishlist');
    if (savedWishlist) {
      try {
        this.wishlistIds = JSON.parse(savedWishlist);
      } catch (e) {}
    }

    const savedOrders = localStorage.getItem('salina_all_orders');
    if (savedOrders) {
      try {
        this.ordersRequestsList = JSON.parse(savedOrders);
        this.updateMyOrders();
      } catch (e) {}
    }

    setPersistence(auth, browserLocalPersistence).then(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.userEmail = (user.email || '').trim().toLowerCase();
          if (!this.userName || this.userName === 'User') {
            this.userName = user.displayName || this.userEmail.split('@')[0] || 'User';
            this.userProfile.name = this.userName;
          }
          this.isLoggedIn = true;
          
          if (this.userEmail === 'rajandhakal520@gmail.com' || this.userEmail === 'nishanpartel028@gmail.com') {
            this.isAdminUser = true;
            this.selectedRole = 'admin';
          } else {
            this.isAdminUser = false;
            this.selectedRole = 'customer';
          }

          localStorage.setItem('salina_logged_user', JSON.stringify({
            email: this.userEmail,
            name: this.userName,
            isAdmin: this.isAdminUser
          }));

          this.saveOrUpdateRegisteredUser();
        }
      });
    }).catch((error) => {
      console.error('Persistence error:', error);
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startLiveCountdown() {
    let totalSeconds = 12 * 3600 + 45 * 60 + 30;

    this.timerInterval = setInterval(() => {
      if (totalSeconds <= 0) {
        totalSeconds = 12 * 3600; 
      }

      totalSeconds--;

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const h = String(hours).padStart(2, '0');
      const m = String(minutes).padStart(2, '0');
      const s = String(seconds).padStart(2, '0');

      this.flashSaleTime = `${h}h : ${m}m : ${s}s`;
    }, 1000);
  }

  calculateFinalPrice() {
    const price = Number(this.newProduct.price) || 0;
    const discount = Number(this.newProduct.discount) || 0;
    const calculated = price - (price * discount) / 100;
    this.newProduct.finalPrice = Number(calculated.toFixed(2));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.newProduct.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  publishProduct() {
    if (!this.isAdminUser) {
      alert('⚠ अनुमति छैन!');
      return;
    }

    if (!this.newProduct.name || !this.newProduct.price) {
      alert('कृपया फर्निचरको नाम र मूल्य अनिवार्य भर्नुहोस्!');
      return;
    }

    let finalCategory = this.newProduct.category;
    if (this.customCategoryInput && this.customCategoryInput.trim() !== '') {
      finalCategory = this.customCategoryInput.trim();
      if (!this.availableCategories.includes(finalCategory)) {
        this.availableCategories.push(finalCategory);
        this.saveCategoriesToStorage();
      }
    }

    if (!finalCategory) {
      finalCategory = 'General';
    }

    const finalImage = this.newProduct.image && this.newProduct.image.trim() !== '' 
      ? this.newProduct.image 
      : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500';

    const priceNum = Number(this.newProduct.price) || 0;
    const finalPriceNum = Number(this.newProduct.finalPrice) || priceNum;

    const newObj = {
      id: Date.now(),
      name: this.newProduct.name,
      category: finalCategory,
      price: Number(priceNum.toFixed(2)),
      discount: Number(this.newProduct.discount) || 0,
      finalPrice: Number(finalPriceNum.toFixed(2)),
      image: finalImage,
      desc: this.newProduct.desc || 'High quality professional furniture piece.',
      rating: 4.7,
      reviewsCount: 5
    };

    this.productsList.unshift(newObj);
    this.saveProductsToStorage();
    this.newProduct = { name: '', category: '', price: null, discount: 0, finalPrice: 0, image: '', desc: '' };
    this.customCategoryInput = '';
    alert('नयाँ फर्निचर सफलतापूर्वक सेभ भयो!');
  }

  deleteProduct(id: number) {
    if (!this.isAdminUser) {
      alert('⚠ केवल एडमिनले मात्र फर्निचर डिलिट गर्न सक्नुहुन्छ!');
      return;
    }
    this.productsList = this.productsList.filter(item => item.id !== id);
    this.saveProductsToStorage();
    alert('फर्निचर सफलतापूर्वक हटाइयो!');
  }

  deleteCategory(catName: string) {
    if (!this.isAdminUser) return;
    if (confirm(`के तपाईं '${catName}' क्याटेगोरी डिलिट गर्न चाहनुहुन्छ?`)) {
      this.availableCategories = this.availableCategories.filter(c => c !== catName);
      this.saveCategoriesToStorage();
      this.productsList = this.productsList.filter(p => p.category !== catName);
      this.saveProductsToStorage();
      if (this.selectedCategory === catName) {
        this.selectedCategory = 'All';
      }
      alert('क्याटेगोरी सफलतापर्वक हटाइयो!');
    }
  }

  toggleWishlist(productId: number, event: any) {
    event.stopPropagation();
    const index = this.wishlistIds.indexOf(productId);
    if (index > -1) {
      this.wishlistIds.splice(index, 1);
    } else {
      this.wishlistIds.push(productId);
    }
    localStorage.setItem('salina_wishlist', JSON.stringify(this.wishlistIds));
  }

  isFavorite(productId: number): boolean {
    return this.wishlistIds.includes(productId);
  }

  openProductDetail(item: any, event: any) {
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'SPAN' || event.target.closest('button') || event.target.closest('.wishlist-icon-btn')) {
      return;
    }
    this.selectedProductDetail = item;
    this.showDetailModal = true;
  }

  closeProductDetail() {
    this.showDetailModal = false;
    this.selectedProductDetail = null;
  }

  viewOrderItems(order: any) {
    this.selectedOrderItemsModal = order;
    this.showOrderItemsModal = true;
  }

  closeOrderItemsModal() {
    this.showOrderItemsModal = false;
    this.selectedOrderItemsModal = null;
  }

  getFilteredProducts() {
    let list = this.productsList;
    if (this.selectedCategory && this.selectedCategory !== 'All') {
      list = list.filter(item => item.category === this.selectedCategory);
    }
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(item => item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
    }
    return list;
  }

  getItemQuantityInCart(itemId: number): number {
    const found = this.cart.find(c => c.id === itemId);
    return found ? found.quantity : 0;
  }

  increaseQuantity(item: any) {
    if (!this.isLoggedIn) {
      alert('⚠️ सामान किन्नका लागि कृपया पहिले गुगलबाट लगइन गर्नुहोस्!');
      this.activeTab = 'profile'; 
      return;
    }

    const existing = this.cart.find(c => c.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
  }

  decreaseQuantity(item: any) {
    const existingIndex = this.cart.findIndex(c => c.id === item.id);
    if (existingIndex > -1) {
      if (this.cart[existingIndex].quantity > 1) {
        this.cart[existingIndex].quantity -= 1;
      } else {
        this.cart.splice(existingIndex, 1);
      }
    }
  }

  getTotalCartPrice() {
    const total = this.cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    return Number(total.toFixed(2));
  }

  getTotalCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  proceedToCheckout() {
    if (!this.isLoggedIn) {
      alert('⚠️ कृपया अर्डर गर्नका लागि पहिले लगइन गर्नुहोस्!');
      this.activeTab = 'profile';
      return;
    }

    if (this.cart.length === 0) {
      alert('तपाईंको कार्ट खाली छ!');
      return;
    }
    this.showCheckoutModal = true;
    this.checkoutData.email = this.userEmail;
    this.checkoutData.fullName = this.userName;
  }

  submitOrderRequest() {
    if (!this.isLoggedIn) return;

    if (!this.checkoutData.fullName || !this.checkoutData.phone || !this.checkoutData.address) {
      alert('कृपया पूरा नाम, फोन नम्बर र ठेगाना अनिवार्य भर्नुहोस्!');
      return;
    }

    const requestObj = {
      id: Date.now(),
      customerName: this.checkoutData.fullName,
      phone: this.checkoutData.phone,
      address: this.checkoutData.address,
      email: this.checkoutData.email,
      items: [...this.cart],
      totalPrice: this.getTotalCartPrice(),
      status: 'Pending ⏳ (प्रशोधन हुँदै)',
      timestamp: Date.now()
    };

    this.ordersRequestsList.unshift(requestObj);
    this.saveOrdersToStorage();
    this.cart = [];
    this.showCheckoutModal = false;
    this.checkoutData = { fullName: '', phone: '', address: '', email: '' };
    alert('तपाईंको अर्डर सफलतापूर्वक कन्फर्म भयो! अब तपाईंले प्रोफाइलमा ट्र्याक गर्न सक्नुहुन्छ।');
  }

  acceptOrderRequest(requestId: number) {
    if (!this.isAdminUser) return;
    const req = this.ordersRequestsList.find(r => r.id === requestId);
    if (req) {
      req.status = 'Dispatched / Delivered ✅ (सफलतापूर्वक पठाइयो)';
      this.saveOrdersToStorage();
    }
  }

  deleteOrderRequest(requestId: number) {
    if (!this.isAdminUser) return;
    this.ordersRequestsList = this.ordersRequestsList.filter(r => r.id !== requestId);
    this.saveOrdersToStorage();
  }

  sendMessage(type: string = 'text', content?: string) {
    const textToSend = content || this.newMessageText;
    if (!textToSend.trim() && type === 'text') return;

    const chatObj = {
      id: Date.now(),
      senderEmail: this.userEmail,
      senderName: this.userName,
      receiverEmail: this.isAdminUser ? (this.selectedChatUser || 'all') : 'rajandhakal520@gmail.com',
      text: textToSend,
      type: type,
      timestamp: Date.now()
    };

    this.messagesList.push(chatObj);
    if (type === 'text') this.newMessageText = '';
  }

  sendChatImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.sendMessage('image', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  getFilteredMessages() {
    if (this.isAdminUser) {
      if (!this.selectedChatUser) {
        return this.messagesList;
      }
      return this.messagesList.filter(m => m.senderEmail === this.selectedChatUser || m.receiverEmail === this.selectedChatUser);
    } else {
      return this.messagesList.filter(m => m.senderEmail === this.userEmail || m.receiverEmail === this.userEmail || m.receiverEmail === 'all');
    }
  }

  saveOrUpdateRegisteredUser() {
    const existingIndex = this.registeredUsersList.findIndex(u => u.email === this.userEmail);
    const userDataObj = {
      email: this.userEmail,
      name: this.userName,
      bio: this.userProfile.bio || '',
      photo: this.userProfile.photo || ''
    };

    if (existingIndex !== -1) {
      this.registeredUsersList[existingIndex] = { ...this.registeredUsersList[existingIndex], ...userDataObj };
    } else {
      this.registeredUsersList.push(userDataObj);
    }
    localStorage.setItem('salina_all_users', JSON.stringify(this.registeredUsersList));
  }

  saveProductsToStorage() {
    localStorage.setItem('salina_products', JSON.stringify(this.productsList));
  }

  saveCategoriesToStorage() {
    localStorage.setItem('salina_categories', JSON.stringify(this.availableCategories));
  }

  saveOrdersToStorage() {
    localStorage.setItem('salina_all_orders', JSON.stringify(this.ordersRequestsList));
    this.updateMyOrders();
  }

  updateMyOrders() {
    this.myCustomerOrders = this.ordersRequestsList.filter(o => o.email.trim().toLowerCase() === this.userEmail.trim().toLowerCase());
  }

  switchTab(tabName: string) {
    this.activeTab = tabName;
  }

  toggleAdminViewMode() {
    this.adminViewMode = this.adminViewMode === 'admin' ? 'customer' : 'admin';
  }

  switchAdminTab(tab: string) {
    this.adminTab = tab;
  }

  getUserMessageCount(email: string): number {
    return this.messagesList.filter((m: any) => m.senderEmail === email).length;
  }

  onProfilePhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveUserProfile() {
    if (this.userProfile.name) {
      this.userName = this.userProfile.name;
    }
    localStorage.setItem('salina_user_profile', JSON.stringify(this.userProfile));
    
    const loggedUser = {
      email: this.userEmail,
      name: this.userName,
      isAdmin: this.isAdminUser
    };
    localStorage.setItem('salina_logged_user', JSON.stringify(loggedUser));

    this.saveOrUpdateRegisteredUser();
    alert('प्रोफाइल सफलतापूर्वक सेभ भयो!');
  }

  async continueWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      this.userEmail = (user.email || '').trim().toLowerCase();
      this.userName = user.displayName || 'Google User';
      this.userProfile.name = this.userName;
      this.isLoggedIn = true;
      
      if (this.userEmail === 'rajandhakal520@gmail.com' || this.userEmail === 'nishanpartel028@gmail.com') {
        this.isAdminUser = true;
        this.selectedRole = 'admin';
      } else {
        this.isAdminUser = false;
        this.selectedRole = 'customer';
      }

      localStorage.setItem('salina_logged_user', JSON.stringify({
        email: this.userEmail,
        name: this.userName,
        isAdmin: this.isAdminUser
      }));

      this.saveOrUpdateRegisteredUser();
      this.updateMyOrders();
      alert('सफलतापूर्वक गुगलबाट लगइन भयो!');
    } catch (error: any) {
      alert('गुगल अकाउन्टबाट लगइन गर्न सकिएन: ' + error.message);
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (e) {}
    
    localStorage.removeItem('salina_logged_user');

    this.isLoggedIn = false;
    this.isAdminUser = false;
    this.selectedRole = '';
    this.userName = '';
    this.userEmail = '';
    this.cart = [];
    this.myCustomerOrders = [];
    this.activeTab = 'home';
    this.adminViewMode = 'customer';
  }
}