import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'
import DataTable from 'datatables.net-bs5'

export default class extends Controller {
    connect() {
        document.getElementById("food-list-menu").classList.add("active");
        let participation_side = document.getElementById("foodMenu");
        if (!participation_side.classList.contains("show")){
            participation_side.classList.add("show");
        }

        let table = document.getElementById("table-summary-order");
        if (table != null){
            $("#table-summary-order").DataTable({
                columnDefs: [{ width: 100, targets: 0 }, { width: 250, targets: 1 }],
                // scrollY: true,
                scrollX: true,//"1100px",
                scrollCollapse: true,
                paging: false,
                ordering: false,
                fixedColumns: {
                    leftColumns: 2,
                },
                dom: '<t>',
                destroy: true,
            });
            setTimeout(function(){ 
                // $("#table-summary-order").DataTable().columns.adjust().draw();
                // $(".dt-scroll-body").find("thead").remove();
            }, 150);
        }
    }

    filterDateRange(event){
        let date_from = document.getElementById("filter_date_from");
        let date_to = document.getElementById("filter_date_to");

        let url = event.params["url"]+"?date_from="+date_from.value+"&date_to="+date_to.value;
        const filter = fetch(url).then(response => {
            if (response.ok) {
                return response.text();
            }
        });

        filter.then((data) => {
            let arr_from = date_from.value.split("-");
            let arr_to = date_to.value.split("-");
            $(".div-summary-all-order-list").html("");
            $(".div-summary-all-order-list").html(data);
            $(".btn-filter-date-range").html(arr_from[2]+"/"+arr_from[1]+"/"+arr_from[0]+" ~ "+arr_to[2]+"/"+arr_to[1]+"/"+arr_to[0]);
            $(".btn-filter-date-range").click();
            $("#table-summary-order").DataTable({
                columnDefs: [{ width: 100, targets: 0 }, { width: 250, targets: 1 }],
                // scrollY: true,
                scrollX: true,//"1100px",
                scrollCollapse: true,
                paging: false,
                ordering: false,
                fixedColumns: {
                    leftColumns: 2,
                },
                dom: '<t>',
                destroy: true,
            });
            // setTimeout(function(){ 
            //     $("#table-summary-order").DataTable().columns.adjust().draw();
            //     $(".dt-scroll-body").find("thead").remove();
            // }, 50);
        });
    }

    addCoupon(event){
        let users = document.getElementById("select_user");
        let amount = document.getElementById("amount");
        let url = event.params["url"];

        if (/[0-9]/.test(amount.value)){
            amount.style.border = "1px solid #dee2e6";
            amount.style.background = "#fff";

            const add_coupon = fetch(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": this.getCsrfToken()
                },
                body: JSON.stringify({ user_id: users.value, amount: amount.value})
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });

