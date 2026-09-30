import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardPage implements OnInit {
  
  // प्रिमियम फर्निचरहरूको सूची (मूल्य र फोटो सहित)
  furnitureList = [
    { id: 1, name: 'Executive Wooden Sofa', price: 45000, image: 'assets/sofa.jpg', desc: 'Comfortable 3-seater luxury sofa.' },
    { id: 2, name: 'Modern King Size Bed', price: 65000, image: 'assets/bed.jpg', desc: 'Solid wood bed with hydraulic storage.' },
    { id: 3, name: 'Minimalist Office Desk', price: 25000, image: 'assets/desk.jpg', desc: 'Sturdy table for professional work.' }
  ];

  cart: any[] = [];
  isAdmin: boolean = false; // ३ जना एड्मिनको लागि मात्र True हुनेछ

  ngOnInit() {
    // यहाँ हालको लगइन गरेको युजरको इमेल चेक गरेर ३ जना एड्मिन मध्ये हो/होइन छुट्याउन सकिन्छ
    const currentUserEmail = localStorage.getItem('loggedUserEmail');
    const adminEmails = ['rajan@gmail.com', 'admin2@gmail.com', 'admin3@gmail.com']; // तपाईंले तोक्ने ३ वटा इमेलहरू
    
    if (currentUserEmail && adminEmails.includes(currentUserEmail)) {
      this.isAdmin = true;
    }
  }

  // सामान कार्टमा थप्ने फङ्सन
  addToCart(item: any) {
    this.cart.push(item);
    alert(`${item.name} सफलतापूर्वक कार्टमा थपियो!`);
  }

  // अर्डर कन्फर्म गर्ने फङ्सन
  checkout() {
    if (this.cart.length === 0) {
      alert('तपाईंको कार्ट खाली छ!');
      return;
    }
    alert('बधाई छ! तपाईंको फर्निचर अर्डर सफलतापूर्वक भयो। डेलिभरी टिमले छिट्टै सम्पर्क गर्नेछ।');
    this.cart = [];
  }
}