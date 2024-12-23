import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'
import DataTable from 'datatables.net-bs5'

export default class extends Controller {
  connect() {
    // this.element.textContent = "Hello World!"
    document.getElementById("activity-menu").classList.add("active");

    $("#table-activity-list").DataTable({
        pagingType: "full_numbers",    
        pageLength: 15,
        destroy: true,
        processing: true,
        serverSide: true,
        ordering: false,
        dom: '<tp>',
        ajax: { url: $("#table-activity-list").data('url') },
        columnDefs: [{'targets': [0], width: "15%"}, 
            {'targets': [0], width: "18%"}, 
            {'targets': [0], width: "10%"}, 
            {'targets': [0], width: "5%"},
            {'targets': [0], width: "15%"},
            {'targets': [0], width: "25%"},
            {'targets': [0], width: "12%"}
        ],
        columns: [
            { data: 'name' },
            { data: 'device' },
            { data: 'action' },
            { data: 'result' },
            { data: 'detail' },
            { data: 'datetime' }
        ]
    });
  }


};
