const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar-toggler");
const menuToggler = document.querySelector(".menu-toggler");


let collapsedSidebarHeight = "56px";
let fullSidebarHeight = "calc(100vh - 32px)";


/*sidebarToggler.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");


  if (sidebar.classList.contains("collapsed")) {

    const activeItem = document.querySelector('.nav-item.active');
    if (activeItem) {
      activeItem.classList.remove('active');
      activeItem.querySelector('.nav-arrow').classList.remove('active');
    }
  } else {

    const activeItem = document.querySelector('.nav-item.active');
    if (activeItem) {
      activeItem.classList.remove('active');
      activeItem.querySelector('.nav-arrow').classList.remove('active');
    }
  }
});*/


const toggleMenu = (isMenuActive) => {
  sidebar.style.height = isMenuActive ? `${sidebar.scrollHeight}px` : collapsedSidebarHeight;
  menuToggler.querySelector("span").innerText = isMenuActive ? "close" : "menu";
};


menuToggler.addEventListener("click", () => {
  toggleMenu(sidebar.classList.toggle("menu-active"));
});


window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    sidebar.style.height = fullSidebarHeight;
  } else {
    sidebar.classList.remove("collapsed");
    sidebar.style.height = "auto";
    toggleMenu(sidebar.classList.contains("menu-active"));
  }
});


const dashboardItem = document.querySelector('.nav-item');
const subLinks = dashboardItem.querySelector('.nav-sublinks');
const arrow = dashboardItem.querySelector('.nav-arrow');


dashboardItem.addEventListener('click', () => {
  if (!sidebar.classList.contains('collapsed')) {
    dashboardItem.classList.toggle('active');
    arrow.classList.toggle('active');
  }
});


sidebar.addEventListener('mouseenter', () => {
  if (sidebar.classList.contains('collapsed')) {
    dashboardItem.classList.add('active');
  }
});

sidebar.addEventListener('mouseleave', () => {
  if (sidebar.classList.contains('collapsed')) {
    dashboardItem.classList.remove('active');
  }
});


window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    sidebar.style.height = "calc(100vh - 32px)";
  } else {
    sidebar.style.height = "auto";
  }
});
