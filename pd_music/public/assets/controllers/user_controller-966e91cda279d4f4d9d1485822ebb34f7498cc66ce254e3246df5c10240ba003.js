import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'
import DataTable from 'datatables.net-bs5'
// import 'datatables.net-buttons-bs5'
// import 'datatables.net-buttons-html5'

export default class extends Controller {
  static targets = [ "password", "confirmPassword", "studentYear", "musicInstrument" ]

  connect() {
    document.getElementById("user-menu").classList.add("active");

    $("#table-user-list").DataTable({
        pagingType: "full_numbers",    
        pageLength: 15,
        destroy: true,
        processing: true,
        serverSide: true,
        ordering: false,
        dom: '<tp>',
        ajax: { url: $("#table-user-list").data('url') },
        columnDefs: [{'targets': [0], 'className': "text-center"}],
        columns: [
            { data: 'picture' },
            { data: 'name' },
            { data: 'class' },
            { data: 'room' },
            { data: 'status' },
            { data: 'role' },
            { data: 'action' }
        ]
    });
  }

  filter(){
    if( $(".div-filter-user").css('display') == 'none'){
      $(".div-filter-user").slideDown(3);
    } else {
      $(".div-filter-user").slideUp(3);
    }
  }

  searchUser(){
    let user_name = document.getElementById("search-name");
    let status = document.getElementById("search-status");

    // console.log(user_name);
    let table = $("#table-user-list").DataTable({
      pagingType: "full_numbers",    
      pageLength: 15,
      destroy: true,
      processing: true,
      serverSide: true,
      dom: '<tp>',
      ajax: { 
        url: $("#table-user-list").data('url'),
        contentType: "application/json",
        data: {
          "user_name": user_name.value, "status": status.value
        }
      },
      columnDefs: [{'targets': [0], 'className': "text-center"}],
      columns: [
          { data: 'picture' },
          { data: 'name' },
          { data: 'class' },
          { data: 'room' },
          { data: 'status' },
          { data: 'role' },
          { data: 'action' }
      ]
    });
    table.columns.adjust().draw();
  }

  uploadAvatar(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const wrapper = event.target.closest(".canva-profile-photo");


    reader.onloadend = () => {
      document.getElementById('avatar_profile').src = reader.result;
      document.getElementById('avatar_profile').style.width = "200px";
      document.getElementById('avatar_profile').style.height = "200px";
    };

    if (file) {
      reader.readAsDataURL(file);
      // this.saveAvatar(file, wrapper);
    }
  }

