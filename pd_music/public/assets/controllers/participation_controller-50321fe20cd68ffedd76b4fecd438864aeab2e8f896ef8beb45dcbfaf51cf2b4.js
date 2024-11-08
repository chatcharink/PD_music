import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'

export default class extends Controller {
    connect() {
        document.getElementById("participation-check-menu").classList.add("active");
        let participation_side = document.getElementById("participationMenu");
        if (!participation_side.classList.contains("show")){
            participation_side.classList.add("show");
        }
    }

    createSubject(event){
        event.preventDefault();

        let subject = document.getElementById("txt_subject");
        let class_period = document.getElementById("class_period");
        let valid_subject = true;
        let valid_class_period = true;
        let class_period_pattern = /^[0-9]/

        if (subject.value == ""){
            subject.style.border = "1px solid #d31414";
            subject.style.background = "#f7caca";
            valid_subject = false;
        }

        if (class_period.value == "" || !class_period_pattern.test(class_period.value)){
            class_period.style.border = "1px solid #d31414";
            class_period.style.background = "#f7caca";
            valid_class_period = false;
        }else {
            class_period.style.border = "1px solid #dee2e6";
            class_period.style.background = "#fff";
        }

        if (valid_subject && valid_class_period){
            const create_subject = fetch(event.target.action, {
                method: 'POST',
                body: new FormData(event.target),
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });
    
            create_subject.then((data) => {
                try{
                    result = JSON.parse(data);
                    this.alert(result["status"], result["message"]);
                } catch {
                    $(".div-card-subject").html("");
                    $(".div-card-subject").html(data);
                    this.clearAddSubject();
                    $("#close-icon-create-subject-dialog").click();
                    // Clear value in dialog
                    this.alert("success", "Add subject "+subject.value+" successfully");
                }
            });
        }
    }

    clearAddSubject(){
        document.getElementById("txt_subject").value = "";
        document.getElementById("class_period").value = "";
        document.getElementById("description").value = "";
    }

    createEvent(event){
        event.preventDefault();

        let event_name = document.getElementById("event_name");
        let date = document.getElementById("event_date");
        let valid_name = true;
        let valid_date = true;

        if (event_name.value == ""){
            event_name.style.border = "1px solid #d31414";
            event_name.style.background = "#f7caca";
            valid_name = false;
        }

        if (date.value == ""){
            date.style.border = "1px solid #d31414";
            date.style.background = "#f7caca";
            valid_date = false;
        }

        if (valid_name && valid_date){
            const create_event = fetch(event.target.action, {
                method: 'POST',
                body: new FormData(event.target),
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });
    
            create_event.then((data) => {
                try{
                    result = JSON.parse(data);
                    this.alert(result["status"], result["message"]);
                } catch {
                    $(".div-card-event").html("");
                    $(".div-card-event").html(data);
                    this.clearAddEvent();
                    $("#close-icon-create-event-dialog").click();
                    // Clear value in dialog
                    this.alert("success", "Add event "+event_name.value+" successfully");
                }
            });
        }
    }

    clearAddEvent(){
        document.getElementById("event_name").value = "";
        document.getElementById("event_date").value = "";
        document.getElementById("description").value = "";
    }

    openAddUserModal(event){
        let subject_id = event.params["subjectId"];
        let type = event.params["type"];
        document.getElementById("subject_id").value = subject_id;
        document.getElementById("type").value = type;
        let url = event.params["url"];

        const participate = fetch(url+"?subject_id="+subject_id+"&type="+type).then(response => {
            if (response.ok) {
              return response.text();
            }
          });
      
          participate.then((data) => {
            try{
                let result = JSON.parse(data);
                let arr_particate = result["participate"];
                let user_list = document.getElementsByClassName("div-user-list");
                for (let i = 0; i < user_list.length; i++){
                    let id = user_list[i].id.replace("user-list-", "");
                    if (arr_particate.includes(parseInt(id))){
                        user_list[i].classList.add("selected");
                    }else {
                        user_list[i].classList.remove("selected");
                    }
                }
            } catch(e) {
                console.log(e)
            }
        });
    }

