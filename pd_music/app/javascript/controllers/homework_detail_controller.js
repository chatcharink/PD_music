import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'
import "select2"
import DataTable from 'datatables.net-bs5'

const arr_chord = {};

export default class extends Controller {
    connect() {
        document.getElementById("do-homework-menu").classList.add("active");
        let homework_side = document.getElementById("homeworkMenu");
        if (!homework_side.classList.contains("show")){
            homework_side.classList.add("show");
        }
        this.datatable();
    }

    datatable(){
        let table = $("#table-detail-homework-list").DataTable({
            pagingType: "full_numbers",    
            pageLength: 15,
            destroy: true,
            processing: true,
            serverSide: true,
            dom: '<tp>',
            ajax: { url: $("#table-detail-homework-list").data('url') },
            columnDefs: [{'targets': [5], 'className': "text-center"}],
            columns: [
                { data: 'id' },
                { data: 'name' },
                { data: 'subject' },
                { data: 'homework' },
                { data: 'status' },
                { data: 'estimatedDate' },
            ],
            rowCallback: function (row, data) {
                let status = $(row).find(".homework-status-text").text();
                let has_permission = document.getElementById("permission-review");
                if (status == "Send"){
                    let homework_id = $(row).find(".homework_id").val();
                    let homework_mapping_id = $(row).find(".homework_mapping_id").val();
                    let user_id = $(row).find(".user_id").val();
                    if (has_permission.value == "true"){
                        row.setAttribute("data-action", "click->homework-detail#review_homework");
                        row.setAttribute("data-homework-detail-id-param", homework_id);
                        row.setAttribute("data-homework-detail-homework-mapping-id-param", homework_mapping_id);
                        row.setAttribute("data-homework-detail-user-id-param", user_id);
                    }
                }

                let arr_checked = $("#store-checked-user").val().split(",");
                let checkbox =  $('td:eq(0)', row).find(".check-user-detail").val();

                if (arr_checked.includes(checkbox)){
                    $('td:eq(0)', row).find(".check-user-detail").prop("checked", true);
                }
            }
        
        });
    }

    detailScore(event){
        let url = event.params["url"];
        const get_score = fetch(url).then(response => {
            if (response.ok) {
              return response.text();
            }
        });

        get_score.then((data) => {
            try{
                let result = JSON.parse(data);
                if (result["state"] == "success"){
                    let application_path = document.getElementById("application-path");
                    window.location.replace(application_path.value+"/homework");
                } else {
                    this.alert(result["state"], result["message"]);
                }
            }catch(error){
                $("#score-panel").html("");
                $("#score-panel").html(data);
                let table = $("#table-score-detail").DataTable({
                    scrollX: true,//"1100px",
                    scrollY: "600px",
                    scrollCollapse: true,
                    paging: false,
                    ordering: false,
                    fixedColumns: {
                        leftColumns: 3,
                    },
                    dom: '<t>',
                    destroy: true
                });
            }
        });
    }

    review_homework(event){
        let id = event.params["id"];
        let homework_mapping_id = event.params["homeworkMappingId"];
        let user_id = event.params["userId"];
        let application_path = document.getElementById("application-path");
        let url = application_path.value+"/homework/do/review_homework";
        url = url+"?id="+id+"&homework_mapping="+homework_mapping_id+"&user_id="+user_id;

        const review = fetch(url).then(response => {
            if (response.ok) {
                return response.text();
            }
        });

        review.then((data) => {
            try{
                let result = JSON.parse(data);
                if (result["state"] == "success"){
                    // let application_path = document.getElementById("application-path");
                    // window.location.replace(application_path.value+"/homework");
                } else {
                    this.alert(result["state"], result["message"]);
                }
            }catch(error){
                $(".div-check-homework-dialog").html("");
                $(".div-check-homework-dialog").html(data);
                $("#btn-check-homework-dialog").click();
            }
        });
    }

