import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'
import DataTable from 'datatables.net-bs5'

export default class extends Controller {
    connect() {
        // this.element.textContent = "Hello World!"
        document.getElementById("category").classList.add("active");
        let setting = document.getElementById("settingMenu");
        if (!setting.classList.contains("show")){
            setting.classList.add("show");
        }

        $("#table-category-list").DataTable({
            pagingType: "full_numbers",    
            pageLength: 15,
            destroy: true,
            processing: true,
            serverSide: true,
            ordering: false,
            dom: '<tp>',
            ajax: { url: $("#table-category-list").data('url') },
            columnDefs: [{'targets': [1], 'className': "truncate"}, {'targets': [3], 'className': "text-center"}],
            columns: [
                { data: 'category' },
                { data: 'description' },
                { data: 'update_date' },
                { data: 'action' }
            ],
            rowCallback: function(row, data){
                $('td:eq(1)', row).attr("data-bs-toggle", "tooltip");
                $('td:eq(1)', row).attr("data-bs-placement", "top");
                $('td:eq(1)', row).prop("title", data["description"]);
            },
            drawCallback: function(){
                let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
                    let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl,{
                        'customClass': 'custom-tooltip'
                    })
                })
            }
        });
        // this.showToolsTip();
    }

    createCategory(event){
        event.preventDefault();
        let category_name = document.getElementById("category_name");
        let is_valid_name = false;
        
        if (category_name.value !== ""){
            is_valid_name = true;
        }   else {
            category_name.style.border = "1px solid #d31414";
            category_name.style.background = "#f7caca";
            category_name.value = "#000000";
        }

        if (is_valid_name){
            const create_category = fetch(event.target.action, {
                method: 'POST',
                body: new FormData(event.target),
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });

            create_category.then((data) => {
                try{
                    let result = JSON.parse(data);
                    window.location.replace(result["redirect_path"]);
                    // this.alert(result["status"], result["message"]);
                } catch(error) {
                    console.log(error)
                }
            });
        }
    }

    getCategory(event){
        let id = event.params["id"];
        let url = event.params["url"]
        const get_category = fetch(url).then(response => {
            if (response.ok) {
                return response.text();
            }
        });

        get_category.then((data) => {
            let result = JSON.parse(data);
            document.getElementById("category_name").value = result["category"];
            document.getElementById("description").value = result["description"];
            document.getElementById("colorPicker").value = "#"+result["color"];
            document.getElementById("update-category-id").value = id;
            document.getElementById("btn-submit-form-create-category").value = "Update";
        })

    }

    clearCategory(){
        document.getElementById("category_name").value = "";
        document.getElementById("description").value = "";
        document.getElementById("colorPicker").value = "#000000";
        document.getElementById("update-category-id").value = "";
        document.getElementById("btn-submit-form-create-category").value = "Create";
        let form = document.getElementById("form_create_category");
        form.setAttribute("data-action", "click->category#createCategory")
    }

    setDeleteId(event){
        let url = event.params["url"];
        let name = event.params["name"];
    
        document.getElementById("delete-category-name").innerHTML = " : "+name;
        document.getElementById("confirm-delete-category").setAttribute("data-category-name-param", name);
        document.getElementById("confirm-delete-category").setAttribute("data-category-url-param", url);
    }

    deleteCategory(event){
        let url = event.params["url"];
        const delete_subject = fetch(url, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": this.getCsrfToken()
            },
          // body: JSON.stringify({ "name": name }),
        }).then(response => {
          if (response.ok) {
              return response.text();
          }
        });
    
        delete_subject.then((data) => {
            try{
                let result = JSON.parse(data);
                if (result["status"] == "success"){
                window.location.replace(result["redirect_path"]);
                }else{
                this.alert(result["status"], result["message"]);
                }
            } catch(error) {
                console.log(error);
            }
        });
    }

    getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
    }
}
