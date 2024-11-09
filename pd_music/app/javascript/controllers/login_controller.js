import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    connect() {
        responsive();
        window.addEventListener('resize', responsive);

        function responsive(){
            let width = screen.width;
            if (width < 770){
                document.getElementById("div-login").classList.remove("w-35");
                document.getElementById("div-login").classList.add("w-90");
            } else {
                document.getElementById("div-login").classList.remove("w-90");
                document.getElementById("div-login").classList.add("w-35");
            }
        }
    }

    forgotPassword(event) {
        event.preventDefault();
        
        let url = document.getElementById("forgot-password-btn").getAttribute("data-url");
        
        const forgot_password = fetch(url).then(response => {
            if (response.ok) {
                return response.text();
            }
        });

        forgot_password.then((data) => {
            try{
                let result = JSON.parse(data);
            } catch {
                document.getElementById("login-box").innerHTML = data;
            }
        });
        
    }

    onPostSuccess(event){
        event.preventDefault();

        let email = document.getElementById("email");
        let pattern_email = /^([0-9a-zA-Z]([-_.\w]*[0-9a-zA-Z-_.])*@([0-9a-zA-Z]*)[\.][a-zA-Z]{2,9}([\.][a-zA-Z]{2,9})?)$|![@-]{2}/;
        let application_path = document.getElementById("application-path");

        if (pattern_email.test(email.value)){
            let btn = document.getElementById("btn-send-forgot");
            let loading = document.createElement("span");
            loading.setAttribute("class", "spinner-border spinner-border-sm");
            loading.setAttribute("role", "status");
            loading.setAttribute("aria-hidden", "true");

            btn.insertBefore(loading, btn.firstChild);
            btn.disabled = true;
            const forgot_password = fetch(event.target.action, {
                method: 'POST',
                body: new FormData(event.target),
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });

            forgot_password.then((data) => {
                try{
                    let result = JSON.parse(data);
                    let application_path = document.getElementById("application-path");
                    if (result["state"] == "success"){
                        window.location.replace(application_path.value+"/login");
                    }else{
                        email.value = "";
                        email.style.border = "1px solid #d31414";
                        email.style.background = "#f7caca";
                        btn.disabled = false;
                        loading.remove();
                        
                        this.alert(result["state"], result["message"]);
                    }
                    
                } catch {
                    window.location.replace(application_path.value+"/login");
                    this.alert("error", "Something was wrong. Please contact admin");
                }
            });
        }else {
            email.value = "";
            email.style.border = "1px solid #d31414";
            email.style.background = "#f7caca";
            this.alert("error", "Email is invalid value or empty");
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
}