import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    connect() {
        // this.element.textContent = "Hello World!"
        document.getElementById("upload_profile_pic_btn").click();
    }

    uploadAvatar(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        const wrapper = event.target.closest(".canva-profile-photo");

        if (typeof file == "undefined"){
            document.getElementById("upload-profile-btn").disabled = true;
        }

        reader.onloadend = () => {
            document.getElementById("avatar_profile").src = reader.result;
            document.getElementById("avatar_profile").style.width = "300px";
            document.getElementById("avatar_profile").style.height = "300px";
            document.getElementById("upload-profile-btn").disabled = false;
        };

        if (file) {
            reader.readAsDataURL(file);
        // this.saveAvatar(file, wrapper);
        }
    }

    onUploadSuccess(event){
        event.preventDefault();
        const upload = fetch(event.target.action, {
            method: 'POST',
            body: new FormData(event.target),
        }).then(response => {
            if (response.ok) {
                return response.text();
            }
        });

        upload.then((data) => {
            let res = JSON.parse(data);
            let close_btn = document.getElementById("upload-profile-close-btn");
            close_btn.click();
            if (res["state"] == "success"){
                this.alert(res["state"], res["message"]);
            }
            document.getElementById("div-profile-pic-upload-dialog").remove();
        });
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
