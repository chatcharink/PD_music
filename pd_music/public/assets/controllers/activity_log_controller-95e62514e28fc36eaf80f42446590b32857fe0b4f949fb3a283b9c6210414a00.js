import { Controller } from "@hotwired/stimulus"

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
        // columnDefs: [{'targets': [0], 'className': "text-center"}],
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