    rejectHomework(event){
        let url = event.params["url"];
        let answer_id = event.params["answerId"];
        let reject_reason = document.getElementById("reject-reason");

        const reject = fetch(url, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": this.getCsrfToken()
            },
            body: JSON.stringify({"reason": reject_reason.value, "answer_id": answer_id}),
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });
      
        reject.then((data) => {
            try{
                let result = JSON.parse(data);
                console.log(result);
                window.location.replace(result["redirect_url"]);
            }catch(error){
                console.log(error);
                // $(".div-table-detail-homework").html("");
                // $(".div-table-detail-homework").html(data);
                // this.alert("success", "Update homework status successfully");
            }
        });
    }

    giveScore(event){
        event.preventDefault();
        let score = document.getElementById("score");
        let full_score = document.getElementById("full-question-score");

        if (/[0-9]/.test(score.value) && score.value <= full_score.value){
            this.valid_value(score);
            const give_score = fetch(event.target.action, {
                method: 'POST',
                body: new FormData(event.target),
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });

            give_score.then((data) => {
                try{
                    let result = JSON.parse(data);
                    if (result["state"] == "success"){
                        // let application_path = document.getElementById("application-path");
                        window.location.replace(result["redirect_path"]);
                    } else {
                        this.alert(result["state"], result["message"]);
                    }
                }catch(error){
                    // console.log($("#checkHomeworkDialog").html());
                    $("#checkHomeworkDialog").html("");
                    $("#checkHomeworkDialog").html(data);
                    // $("#btn-check-homework-dialog").click();
                }
            });
        } else {
            this.invalid_value(score);
            // alert("invalid score format");
        }
    }

    checkUserHomework(){
        let store_checked = document.getElementById("store-checked-user");
        let arr_checked = [];
        if (store_checked.value != ""){ arr_checked = store_checked.value.split(","); }
        let checkbox = document.getElementsByClassName("check-user-detail");
        for(let i=0; i < checkbox.length; i++){
            if (checkbox[i].checked){
                if (!arr_checked.includes(checkbox[i].value)){ arr_checked.push(checkbox[i].value); }
            } else {
                let index = arr_checked.indexOf(checkbox[i].value);
                if (index > -1) { arr_checked.splice(index, 1)}
            }
        }

        if (arr_checked.length > 0){
            document.getElementById("btn-change-status").style.display = "block";
        } else {
            document.getElementById("btn-change-status").style.display = "none";
        }
        store_checked.value = arr_checked;
    }

    updateStatus(event){
        let url = event.params["url"];
        let store_checked = document.getElementById("store-checked-user");
        let status = document.getElementById("select-status");

        const change_status = fetch(url, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": this.getCsrfToken()
            },
            body: JSON.stringify({"id": store_checked.value, "status": status.value}),
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });
      
        change_status.then((data) => {
            try{
                let result = JSON.parse(data);
                this.alert(result["state"], result["message"]);
            }catch(error){
                // console.log(error);
                $(".div-table-detail-homework").html("");
                $(".div-table-detail-homework").html(data);
                this.alert("success", "Update homework status successfully");
            }
        });
    }

    invalid_value(elem){
        elem.style.border = "1px solid #d31414";
        elem.style.background = "#f7caca";
        elem.value = "";
    }

    valid_value(elem){
        elem.style.border = "1px solid #dee2e6";
        elem.style.background = "#fff";
    }

    clickFilter(){
        let filter_btn = document.getElementsByClassName("filter-icon");
        let div_content = document.getElementsByClassName("div-filter-content-homework");
        let all_content_div = document.getElementsByClassName("filter-content");

        if (div_content[0].offsetHeight < 20){
            filter_btn[0].classList.add("active");
            div_content[0].classList.add("active");
            
            setTimeout(function(){
                for( let i = 0; i < all_content_div.length; i++){
                    all_content_div[i].style.visibility = "visible";
                }
            }, 300);
        }else{
            filter_btn[0].classList.remove("active");
            div_content[0].classList.remove("active");

            // $(".filter-content").css("visibility", "hidden");
            for( let i = all_content_div.length; i > 0; i--){
                all_content_div[i-1].style.visibility = "hidden";
            }
        }
    }

    checkStatus(event){
        let mode = event.params["mode"];
        let status = document.getElementsByClassName("check-box-status");

        if (mode == "all"){
            for (let i = 0; i < status.length; i++){
                if (status[i].value != ""){
                    status[i].checked = false;
                }
            }
        } else {
            document.getElementById("check-box-all").checked = false;
        }
    }

    applyFilter(){
        let name = document.getElementById("search-name");
        let subject = document.getElementById("search-subject");
        let homework = document.getElementById("search-homework");
        let status = document.getElementsByClassName("check-box-status");
        let selected_status = [];
        for (let i = 0; i < status.length; i++){
            if (status[i].checked && status[i].value != ""){
                selected_status.push(status[i].value);
            }
            
        }
        let deadline = document.getElementById("search-deadline");
        let body = {
            "name": name.value,
            "subject": subject.value,
            "homework": homework.value,
            "status": selected_status,
            "deadline": deadline.value
        }

        let table = $("#table-detail-homework-list").DataTable({
            pagingType: "full_numbers",    
            pageLength: 15,
            destroy: true,
            processing: true,
            serverSide: true,
            dom: '<tp>',
            ajax: { url: $("#table-detail-homework-list").data('url'),
                    contentType: "application/json",
                    data: body,
             },
            columnDefs: [{'targets': [5], 'className': "text-center"}],
            columns: [
                { data: 'id' },
                { data: 'name' },
                { data: 'subject' },
                { data: 'homework' },
                { data: 'status' },
                { data: 'estimatedDate' },
            ],
            rowCallback: function (row, data) {
                let status = $(row).find(".homework-status-text").text();
                if (status == "Send"){
                    let homework_id = $(row).find(".homework_id").val();
                    let homework_mapping_id = $(row).find(".homework_mapping_id").val();
                    row.setAttribute("data-action", "click->homework-detail#review_homework");
                    row.setAttribute("data-homework-detail-id-param", homework_id);
                    row.setAttribute("data-homework-detail-homework-mapping-id-param", homework_mapping_id);
                }

                let arr_checked = $("#store-checked-user").val().split(",");
                let checkbox =  $('td:eq(0)', row).find(".check-user-detail").val();

                if (arr_checked.includes(checkbox)){
                    $('td:eq(0)', row).find(".check-user-detail").prop("checked", true);
                }
            }
        
        });
    }

    getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
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
}