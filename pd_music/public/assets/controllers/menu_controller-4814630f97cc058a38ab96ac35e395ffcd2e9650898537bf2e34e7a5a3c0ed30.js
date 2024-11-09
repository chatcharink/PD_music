import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'
import DataTable from 'datatables.net-bs5'

export default class extends Controller {
    connect() {
        // this.element.textContent = "Hello World!"
        this.showMenu();
        document.getElementById("food-list-menu").classList.remove("active");
        document.getElementById("food-restaurant-menu").classList.add("active");
        // let participation_side = document.getElementById("foodMenu");
        // if (!participation_side.classList.contains("show")){
        //     participation_side.classList.add("show");
        // }
    }

    uploadMenuPicture(event){
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            document.getElementById('menu_profile').src = reader.result;
            document.getElementById('menu_profile').style.width = "150px";
            document.getElementById('menu_profile').style.height = "150px";
        };

        if (file) {
        reader.readAsDataURL(file);
        // this.saveAvatar(file, wrapper);
        }
    }

    addOptionChoice(){
        let btn_add = document.getElementById("div-btn-add-choice");
        let option = document.getElementsByClassName("option-choices");
        this.createDivOption(option.length+1);
        btn_add.insertAdjacentHTML("beforebegin", this.createDivOption(option.length+1));
    }

    createDivOption(length){
        let div = '<div class="mb-2 mx-2 row option-choices" id="option-choice-'+length+'">'+
                '<div class="col-sm-8">'+
                '<div class="form-floating mb-3">'+
                '<input type="text" class="form-control w-90" id="choice-'+length+'">'+
                '<label for="choice-1">Option</label>'+
                '</div></div>'+
                '<div class="col-sm-3">'+
                '<div class="form-floating mb-3">'+
                '<input type="text" class="form-control" id="price-'+length+'">'+
                '<label for="price-1">Price</label>'+
                '</div></div>'+
                '<div class="col-sm-1 text-center">'+
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" style="margin-top: .75rem;" data-action="click->menu#removeDivOption" data-menu-length-param="'+length+'" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>'+
                '</div>'+
                '</div>';
        return div
    }

    removeDivOption(event){
        let length = event.params["length"];
        document.getElementById("option-choice-"+length).remove();
    }

    saveOption(event){
        let category = document.getElementById("category");
        let json_data = [];
        let option = document.getElementsByClassName("option-choices");
        let option_choice;
        let price;
        let id;
        let arr_valid = [];
        for (let i = 0; i < option.length; i++){
            option_choice = option[i].querySelector("#choice-"+(i+1));
            price = option[i].querySelector("#price-"+(i+1));
            id = option[i].querySelector("#id-"+(i+1));
            if (option_choice.value == "" && price.value != ""){
                option_choice.style.border = "1px solid #d31414";
                option_choice.style.background = "#f7caca";
                arr_valid.push(false);
            } else {
                option_choice.style.border = "1px solid #dee2e6";
                option_choice.style.background = "#fff";
                if (id == null){
                    json_data.push({"option_name": option_choice.value, "price": price.value});
                } else {
                    json_data.push({"option_name": option_choice.value, "price": price.value, "id": id.value});
                }
            }
        }

        if (category.value == ""){
            category.style.border = "1px solid #d31414";
            category.style.background = "#f7caca";
            arr_valid.push(false);
        } else {
            category.style.border = "1px solid #dee2e6";
            category.style.background = "#fff";
        }

        if (!arr_valid.includes(false)){
            const create_option = fetch(event.params["url"], {
                method: 'POST',
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRF-Token": this.getCsrfToken()
                },
                body: JSON.stringify({"category": category.value, "option": json_data}),
              }).then(response => {
                if (response.ok) {
                  return response.text();
                }
              });
          
            create_option.then((data) => {
                $("#btn-close-add-option").click();
                $(".div-add-option-dialog").html("");
                $(".div-add-option-dialog").html(data);
                $(".btn-option-dialog").click();
            });
        }
    }

    editOption(event){
        let id = event.params["id"];
        let category = event.params["category"];
        document.getElementById("update-option-id").value = id;
        document.getElementById("category").value = category;

        let url = event.params["url"];

        const get_option = fetch(url+"?category="+category).then(response => {
            if (response.ok) {
              return response.text();
            }
          });
      
        get_option.then((data) => {
        try{
            let result = JSON.parse(data);
            let btn_add = document.getElementById("div-btn-add-choice");
            for (let i = 0; i < result["options"].length; i++){
                btn_add.insertAdjacentHTML("beforebegin", this.editDivOption(i+1, result["options"][i][0], result["options"][i][1], result["options"][i][2]));
            }
            document.getElementById("btn-add-option-dialog").click();
        } catch (e) {
            console.log(e);
        }
        });
    }

    editDivOption(length, option, price, id){
        let div = '<div class="mb-2 mx-2 row option-choices" id="option-choice-'+length+'">'+
                '<div class="col-sm-8">'+
                '<div class="form-floating mb-3">'+
                '<input type="text" value="'+option+'" class="form-control w-90" id="choice-'+length+'">'+
                '<label for="choice-1">Option</label>'+
                '</div></div>'+
                '<div class="col-sm-3">'+
                '<div class="form-floating mb-3">'+
                '<input type="text" value="'+price+'" class="form-control" id="price-'+length+'">'+
                '<label for="price-1">Price</label>'+
                '</div></div>'+
                '<div class="col-sm-1 text-center">'+
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" style="margin-top: .75rem;" data-action="click->menu#removeDivOption" data-menu-length-param="'+length+'" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>'+
                '</div>'+
                '<input type="hidden" value="'+id+'" id="id-'+length+'">'
                '</div>';
        return div
    }

    setDefaultOption(){
        // let options = document.getElementsByClassName("option-choices");
        // console.log(options.length);
        // for (let i = 0; i < options.length; i++){
        //     console.log(i);
        //     options[i].remove();
        // }
        $(".option-choices").remove();
        document.getElementById("category").value = "";
    }

    showMenu(){
        let restaurant_id = document.getElementById("add-menu-restaurant-id");
        let table = $("#table-menu-list").DataTable({
            pagingType: "full_numbers",    
            pageLength: 15,
            destroy: true,
            processing: true,
            serverSide: true,
            dom: '<tp>',
            ajax: { url: $("#table-menu-list").data('url') },
            columnDefs: [{'targets': [2, 3], 'className': "text-center"}],
            columns: [
                { data: 'picture' },
                { data: 'menuName' },
                { data: 'price' },
                { data: 'status' }
            ],
            rowCallback: function (row, data) {
                row.setAttribute("data-bs-toggle", "modal");
                row.setAttribute("data-bs-target", "#addMenuBackdrop");
                row.setAttribute("data-action", "click->menu#editMenu");
                let menu = data.menuName.split(" ")[0];
                row.setAttribute("data-menu-menu-param", menu);
                row.setAttribute("data-menu-restaurant-id-param", restaurant_id.value);
            }
        
        });
    }

    selectOption(event){
        let category = event.params["category"];
        let url = event.params["url"];
        const get_option = fetch(url+"?category="+category).then(response => {
            if (response.ok) {
              return response.text();
            }
          });
      
        get_option.then((data) => {
        try{
            let result = JSON.parse(data);
            let has_div = document.getElementById(category+"-choices");
            if (has_div == null){
                let last_div = document.getElementById("add-menu-restaurant-id");
                last_div.insertAdjacentHTML("beforebegin", '<div class="mt-2 menu-options-list" id="'+category+'-choices"><span><b>'+category+'</b></span></div>');

                for (let i = 0; i < result["options"].length; i++){
                    last_div.insertAdjacentHTML("beforebegin", this.divOption(category, result["options"][i][0], result["options"][i][2]));
                }
            }
        } catch (e) {
            console.log(e);
        }
        });
    }

    divOption(category, option, id){
        let div = '<div class="mb-2 mx-2 row option-choices">'+
                '<div class="col-10"><span>'+option+'</span></div>'+
                // '<div class="col-4"><span>+'+price+'</span></div>'+
                '<div class="col-2">'+
                '<div class="form-check form-switch">'+
                '<input class="form-check-input check-option-data" type="checkbox" data-category="'+category+'" id="SwitchCheck-'+option+'" value="'+id+'">'+
                '</div></div></div>';
        return div
    }

    createMenu(event){
        event.preventDefault();

        let menu = document.getElementById("menu");
        let price = document.getElementById("price");
        let page = document.getElementById("add-menu-dialog-page");
        let update_id = document.getElementById("update-menu-id");

        let arr_valid = []
        if (menu.value == ""){
            menu.style.border = "1px solid #d31414";
            menu.style.background = "#f7caca";
            arr_valid.push(false);
        }else{
            menu.style.border = "1px solid #dee2e6";
            menu.style.background = "#fff";
            arr_valid.push(true);
        }

        if (price.value == "" || !(/[0-9]+/.test(price.value))){
            price.style.border = "1px solid #d31414";
            price.style.background = "#f7caca";
            arr_valid.push(false);
        }else{
            price.style.border = "1px solid #dee2e6";
            price.style.background = "#fff";
            arr_valid.push(true);
        }

        if (!arr_valid.includes(false)){
            let check_data = document.getElementsByClassName("check-option-data");
            let arr_checked_option = [];
            let json_checked;
            for (let j=0; j < check_data.length; j++){
                json_checked = {"id": check_data[j].value, "checked": check_data[j].checked, "category": check_data[j].getAttribute("data-category")}
                arr_checked_option.push(json_checked);
            }
            let formData = new FormData(event.target);
            formData.append("option_menu", JSON.stringify(arr_checked_option));
            const create_menu = fetch(event.target.action, {
                method: 'POST',
                body: formData,
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });

            create_menu.then((data) => {
                try{
                    result = JSON.parse(data);
                    this.alert(result["status"], result["message"]);
                } catch {
                    $("#close-add-menu-dialog").click();
                    if (page.value == "menu"){
                        $(".div-table-menu").html("");
                        $(".div-table-menu").html(data);
                        this.showMenu();
                    } else {
                        $(".div-add-menu").html("");
                        $(".div-add-menu").html(data);
                    }
                    // Clear value in dialog
                    if (update_id.value == ""){
                        this.alert("success", "Add menu "+menu.value+" successfully");
                    } else {
                        this.alert("success", "Update menu "+menu.value+" successfully");
                    }
                }
            });
        }
    }

    editMenu(event){
        let id = event.params["restaurantId"];
        let menu = event.params["menu"];
        document.getElementById("menu").value = menu;
        let application_path = document.getElementById("application-path");
        let url = application_path.value+"/food/menu/get_menu";

        const get_option = fetch(url+"?menu="+menu+"&restaurant_id="+id).then(response => {
            if (response.ok) {
              return response.text();
            }
          });
      
        get_option.then((data) => {
        try{
            let result = JSON.parse(data);
            let category;
            if (result["option"].length > 0){
                for (let i = 0; i < result["option"].length; i++){
                    category = result["option"][i]["category"];
                    console.log(category);
                    document.getElementById("dropdown-option-"+category).click();
                    asyncChecked(category, result["option"][i]["id"], result["option"][i]["checked"]);
                }
            }
            document.getElementById("description").value = result["description"];
            document.getElementById("price").value = result["price"];
            let image = document.getElementById("menu_profile");
            image.src = result["image_path"];
            image.style.width = "150px";
            image.style.height = "150px";
            document.getElementById("update-menu-id").value = result["id"];
            document.getElementById("btn-add-update-menu").value = "Update";
            document.getElementById("setSecondDish").checked = result["is_second"];
            async function asyncChecked(category, id, checked_status) {
                result = await checkedCheckBox(category, id, checked_status);
            }

            function checkedCheckBox(category, id, checked_status) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        let checkbox = document.querySelectorAll("input[data-category='"+category+"']");
                        for (let j = 0; j < checkbox.length; j++){
                            if (checkbox[j].value == id){
                                checkbox[j].checked = checked_status;
                            }
                        }
                        resolve(true);
                    }, 500);
                });
            }
        } catch (e) {
            console.log(e);
        }
        });
    }

    defaultAddMenu(){
        document.getElementById("menu").value = "";
        document.getElementById("description").value = "";
        document.getElementById("price").value = "";
        let image = document.getElementById("menu_profile");
        let application_path = document.getElementById("application-path");
        image.src = application_path.value+"/pictures/no_image.jpg";
        image.style.width = "150px";
        image.style.height = "150px";
        document.getElementById("setSecondDish").checked = false;
        $(".menu-options-list").remove();
        $(".option-choices").remove();
        document.getElementById("btn-add-update-menu").value = "Add";
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
