import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = [ "password", "confirmPassword" ]

    connect() {
        responsive();
        window.addEventListener('resize', responsive);

        function responsive(){
            let width = screen.width;
            if (width < 770){
                document.getElementsByClassName("div-body")[0].classList.remove("w-35");
                document.getElementsByClassName("div-body")[0].classList.add("w-90");
            } else {
                document.getElementsByClassName("div-body")[0].classList.remove("w-90");
                document.getElementsByClassName("div-body")[0].classList.add("w-35");
            }
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
