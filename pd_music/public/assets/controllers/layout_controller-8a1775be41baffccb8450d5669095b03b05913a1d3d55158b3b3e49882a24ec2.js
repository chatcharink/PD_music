import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    // window.addEventListener('resize', this.responsive());
    // this.element.textContent = "Hello World!"
  }

  miniSideMenu(){
    this.responsive();
    // window.addEventListener('resize', responsive);
  }

  responsive(){
    let width = screen.width;
    let nav_side = document.getElementsByClassName("div-side-menu");
    let div_body = document.getElementsByClassName("div-body");
    if (width < 770){
        document.getElementsByClassName("navbar-brand")[0].style.display = "none";
        document.getElementsByClassName("div-body")[0].style.marginLeft = "0px";
        if (nav_side[0].style.display == "block"){
            nav_side[0].style.display = "none";
        }else {
            nav_side[0].style.display = "block";
            nav_side[0].classList.remove("mini");
        }

    } else {
        document.getElementsByClassName("navbar-brand")[0].style.display = "inline";
        if (nav_side[0].offsetWidth > 100){
          nav_side[0].classList.add("mini");
          div_body[0].classList.add("full");
          // setTimeout(function(){
            let text = document.getElementsByClassName("txt-menu");
            for (let i = 0; i < text.length; i++){
              text[i].style.display = "none";
            }

            let sub_menu = document.getElementsByClassName("nav-side-menu");
            for (let i = 0; i < sub_menu.length; i++){
              sub_menu[i].classList.remove("ps-5");
              sub_menu[i].classList.add("ps-4");
            }
          // }, 50);
        }else{
          nav_side[0].classList.remove("mini");
          div_body[0].classList.remove("full");
          setTimeout(function(){
            let text = document.getElementsByClassName("txt-menu");
            for (let i = 0; i < text.length; i++){
              text[i].style.display = "inline";
            }

            let sub_menu = document.getElementsByClassName("nav-sub-side-menu");
            for (let i = 0; i < sub_menu.length; i++){
              sub_menu[i].classList.remove("ps-4");
              sub_menu[i].classList.add("ps-5");
            }
          }, 300);
        }
    }
  }

  filterNoti(event){
    let type = document.querySelector('input[name="RadioNotification"]:checked').value;
    const filter = fetch(event.params["url"], {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.getCsrfToken()
      },
      body: JSON.stringify({"type": type}),
    }).then(response => {
        if (response.ok) {
            return response.text();
        }
    });

    filter.then((data) => {
      $(".div-noti-list").html('');
      $(".div-noti-list").html(data);
    });

  }

  getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').content;
  }
};
