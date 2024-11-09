import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    document.getElementById("report-menu").parentNode.classList.add("active");
  }
};
