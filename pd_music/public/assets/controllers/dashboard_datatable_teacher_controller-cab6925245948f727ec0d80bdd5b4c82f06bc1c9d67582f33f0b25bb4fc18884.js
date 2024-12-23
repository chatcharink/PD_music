import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'
import DataTable from 'datatables.net-bs5'

export default class extends Controller {
    connect() {
        let body = {};
        let select_state = document.getElementById("hide-select-state");
        let state = select_state.getAttribute("data-select");
        let category = document.getElementById("hide-category");
        body[state] = select_state.value;
        body["category_id"] = category.value;
        if (document.getElementById("hide-select-class") !== null){
            body["class"] = document.getElementById("hide-select-class").value;
        }
        if (document.getElementById("hide-select-exam-date") !== null){
            body["exam_date"] = document.getElementById("hide-select-exam-date").value;
        }
        let table = $("#table-dashboard-teacher-list").DataTable({
            paging: false,
            destroy: true,
            processing: true,
            serverSide: true,
            dom: '<t>',
            ajax: { url: $("#table-dashboard-teacher-list").data('url'),
                contentType: "application/json",
                data: body,
            },
            columns: [
                { data: 'caution' },
                { data: 'name' },
                { data: 'task_name' },
                { data: 'score' },
                { data: 'category' },
                { data: 'status' },
                { data: 'estimate_date' }
            ],
            columnDefs: [
                { width: "3%", targets: 0 },
                { width: "17%", targets: 1 },
                { width: "20%", targets: 2 },
                { width: "10%", targets: 3 },
                { width: "10%", targets: 4 },
                { width: "20%", targets: 5 },
                { width: "25%", targets: 6 }
            ],
        });
    }

    filterTable(){
        let body = {};
        let select_state = document.getElementById("hide-select-state");
        let state = select_state.getAttribute("data-select");
        let checked_box = document.getElementsByName("checkbox-filter-table");
        body[state] = select_state.value;
        for(let i = 0; i < checked_box.length; i++){
            body[checked_box[i].getAttribute("data-key")] = checked_box[i].checked;
        }
        body["category_id"] = document.getElementById("hide-category").value;
        if (document.getElementById("hide-select-class") !== null){
            body["class"] = document.getElementById("hide-select-class").value;
        }
        if (document.getElementById("hide-select-exam-date") !== null){
            body["exam_date"] = document.getElementById("hide-select-exam-date").value;
        }
        let table = $("#table-dashboard-teacher-list").DataTable({
            paging: false,
            destroy: true,
            processing: true,
            serverSide: true,
            dom: '<t>',
            ajax: { url: $("#table-dashboard-teacher-list").data('url'),
                    contentType: "application/json",
                    data: body,
            },
            success: function(){
                // table.columns.adjust().draw();
            },
            columns: [
                { data: 'caution' },
                { data: 'name' },
                { data: 'task_name' },
                { data: 'score' },
                { data: 'category' },
                { data: 'status' },
                { data: 'estimate_date' }
            ],
            columnDefs: [
                { width: "3%", targets: 0 },
                { width: "17%", targets: 1 },
                { width: "20%", targets: 2 },
                { width: "10%", targets: 3 },
                { width: "10%", targets: 4 },
                { width: "20%", targets: 5 },
                { width: "25%", targets: 6 }
            ],
        });
    }
};