            add_coupon.then((data) => {
                try{
                    $("#close-add-coupon-dialog").click();
                    $( "#div-ticket" ).load(window.location.href + " #div-ticket" );
                    let result = JSON.parse(data);
                    this.alert(result["status"], result["message"]);
                } catch (e) {
                    console.log(e);
                }
            });
        }else {
            amount.style.border = "1px solid #d31414";
            amount.style.background = "#f7caca";
        }
    }

    clickFileUpload(){
        document.getElementById("upload-restaurant-pic").click();
    }

    uploadAvatar(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        const wrapper = event.target.closest(".canva-profile-photo");


        reader.onloadend = () => {
            document.getElementById('avatar_profile').src = reader.result;
            document.getElementById('avatar_profile').style.width = "498px";
            document.getElementById('avatar_profile').style.height = "264px";
        };

        if (file) {
        reader.readAsDataURL(file);
        // this.saveAvatar(file, wrapper);
        }
    }

    createRestaurant(event){
        event.preventDefault();

        let name = document.getElementById("restaurant");
        let status = document.getElementById("select-status");
        let telephone = document.getElementById("telephone");
        let line = document.getElementById("line");

        let arr_valid = [];
        if (name.value == ""){
            name.style.border = "1px solid #d31414";
            name.style.background = "#f7caca";
            arr_valid.push(false);
        }else{
            name.style.border = "1px solid #dee2e6";
            name.style.background = "#fff";
            arr_valid.push(true);
        }

        if (!arr_valid.includes(false)){
        
            const create_restaurant = fetch(event.target.action, {
                method: 'POST',
                body: new FormData(event.target),
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });

            create_restaurant.then((data) => {
                try{
                    result = JSON.parse(data);
                    this.alert(result["status"], result["message"]);
                } catch {
                    $(".div-restaurant").html("");
                    $(".div-restaurant").html(data);
                    $("#close-add-reataurant").click();
                    // Clear value in dialog
                    this.alert("success", "Add restaurant "+name.value+" successfully");
                }
            });
        }
    }

    addRestaurantId(event){
        document.getElementById("add-menu-restaurant-id").value = event.params["id"];
    }

    selectTimesPerDay(){
        let time_order = document.getElementById("times-order");
        let div_meal = document.getElementsByClassName("div-meal-name");
        div_meal[0].innerHTML = "";
        for(let i = 0; i < parseInt(time_order.value); i++){
            let gen_div = this.generateMealInput(i+1);
            div_meal[0].insertAdjacentHTML("beforeend", gen_div);
        }
    }

    generateMealInput(num){
        let div = '<div class="mb-3 row">'+
                '<label for="mealName'+num+'" class="col-sm-3 col-form-label text-end">Meal name#'+num+'</label>'+
                '<div class="col-sm-8">'+
                '<input type="text" class="form-control txt_meal_name" id="mealName'+num+'" value="" />'+
                '</div>'+
                '</div>'
        return div
    }

    settingOrder(event){
        let url = event.params["url"];
        let pre_order = document.getElementById("pre-order");
        let time_order = document.getElementById("times-order");

        let meal_name = document.getElementsByClassName("txt_meal_name");
        let meal = [];
        for(let i = 0; i < meal_name.length; i++){
            if (meal_name[i].value == ""){
                meal_name[i].style.border = "1px solid #d31414";
                meal_name[i].style.background = "#f7caca";
            }else {
                meal_name[i].style.border = "1px solid #dee2e6";
                meal_name[i].style.background = "#ffffff";
            }
            meal.push(meal_name[i].value);
        }
        
        if (!meal.includes("")){
            const setting = fetch(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": this.getCsrfToken()
                },
                body: JSON.stringify({ "pre_order": pre_order.value, "times": time_order.value, "meals": meal}),
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });

            setting.then((data) => {
                let result = JSON.parse(data);
                this.alert(result["status"], result["message"]);
                $("#close-setting-order-dialog").click();
            });
        }
    }

    exportOrder(event){
        // let url = event.params["url"];
        // let date_from = document.getElementById("date_from");
        // let date_to = document.getElementById("date_to");

        // const export_data = fetch(url, {
        //     method: 'POST',
        //     headers: {
        //         "Content-Type": "application/json",
        //         "X-CSRF-Token": this.getCsrfToken()
        //     },
        //     body: JSON.stringify({ "date_from": date_from.value, "date_to": date_to.value}),
        // }).then(response => {
        //     if (response.ok) {
        //         return response.text();
        //     }
        // });

        // export_data.then((data) => {
        //     try{
        //         let result = JSON.parse(data);
        //         this.alert(result["status"], result["message"]);
        //     } catch{
        //        this.alert("success", "Export order successfully");
        //     }
        // });
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

    changeStatus(event){
        let id = event.params["id"];
        let url = event.params["url"];
        let restaurant = document.getElementById("restaurant-status-"+id);

        const change_status = fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": this.getCsrfToken()
            },
            body: JSON.stringify({ restaurant_id: id, status: restaurant.checked })
        }).then(response => {
            if (response.ok) {
                return response.text();
            }
        });

        change_status.then((data) => {
            try{
                let result = JSON.parse(data);
                this.alert(result["status"], result["message"]);
            } catch(e) {
                console.log(e);
            }
        });
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
