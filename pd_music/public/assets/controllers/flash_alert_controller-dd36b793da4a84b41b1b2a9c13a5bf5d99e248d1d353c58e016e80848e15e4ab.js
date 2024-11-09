import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["toast"]

  connect() {
    let toast = this.toastTargets;
    toast[0].classList.remove("hide");
    toast[0].classList.add("show");
    
    setTimeout(function(){
        toast[0].classList.remove("show");
        toast[0].classList.add("hide");
    }, 5000);
  }
};