  getAge(){
    let dob = document.getElementById("dob");
    if (dob.value !== ""){
      let today = new Date();
      let birthDate = new Date(dob.value);
      let age = today.getFullYear() - birthDate.getFullYear();
      let m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
        m = birthDate.getMonth() - today.getMonth();
      }
      document.getElementById("age_txt").value = age+" ปี "+m+" เดือน";
      document.getElementById("age").value = age+"_"+m;
    }
  }

  selectStudyYear(){
    let student_year = document.getElementById("study_year");
    let year = student_year.options[student_year.selectedIndex].text;
    let others_select = document.getElementById("other_study");
    if (year == "อื่นๆ"){
      others_select.disabled = false;
    }else {
      others_select.value = "";
      others_select.disabled = true;
    }
  }

  selectMusicInstrument(){
    let music_instrument = document.getElementById("musical_instrument");
    let music = music_instrument.value;
    let others_select = document.getElementById("others_musical_instrument");
    if (music == 14){
      others_select.disabled = false;
    }else {
      others_select.value = "";
      others_select.disabled = true;
    }
  }

  validatePassword(){
    let password = this.passwordTargets[0];
    let upper_characters_pattern = /[A-Z]+/;
    let lower_characters_pattern = /[a-z]+/;
    let number_pattern = /[0-9]+/;
    let spacial_characters_pattern = /[\\~\\`\\!\\@\\#\\$\\%\\^\\&\\*\\_\\-\\+\\=\\:\\;\\"\\'\\,\\.\\?]/;
    let password_rule = document.getElementsByClassName("password-rule");
    let is_valid_password = true;

    if (password.value.length >= 8){
        this.set_icon_correct(password_rule[0]);
    }else{
        this.set_icon_x(password_rule[0]);
        is_valid_password = false;
    }

    if ( upper_characters_pattern.test(password.value) && lower_characters_pattern.test(password.value)){
        this.set_icon_correct(password_rule[1]);
    }else{
        this.set_icon_x(password_rule[1]);
        is_valid_password = false;
    }

    if ( number_pattern.test(password.value)){
        this.set_icon_correct(password_rule[2]);
    }else{
        this.set_icon_x(password_rule[2]);
        is_valid_password = false;
    }

    if ( spacial_characters_pattern.test(password.value)){
        this.set_icon_correct(password_rule[3]);
    }else{
        this.set_icon_x(password_rule[3]);
        is_valid_password = false;
    }

    if (is_valid_password){
      this.valid_value(password);
      document.getElementById("password_valid").value = 1;
      this.enableSetPassword()
    }
  }

  enableSetPassword(){
    let is_valid = document.getElementById("password_valid").value;
    let password = document.getElementById("password");
    let confirm_password = document.getElementById("confirm_password");

    if ((password.value == confirm_password.value) && is_valid > 0){
      document.getElementById("btn-set-user-password").disabled = false;
    }else {
      document.getElementById("btn-set-user-password").disabled = true;
    }
  }

  set_icon_correct(elem){
    let icon_x = elem.getElementsByClassName("bi-x-circle-fill");
    icon_x[0].style.display = "none";
    let icon_correct = elem.getElementsByClassName("bi-check-lg");
    icon_correct[0].style.display = "inline";
    elem.style.color = "#3faf49";
  }

  set_icon_x(elem){
    let icon_x = elem.getElementsByClassName("bi-x-circle-fill");
    icon_x[0].style.display = "inline";
    let icon_correct = elem.getElementsByClassName("bi-check-lg");
    icon_correct[0].style.display = "none";
    elem.style.color = "#d31414";
  }

  invalid_value(elem, clear_rule=false){
    elem.style.border = "1px solid #d31414";
    elem.style.background = "#f7caca";
    elem.value = "";
    if (clear_rule){
      let password_rule = document.getElementsByClassName("password-rule");
      for( let i = 0; i < password_rule.length; i++){
          this.set_icon_x(password_rule[i]);
      }
    }
    
  }

  valid_value(elem){
    elem.style.border = "1px solid #dee2e6";
    elem.style.background = "#fff";
  }

  showPassword(){
    document.getElementById("password").type = "text";
  }

  hidePassword(){
    document.getElementById("password").type = "password";
  }

  showConfirmPassword(){
    document.getElementById("confirm_password").type = "text";
  }

  hideConfirmPassword(){
    document.getElementById("confirm_password").type = "password";
  }

  setPassword(){
    let password = document.getElementById("password");
    document.getElementById("correct_password").value = password.value;
  }

  onUpdateUser(event){
    event.preventDefault();

    let username = document.getElementById("username");
    let password = document.getElementById("correct_password");
    let firstname = document.getElementById("firstname");
    let lastname = document.getElementById("lastname");
    let dob = document.getElementById("dob");
    let age = document.getElementById("age_txt");
    let study_class = document.getElementById("study_year");
    let room = document.getElementById("room");
    let student_no = document.getElementById("student_no");
    let email = document.getElementById("email");
    let phone_number = document.getElementById("phone_number");
    let musical_instrument = document.getElementById("musical_instrument");
    let role = document.getElementById("role");
    let status = document.getElementById("status");

    let all_valid = [];
    let pattern_username = /[a-zA-z0-9]+/;
    if (pattern_username.test(username.value)){
      all_valid.push("true");
      this.valid_value(username);
    }else{
      all_valid.push("false");
      this.invalid_value(username);
      this.alert("error", "Username should not be blank or include special characters");
    }

    if (password.value != ""){
      all_valid.push("true");
      this.valid_value(password);
    }else{
      all_valid.push("false");
      this.invalid_value(password);
      this.alert("error", "Password is not match password rule");
    }

    if (firstname.value != ""){
      all_valid.push("true");
      this.valid_value(firstname);
    }else {
      all_valid.push("false");
      this.invalid_value(firstname);
      this.alert("error", "Firstname should not be blank");
    }

    if (lastname.value != ""){
      all_valid.push("true");
      this.valid_value(lastname);
    }else {
      all_valid.push("false");
      this.invalid_value(lastname);
      this.alert("error", "Lastname should not be blank");
    }

    if (age.value != ""){
      all_valid.push("true");
      this.valid_value(dob);
    }else {
      all_valid.push("false");
      this.invalid_value(dob);
      this.alert("error", "Age should not be blank. Please select date of birth");
    }

    if (study_class.value != ""){
      all_valid.push("true");
      study_class.style.border = "1px solid #dee2e6";
    }else {
      all_valid.push("false");
      study_class.style.border = "1px solid #d31414";
      this.alert("error", "Please select class");
    }

    if (musical_instrument.value != ""){
      all_valid.push("true");
      musical_instrument.style.border = "1px solid #dee2e6";
    }else {
      all_valid.push("false");
      musical_instrument.style.border = "1px solid #d31414";
      this.alert("error", "Please select musical instrument");
    }

    let pattern_room_and_no = /[0-9]+/
    if (pattern_room_and_no.test(room.value)){
      all_valid.push("true");
      this.valid_value(room);
    }else {
      all_valid.push("false");
      this.invalid_value(room);
      this.alert("error", "Room could not be blank");
    }

    if (pattern_room_and_no.test(student_no.value)){
      all_valid.push("true");
      this.valid_value(student_no);
    }else {
      all_valid.push("false");
      this.invalid_value(student_no);
      this.alert("error", "Student number could not be blank");
    }

    let pattern_phone_no = /^[0-9]{10}/;
    let pattern_email = /^([0-9a-zA-Z]([-_.\w]*[0-9a-zA-Z-_.])*@([0-9a-zA-Z]*)[\.][a-zA-Z]{2,9}([\.][a-zA-Z]{2,9})?)$|![@-]{2}/;
    let valid_phonenumber = pattern_phone_no.test(phone_number.value.replace(/-/, ""));
    let valid_email = pattern_email.test(email.value);
    if (!valid_phonenumber){
      all_valid.push("false");
      this.invalid_value(phone_number);
      this.alert("error", "Phone number should not be empty.");
    }else{
      all_valid.push("true");
      this.valid_value(phone_number);
    }

    if (!valid_email){
      all_valid.push("false");
      this.invalid_value(email);
      this.alert("error", "Email should not be empty.");
    }else{
      all_valid.push("true");
      this.valid_value(email);
    }

    if (role.value != ""){
      all_valid.push("true");
      role.style.border = "1px solid #dee2e6";
    }else {
      all_valid.push("false");
      role.style.border = "1px solid #d31414";
      this.alert("error", "Please select role");
    }

    if (status.value != ""){
      all_valid.push("true");
      status.style.border = "1px solid #dee2e6";
    }else {
      all_valid.push("false");
      status.style.border = "1px solid #d31414";
      this.alert("error", "Please select status");
    }

    if (!all_valid.includes("false")){
      const save_user = fetch(event.target.action, {
        method: 'POST',
        body: new FormData(event.target),
      }).then(response => {
          if (response.ok) {
              return response.text();
          }
      });

      save_user.then((data) => {
        try{
          let res = JSON.parse(data);
          if (res["status"] == "error"){
            this.alert("error", res["message"]);
          } else {
            window.location.replace(event.params["url"]);
          }
        } catch(e) {
          console.log(e);
        }
      });
    }
  }

  alert(type, message){
    let toast_container = document.getElementsByClassName("toast-container")[0];

    let toast = document.createElement("div");
    toast.setAttribute("class", "toast show")
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    let toast_header = document.createElement("div");
    toast_header.setAttribute("class", "toast-header toast-header-js");
    let icon = this.alert_icon(type);
    toast_header.innerHTML += icon;

    let toast_header_title = document.createElement("strong");
    let alert_title = type.charAt(0).toUpperCase() + type.slice(1);
    toast_header_title.setAttribute("class", "me-auto ms-2 text-"+type);
    toast_header_title.innerHTML += alert_title;
    toast_header.appendChild(toast_header_title);

    let close_icon = document.createElement("button");
    close_icon.setAttribute("type", "button");
    close_icon.setAttribute("class", "btn-close");
    close_icon.setAttribute("data-bs-dismiss", "toast");
    close_icon.setAttribute("aria-label", "Close");
    toast_header.appendChild(close_icon);

    let div_message = document.createElement("div");
    div_message.setAttribute("class", "toast-body toast-body-"+type);
    div_message.innerHTML += message;

    toast.appendChild(toast_header);
    toast.appendChild(div_message);
    toast_container.appendChild(toast);

    setTimeout(function(){
        toast.remove();
    }, 5000);
  }

  alert_icon(state){
      let icon = ""
      switch(state){
          case "success":
              icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill alert-icon-success" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>';
              break;
          case "error":
              icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill alert-icon-error" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/></svg>';
              break;
      }
      return icon
  }
};