    addUser(event){
        let div_user;
        let type;
        if (typeof event.params["id"] == "undefined"){
            let classroom = event.params["class"];
            div_user = document.getElementById("class-list-"+classroom);
            type = "class"
        } else {
            let id = event.params["id"];
            div_user = document.getElementById("user-list-"+id);
            type = "user";
        }

        if (div_user.classList.contains("selected")){
            return;
        }
        
        let div_user_child = div_user.children;

        if (div_user.classList.contains("active")){
            div_user_child[2].classList.remove("d-none");
            div_user_child[2].classList.add("d-inline");

            div_user_child[1].classList.add("d-none");
            div_user_child[1].classList.remove("d-inline");
            div_user.classList.remove("active");
        } else {
            div_user_child[1].classList.add("d-inline");
            div_user_child[1].classList.remove("d-none");

            div_user_child[2].classList.remove("d-inline");
            div_user_child[2].classList.add("d-none");
            div_user.classList.add("active");
        }

        let selected_user = document.getElementById("selected_user");
        selected_user.value = this.getSelectedUser(type);
        document.getElementById("add_by").value = type;
    }

    clearUser(){
        let user_list = document.getElementsByClassName("div-user-list");
        for (let i = 0; i < user_list.length; i++ ){
            user_list[i].classList.remove("active");
            let child = user_list[i].children;
            child[2].classList.remove("d-none");
            child[2].classList.add("d-inline");
            child[1].classList.add("d-none");
            child[1].classList.remove("d-inline");
        }
    }

    clearClass(){
        let class_list = document.getElementsByClassName("div-class-list");
        for (let i = 0; i < class_list.length; i++ ){
            class_list[i].classList.remove("active");
            let child = class_list[i].children;
            child[2].classList.remove("d-none");
            child[2].classList.add("d-inline");
            child[1].classList.add("d-none");
            child[1].classList.remove("d-inline");
        }
    }

    getSelectedUser(type){
        let users = document.getElementsByClassName("div-"+type+"-list");
        let arr_user = [];
        for (let i = 0; i < users.length; i++){
            if (users[i].classList.contains("active")){
                arr_user.push(users[i].getAttribute("data-value"));
            }
        }
        return arr_user
    }

    submitAddUser(event){
        let selected_user = document.getElementById("selected_user");
        let url = event.params["url"];
        let state = document.getElementById("type");
        let type = document.getElementById("add_by");
        let subject_id = document.getElementById("subject_id");
        let is_edit = document.getElementById("is_edit");

        const add_user = fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": this.getCsrfToken()
            },
            body: JSON.stringify({ "subject_id": subject_id.value, "users": selected_user.value, "type": type.value, "page": is_edit.value, "state": state.value}),
        }).then(response => {
            if (response.ok) {
                return response.text();
            }
        });

        add_user.then((data) => {
            try{
                let result = JSON.parse(data);
                if (is_edit.value != ""){
                    window.location.replace(is_edit.value);
                } else {
                    this.alert(result["status"], result["message"]);
                }
            } catch(e) {
                console.log(e);
                $(".div-add-user-modal").html("");
                $(".div-add-user-modal").html(data);
                this.alert("success", "Add users to "+state.value+" successfully");
            }
        });

    }

    checkName(event){
        let url = event.params["url"];
        const show = fetch(url).then(response => {
            if (response.ok) {
                return response.text();
            }
        });
      
        show.then((data) => {
            try{
                let result = JSON.parse(data);
            } catch {
                $("#div-body-subject").html("");
                $("#div-body-subject").html(data);
            }
        });
    }

    setDeleteId(event){
        let id = event.params["subjectId"];
        let name = event.params["name"];
        let type = event.params["type"];

        document.getElementById("delete-subject-name").innerHTML = type+" : "+name;
        document.getElementById("confirm-delete-subject").setAttribute("data-id", id);
        document.getElementById("confirm-delete-subject").setAttribute("data-type", type);
        document.getElementById("confirm-delete-subject").setAttribute("data-name", name);
    }

    deleteSubject(){
        let id = document.getElementById("confirm-delete-subject").getAttribute("data-id");
        let type = document.getElementById("confirm-delete-subject").getAttribute("data-type");
        let name = document.getElementById("confirm-delete-subject").getAttribute("data-name");
        let application_path = document.getElementById("application-path");
        let url = application_path.value+"/participation/"+id
        const delete_subject = fetch(url, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": this.getCsrfToken()
            },
            body: JSON.stringify({ "type": type, "name": name }),
        }).then(response => {
            if (response.ok) {
                return response.text();
            }
        });

        delete_subject.then((data) => {
            try{
                let result = JSON.parse(data);
                this.alert(result["status"], result["message"]);
            } catch {
                $("#close-confirm-delete-subject").click();
                $(".div-card-"+type).html("");
                $(".div-card-"+type).html(data);
                this.alert("success", "Delete "+type+" : "+name+" successfully");
                // $("#div-body-subject").html(data);
            }
        });
    }

    alert(type, message){
        let toast_container = document.getElementsByClassName("toast-container")[0];
    
        let toast = document.createElement("div");
        toast.setAttribute("class", "toast show");
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
