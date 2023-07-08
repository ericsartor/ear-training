import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import { initializeApp } from "firebase/app";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADXSMatjDcJp52OM3Vphl8gxhe4bvwmA4",
  authDomain: "ear-training-26fe2.firebaseapp.com",
  projectId: "ear-training-26fe2",
  storageBucket: "ear-training-26fe2.appspot.com",
  messagingSenderId: "265539663165",
  appId: "1:265539663165:web:e8cd94e8d5f792be844154"
};

// Initialize Firebase
initializeApp(firebaseConfig);

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
