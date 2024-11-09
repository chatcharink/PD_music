import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    connect() {
        document.getElementById("permission").classList.add("active");
        let setting = document.getElementById("settingMenu");
        if (!setting.classList.contains("show")){
            setting.classList.add("show");
        }
    }

    save_permission(event) {
        let url = event.params["url"];
        let check_box = document.getElementsByClassName("check-permission");
        let arr_permission = [];
        for (let i = 0; i < check_box.length; i++){
            let id = check_box[i].getAttribute("data-id");
            let permission_id = check_box[i].getAttribute("data-permission-id");
            let role_id = this.get_role_id(check_box[i].getAttribute("data-role"));
            let json_check = {};
            if (check_box[i].checked){
                json_check = {"id": id, "permission_id": permission_id, "role_id": role_id, "status": 1};
            }else{
                json_check = {"id": id, "permission_id": permission_id, "role_id": role_id, "status": 0};
            }
            arr_permission.push(json_check);
        }
        this.postPermission(url, arr_permission);
    }

    postPermission(url, body){
        const permission = fetch(url, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": this.getCsrfToken()
            },
            body: JSON.stringify({"permission": body}),
        }).then(response => {
            if (response.ok) {
                return response.text();
            }
        });
      
        permission.then((data) => {
            try{
                let result = JSON.parse(data);
                window.location.reload();
            } catch {
            
            }
        });

    }

    getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
    }

    get_role_id(role){
        let role_id = 0;
        switch(role){
            case "admin":
                role_id = 1;
                break;
            case "teacher":
                role_id = 2;
                break;
            case "student":
                role_id = 3;
                break;
        } 
        return role_id
    }
}
