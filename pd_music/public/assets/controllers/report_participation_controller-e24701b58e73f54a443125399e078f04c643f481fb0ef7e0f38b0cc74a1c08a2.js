import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'
import DataTable from 'datatables.net-bs5'
import "datatables.net-fixedcolumns-bs5"

export default class extends Controller {
    connect() {
        document.getElementById("participation-report-menu").classList.add("active");
        let participation_side = document.getElementById("participationMenu");
        if (!participation_side.classList.contains("show")){
            participation_side.classList.add("show");
        }

        // $("#select-subject").select2();
        // $("#select-class").select2();
        // function selectSubject(){
        //     let selected_subject = document.getElementById("select-subject");
        //     let selected_classroom = document.getElementById("select-class");
        //     let url = selected_subject.getAttribute("data-url");

        //     const subject = fetch(url+"?id="+selected_subject.value+"&class="+selected_classroom.value).then(response => {
        //         if (response.ok) {
        //         return response.text();
        //         }
        //     });
        
        //     subject.then((data) => {
        //         try{
        //         let result = JSON.parse(data);
        //         } catch {
        //         $("#report-participation").html("");
        //         $("#report-participation").html(data);
        //         }
        //     });
        // }
    }

    adjustableDatatable(){
        let columnNames = [{"data": "picture"}, {"data": "name"}, {"data": "class"}];
        let columns = document.getElementsByClassName("thead-detail-participation");
        for (var i = 0; i < columns.length; i++) {
            columnNames.push({
                data: columns[i].innerHTML
            });
        }

        $(".table-detail").DataTable({
            columnDefs: [{ width: '110px', targets: 0 }, { width: '165px', targets: 1 },  { width: '110', targets: 2 }],
            scrollX: "1100px",
            scrollY: "600px",
            scrollCollapse: true,
            paging: false,
            ordering: false,
            fixedColumns: {
                leftColumns: 3,
            },
            dom: '<t>',
            columns: columnNames,
            destroy: true,
        });
        setTimeout(function(){ 
            $(".table-detail").DataTable().columns.adjust().draw();
            $(".dt-scroll-body").find("thead").remove();
        }, 150);
        // $(".table-detail").DataTable().columns.adjust().draw();
        
    }

    filterReportSubject(){
        let selected_subject = document.getElementById("select-subject");
        let selected_classroom = document.getElementById("select-class");

        let url = selected_subject.getAttribute("data-url");

        const subject = fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": this.getCsrfToken()
            },
            body: JSON.stringify({ "id": selected_subject.value, "class": selected_classroom.value}),
        }).then(response => {
            if (response.ok) {
              return response.text();
            }
          });
      
          subject.then((data) => {
            try{
              let result = JSON.parse(data);
            } catch {
              $(".tab-check-name-content").html("");
              $(".tab-check-name-content").html(data);
            }
        });
    }

    filterReportEvent(){
        let selected_event = document.getElementById("select-event");
        let url = selected_event.getAttribute("data-url");

        const event = fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": this.getCsrfToken()
            },
            body: JSON.stringify({"event_id": selected_event.value}),
        }).then(response => {
            if (response.ok) {
              return response.text();
            }
          });
      
          event.then((data) => {
            try{
              let result = JSON.parse(data);
            } catch {
              $(".tab-check-concert-content").html("");
              $(".tab-check-concert-content").html(data);
              this.showConcertGraph()
            }
        });
    }

    showConcertGraph(){
        google.charts.load("current", {packages:["corechart"]});
        google.charts.setOnLoadCallback(drawChart);

        var graph_val_concert = document.getElementById("check-concert-value");
        var json_value_concert = JSON.parse(graph_val_concert.value);
        // var max_value = document.getElementById("max-check-name-value");

        function drawChart() {
            var dataTable_concert = new google.visualization.DataTable();
            dataTable_concert.addColumn("string", "Name");
            // Use custom HTML content for the domain tooltip.
            dataTable_concert.addColumn({"type": "string", "role": "tooltip", "p": {"html": true}});
            dataTable_concert.addColumn("number", "เข้าร่วม");
            dataTable_concert.addColumn("number", "ไม่เข้าร่วม");

            dataTable_concert.addRows(json_value_concert["rows"]);

            var options_concert = {
                // title: "Participation in classroom",
                colors: ["#6C6DE8", "#44DBDC"],
                // This line makes the entire category"s tooltip active.
                focusTarget: "category",
                chartArea: {width: "80%", top: "40", left: "150", height: "90%"},
                width: "100%",
                fontName: "Athiti",
                fontSize: "14px",
                hAxis: {
                    viewWindow: {
                    max: 10,
                    min: 0
                    }
                },
                legend: {position: "top", alignment: "center", textStyle: {fontSize: 12}},
                // Use an HTML tooltip.
                tooltip: { isHtml: true },
            };

            var chart_concert = new google.visualization.BarChart(document.getElementById("barchart_event"));

            // google.visualization.events.addListener(chart, "ready", afterDraw);
            chart_concert.draw(dataTable_concert, options_concert);
        }
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
