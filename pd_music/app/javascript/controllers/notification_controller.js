import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    connect() {
        document.getElementById("notification").classList.add("active");
        let setting = document.getElementById("settingMenu");
        if (!setting.classList.contains("show")){
            setting.classList.add("show");
        }
    }

    save_notification(event) {
        let url = event.params["url"];
        let check_box = document.getElementsByClassName("noti-toggle-checkbox");
        let arr_noti_setting = [];
        for (let i = 0; i < check_box.length; i++){
            let id = check_box[i].getAttribute("data-id");
            let permission_id = check_box[i].getAttribute("data-permission-id");
            let json_check = {};
            if (check_box[i].checked){
                json_check = {"id": id, "permission_id": permission_id, "status": 1};
            }else{
                json_check = {"id": id, "permission_id": permission_id, "status": 0};
            }
            arr_noti_setting.push(json_check);
        }
        this.postnotification(url, arr_noti_setting);
    }

    postnotification(url, body){
        const permission = fetch(url, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": this.getCsrfToken()
            },
            body: JSON.stringify({"notification": body}),
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
}
