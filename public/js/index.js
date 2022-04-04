/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
// const bookBtn = document.getElementById('book-tour');

const bookBtn = document.getElementById('book-tour');


// if (bookBtn) {
//   console.log(bookBtn);
//   bookBtn.addEventListener('click', e => {
//     e.target.textContent = 'Processing...'
//     const { tourId } = e.target.dataset;
//     bookTour(tourId);
//   })

// }


if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...'
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  })
}


// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    form.append('photo', document.getElementById('photo').files[0]);




    updateSettings(form, 'data');
  });

if (userPasswordForm)
  console.log(userPasswordForm);
userPasswordForm.addEventListener('submit', async e => {
  e.preventDefault();
  document.querySelector('.btn--save-password').textContent = 'Updating...';

  const passwordCurrent = document.getElementById('password-current').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;
  await updateSettings(
    { passwordCurrent, password, passwordConfirm },
    'password'
  );

  document.querySelector('.btn--save-password').textContent = 'Save password';
  document.getElementById('password-current').value = '';
  document.getElementById('password').value = '';
  document.getElementById('password-confirm').value = '';
});



const userImgEl = document.querySelector('.form__user-photo');
const navImg = document.querySelector('.nav__user-img');
const userImgInputEl = document.querySelector('#photo');

const handleDisplayUserPhoto = e => {
  const imgFile = e.target.files?.[0];

  if (!imgFile?.type.startsWith('image/')) return;
  const reader = new FileReader();

  reader.addEventListener('load', () => {
    userImgEl.setAttribute('src', reader.result);
    navImg.setAttribute('src', reader.result);

  });

  reader.readAsDataURL(imgFile);
};

userImgInputEl.addEventListener('change', handleDisplayUserPhoto);

// if (bookBtn) {
//   console.log(bookBtn);
//   bookBtn.addEventListener('click', e => {
//     e.target.textContent = 'Processing...'
//     const { tourId } = e.target.dataset;
//     bookTour(tourId);
//   })

// }