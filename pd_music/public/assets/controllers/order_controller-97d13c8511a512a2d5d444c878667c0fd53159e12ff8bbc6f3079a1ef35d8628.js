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
    }

    showMenu(){
        let restaurant_id = document.getElementById("select-restaurant");
        if (restaurant_id.value != ""){
            let table = $("#table-order-menu-list").DataTable({
                pagingType: "full_numbers",    
                pageLength: 15,
                destroy: true,
                processing: true,
                serverSide: true,
                dom: '<tp>',
                ajax: { url: $("#table-order-menu-list").data('url'),
                    contentType: "application/json",
                    data: {
                        "id": restaurant_id.value
                    }
                },
                columnDefs: [{'targets': [2], 'className': "text-center"}],
                columns: [
                    { data: 'picture' },
                    { data: 'menuName' },
                    { data: 'price' }
                ],
                rowCallback: function (row, data) {
                    row.setAttribute("data-action", "click->order#selectMenu");
                    let menu = data.menuName.split(" ")[0];
                    row.setAttribute("data-order-menu-param", menu);
                    row.setAttribute("data-order-restaurant-id-param", restaurant_id.value);
                }
            });
            $(".restaurant-blank").css("display", "none");
            $(".show-order-table-menu").css("display", "block");
        } else {
            $(".restaurant-blank").css("display", "block");
            $(".show-order-table-menu").css("display", "none");
        }
    }

    selectMenu(event){
        let id = event.params["restaurantId"];
        let menu = event.params["menu"];
        let application_path = document.getElementById("application-path");
        let url = application_path.value+"/food/order/get_menu";

        const get_menu_detail = fetch(url+"?menu="+menu+"&restaurant_id="+id).then(response => {
            if (response.ok) {
              return response.text();
            }
          });
      
        get_menu_detail.then((data) => {
            $(".order-menu-detail-dialog").html("");
            $(".order-menu-detail-dialog").append(data);
            $("#btn-open-order-menu-detail").click();
        });
    }

    selectSecondDish(){
        let second_dish = document.getElementById("div-second-choices");
        if (document.getElementById("secondDish").checked){
            second_dish.style.display = "block";
        } else {
            second_dish.style.display = "none";
        }
    }

    countPrice(){
        let price = parseInt(document.getElementById("order-price").innerHTML);
        let checkbox = document.getElementsByClassName("check-options");

        for (let i = 0; i < checkbox.length ; i++){
            if (checkbox[i].checked){
                price += parseInt(checkbox[i].getAttribute("data-price"));
            }
        }

        if (document.getElementById("secondDish").checked){
            let second_dish = document.querySelector('input[name=secondDishRadio]:checked').getAttribute("data-price");
            price += parseInt(second_dish);
        }

        document.getElementById("total-selected").innerHTML = price+" บาท"
    }

    confirmOrder(event){
        let update_id = document.getElementById("update-order-id");
        if (update_id != null){
            update_id = update_id.value;
        }
        let menu_id = document.getElementById("menu_id");
        let date = document.getElementById("select-date");
        let meal = document.getElementById("select-meal");
        let detail = document.getElementById("detail");
        let optional = [];
        let checkbox = document.getElementsByClassName("check-options");
        let has_second = document.getElementById("secondDish").checked;
        let second_menu_id = null;
        if (has_second){
            if (document.querySelector('input[name=secondDishRadio]:checked') != "undefined") {
                second_menu_id = document.querySelector('input[name=secondDishRadio]:checked').value;
            }
        }
        let price = document.getElementById("total-selected").innerHTML
        price = price.split(" ")[0];
        let url = event.params["url"];

        for (let i = 0; i < checkbox.length ; i++){
            if (checkbox[i].checked){
                optional.push({"category": checkbox[i].getAttribute("data-category"), "id": checkbox[i].value});
            }
        }

        const create_option = fetch(url, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": this.getCsrfToken()
            },
            body: JSON.stringify({"update_id": update_id, "menu_id": menu_id.value, "date": date.value, "meal": meal.value, "detail": detail.value, "option": JSON.stringify(optional), "has_second": has_second, "second_menu_id": second_menu_id, "price": price}),
          }).then(response => {
            if (response.ok) {
              return response.text();
            }
          });
      
        create_option.then((data) => {
            try{
                let result = JSON.parse(data);
                this.alert(result["status"], result["message"]);
            } catch (e){
                $(".select-order-data").html("");
                $(".select-order-data").html(data);
                this.alert("success", "Your order has been successfully");
            }
        });
    }

    selectDate(event){
        let url = event.params["url"];
        let date = document.getElementById("select-date");
        let meal = document.getElementById("select-meal");

        const get_option = fetch(url+"?date="+date.value+"&meal="+meal.value).then(response => {
            if (response.ok) {
              return response.text();
            }
          });
      
        get_option.then((data) => {
            $(".select-order-data").html("");
            $(".select-order-data").html(data);
        });
    }

    editOrder(event){
        let url = event.params["url"];
        let date = document.getElementById("select-date");
        let meal = event.params["meal"];
        let edit_id = event.params["id"];

        const get_option = fetch(url+"?id="+edit_id+"&date="+date.value+"&meal="+meal.value).then(response => {
            if (response.ok) {
              return response.text();
            }
          });
      
        get_option.then((data) => {
            $("#select-meal").val(meal);
            $(".select-order-data").html("");
            $(".select-order-data").html(data);
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
