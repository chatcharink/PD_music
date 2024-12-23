import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'
import DataTable from 'datatables.net-bs5'

export default class extends Controller {
    connect() {
        // this.element.textContent = "Hello World!"
        document.getElementById("homework-type").classList.add("active");
        let setting = document.getElementById("settingMenu");
        if (!setting.classList.contains("show")){
            setting.classList.add("show");
        }

        $("#table-homework-type-list").DataTable({
            pagingType: "full_numbers",    
            pageLength: 15,
            destroy: true,
            processing: true,
            serverSide: true,
            ordering: false,
            dom: '<tp>',
            ajax: { url: $("#table-homework-type-list").data('url') },
            columnDefs: [{'targets': [1], 'className': "truncate"}, {'targets': [3], 'className': "text-center"}],
            columns: [
                { data: 'homework_type' },
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

    createHomeworkType(event){
        event.preventDefault();
        let homework_type_name = document.getElementById("homework-type");
        let is_valid_name = false;
        
        if (homework_type_name.value !== ""){
            is_valid_name = true;
        }   else {
            homework_type_name.style.border = "1px solid #d31414";
            homework_type_name.style.background = "#f7caca";
            homework_type_name.value = "#000000";
        }

        if (is_valid_name){
            const create_homework_type = fetch(event.target.action, {
                method: 'POST',
                body: new FormData(event.target),
            }).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });

            create_homework_type.then((data) => {
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

    getHomeworkType(event){
        let id = event.params["id"];
        let url = event.params["url"]
        const get_homework_type = fetch(url).then(response => {
            if (response.ok) {
                return response.text();
            }
        });

        get_homework_type.then((data) => {
            let result = JSON.parse(data);
            document.getElementById("homework-type").value = result["homework_type"];
            document.getElementById("description").value = result["description"];
            document.getElementById("update-homework-type-id").value = id;
            document.getElementById("btn-submit-form-create-homework-type").value = "Update";
        })

    }

    clearCategory(){
        document.getElementById("homework-type").value = "";
        document.getElementById("description").value = "";
        document.getElementById("update-homework-type-id").value = "";
        document.getElementById("btn-submit-form-create-homework-type").value = "Create";
    }

    setDeleteId(event){
        let url = event.params["url"];
        let name = event.params["name"];
    
        document.getElementById("delete-homework-type-name").innerHTML = " : "+name;
        document.getElementById("confirm-delete-homework-type").setAttribute("data-homework-type-name-param", name);
        document.getElementById("confirm-delete-homework-type").setAttribute("data-homework-type-url-param", url);
    }

    deleteHomeworkType(event){
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
