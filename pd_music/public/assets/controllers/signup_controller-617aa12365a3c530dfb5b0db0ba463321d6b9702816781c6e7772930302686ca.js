import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = [ "password", "confirmPassword", "studentYear", "musicInstrument", "province" ]

    onPostSuccess(event) {
        event.preventDefault();
        let username = document.getElementById("username");
        let password = document.getElementById("password");
        let confirm_password = document.getElementById("confirm_password");
        let password_valid = document.getElementById("password_valid");

        let valid_username = false
        let pattern_username = /[a-zA-z0-9]+/;
        if (pattern_username.test(username.value)){
            valid_username = true
            this.valid_value(username);
        }else{
            this.invalid_value(username);
        }
        
        if (valid_username && password.value !== "" && confirm_password.value !== "" && password_valid.value == 1){
            if (password.value == confirm_password.value){
                this.valid_value(password);
                this.valid_value(confirm_password);
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
                        if (res["error"] == "duplicate"){
                            this.invalid_value(username);
                            this.invalid_value(password, true);
                            this.invalid_value(confirm_password);
                            this.alert("error", "Username: "+username.value+" already exists.");
                        }
                    } catch {
                        document.getElementById("div-form-signup").innerHTML = data;
                    }
                });
            }else {
                // clear password
                this.invalid_value(password, true);
                this.invalid_value(confirm_password);
                this.alert("error", "Confirm password is not match to password");
            }
        } else {
            if (username.value !== ""){
                username.style.border = "1px solid #dee2e6";
                username.style.background = "#fff";
            }else {
                username.style.border = "1px solid #d31414";
                username.style.background = "#f7caca";
                this.alert("error", "Username is invalid or empty.");
            }
            this.invalid_value(password, true);
            this.invalid_value(confirm_password);
            this.alert("error", "Password is invalid or empty.");
        }
    }

    onPostSuccessUser(event){
        event.preventDefault();
        let firstname = document.getElementById("firstname");
        let lastname = document.getElementById("lastname");
        let dob = document.getElementById("dob");
        let phone_no = document.getElementById("phone_number");
        let email = document.getElementById("email");
        let select_class = document.getElementById("study_year");
        let select_musical = document.getElementById("musical_instrument");
        
        let pattern_phone_no = /^[0-9]{10}/;
        let pattern_email = /^([0-9a-zA-Z]([-_.\w]*[0-9a-zA-Z-_.])*@([0-9a-zA-Z]*)[\.][a-zA-Z]{2,9}([\.][a-zA-Z]{2,9})?)$|![@-]{2}/;
        
        let valid_firstname = false;
        let valid_lastname = false;
        let valid_dob = false;
        let valid_select_class = false;
        let valid_select_musical = false;
        let valid_phonenumber = pattern_phone_no.test(phone_no.value.replace(/-/, ""));
        let valid_email = pattern_email.test(email.value);

        if (firstname.value == ""){
            this.invalid_value(firstname);
            this.alert("error", "First name should not empty.");
        }else{
            this.valid_value(firstname);
            valid_firstname = true;
        }

        if (lastname.value == ""){
            this.invalid_value(lastname);
            this.alert("error", "Last name should not empty.");
        }else{
            this.valid_value(lastname);
            valid_lastname = true;
        }

        if (dob.value == ""){
            this.invalid_value(dob);
            this.alert("error", "Date of birth should not empty.");
        }else{
            this.valid_value(dob);
            valid_dob = true;
        }

        if (!valid_phonenumber){
            this.invalid_value(phone_no);
            this.alert("error", "Phone number should not empty.");
        }else{
            this.valid_value(phone_no);
        }

        if (!valid_email){
            this.invalid_value(email);
            this.alert("error", "Email should not empty.");
        }else{
            this.valid_value(email);
        }

        if (select_class.value == ""){
            select_class.style.border = "1px solid #d31414";
            this.alert("error", "Please select your study class");
        }else {
            select_class.style.border = "1px solid #dee2e6";
            valid_select_class = true
        }

        if (select_musical.value == ""){
            select_musical.style.border = "1px solid #d31414";
            this.alert("error", "Please select your music instrument");
        }else {
            select_musical.style.border = "1px solid #dee2e6";
            valid_select_musical = true
        }

        if (valid_firstname && valid_lastname && valid_dob && valid_phonenumber && valid_email && valid_select_class && valid_select_musical){
            const save_user = fetch(event.target.action, {
                method: 'POST',
                headers: {
                    "X-CSRF-Token": this.getCsrfToken()
                },
                body: new FormData(event.target),
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });
    
            save_user.then((data) => {
                try{
                    let res = JSON.parse(data);
                    if (res["error"] == "duplicate"){
                        this.invalid_value(email);
                        this.alert("error", "Email: "+email.value+" already exists.");
                    }
                } catch {
                    document.getElementById("div-form-signup").innerHTML = data;
                }
            });
        }

        
    }

    onPostSuccessParent(event){
        event.preventDefault();

        let firstname = document.getElementById("firstname");
        let lastname = document.getElementById("lastname");
        let phone_no = document.getElementById("phone_number");
        let select_relation = document.getElementById("relation");

        let pattern_phone_no = /^[0-9]{10}/;

        let valid_firstname = false;
        let valid_lastname = false;
        let valid_select_relation = false;
        let valid_phonenumber = pattern_phone_no.test(phone_no.value.replace(/-/, ""));

        if (firstname.value == ""){
            this.invalid_value(firstname);
            this.alert("error", "First name of parents should not empty.");
        }else{
            this.valid_value(firstname);
            valid_firstname = true;
        }

        if (lastname.value == ""){
            this.invalid_value(lastname);
            this.alert("error", "Last name of parents should not empty.");
        }else{
            this.valid_value(lastname);
            valid_lastname = true;
        }

        if (!valid_phonenumber){
            this.invalid_value(phone_no);
            this.alert("error", "Phone number of parents should not empty.");
        }else{
            this.valid_value(phone_no);
        }

        if (select_relation.value == ""){
            select_relation.style.border = "1px solid #d31414";
            this.alert("error", "Please select relation with your parent");
        }else {
            select_relation.style.border = "1px solid #dee2e6";
            valid_select_relation = true
        }

        let application_path = document.getElementById("application-path");
        if (valid_firstname && valid_lastname && valid_phonenumber && valid_select_relation){
            const save_user = fetch(event.target.action, {
                method: 'POST',
                headers: {
                    "X-CSRF-Token": this.getCsrfToken()
                },
                body: new FormData(event.target),
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });

            save_user.then((data) => {
                try{
                    let res = JSON.parse(data);
                    if (res["error"] == "db error"){
                        // this.invalid_value(email);
                        window.location.replace(application_path.value+"/login");
                    }
                } catch {
                    document.getElementById("div-form-signup").innerHTML = data;
                }
            });
        }
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
  
    connect() {
        responsive();
        window.addEventListener('resize', responsive);

        function responsive(){
            let width = screen.width;
            if (width < 770){
                document.getElementById("register-info").style.display = "none";
                document.getElementById("div-form-signup").classList.remove("col-6");
                document.getElementById("div-form-signup").classList.add("col-12");
            } else {
                document.getElementById("register-info").style.display = "block";
                document.getElementById("div-form-signup").classList.remove("col-12");
                document.getElementById("div-form-signup").classList.add("col-6");
                const swiper = new Swiper('.swiper', {
                    // Optional parameters
                    // direction: 'vertical',
                    loop: true,
                
                    // If we need pagination
                    pagination: {
                        el: '.swiper-pagination',
                    },
                
                    // Navigation arrows
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    autoplay: {
                        delay: 5000,
                    }
                
                    // And if we need scrollbar
                    // scrollbar: {
                    //   el: '.swiper-scrollbar',
                    // },
                });
            }
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

    validateNewPassword(){
        let password = document.getElementById("password");
        let confirm_password = document.getElementById("confirm_password");
        let password_valid = document.getElementById("password_valid");
        console.log(document.getElementById("submit-change-password"));

        if (password_valid.value == 1 && (password.value == confirm_password.value)){
            this.valid_value(password);
            this.valid_value(confirm_password);
            document.getElementById("submit-change-password").click(); 
        }else {
            // clear password
            this.invalid_value(password, true);
            this.invalid_value(confirm_password);
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
            document.getElementById("year").value = age;
            document.getElementById("month").value = m;
        }
    }

    selectStudyYear(){
        let student_year = document.getElementById("study_year");
        let year = student_year.options[student_year.selectedIndex].text;
        let others_select = document.getElementById("div-other_study_year");
        if (year == "อื่นๆ"){
            others_select.style.display = "block";
        }else {
            others_select.style.display = "none";
        }
    }

    selectMusicInstrument(){
        let music_instrument = document.getElementById("musical_instrument");
        let music = music_instrument.value;
        let others_select = document.getElementById("div-other_musical_instrument");
        if (music == 14){
            others_select.style.display = "block";
        }else {
            others_select.style.display = "none";
        }
    }

    selectProvince(){
        let selected_province = document.getElementById("address-province");
        let province = selected_province.value;
        let application_path = document.getElementById("application-path");
        fetch(application_path.value+'/mapping_data/province_district_mapping.json')
            .then(response => response.json())
            .then(data => addOption(data[province]))
            .catch(error => console.error('Error fetching JSON:', error));
        
        function addOption(data){
            let select_district = document.getElementById("address-district");
            for (let i = 0; i<= data.length-1; i++){
                let opt = document.createElement('option');
                opt.value = data[i];
                opt.innerHTML = data[i];
                select_district.appendChild(opt);
            }
            select_district.disabled = false;
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

    getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
    }
};
