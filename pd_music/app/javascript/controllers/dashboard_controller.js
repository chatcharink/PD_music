import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'

export default class extends Controller {
  connect() {
    document.getElementById("dashboard-menu").classList.add("active");
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
    // $("#student-name").select2({
    //   width: "20%"
    // });
  }

  datatable(){
    
  }

  selectDateRange(event){
    let date_type = event.params["date"];
    let url = event.params["url"];
    let date_from = document.getElementById("date-from");
    let date_to = document.getElementById("date-to");
    this.valid_date(date_from);
    this.valid_date(date_to);
    document.getElementsByClassName("dropdown-date-range")[0].classList.remove("show");
    this.onFilterSuccess(date_type, url);
  }

  showDateRange(){
    document.getElementsByClassName("dropdown-date-range")[0].classList.add("show");
  }

  filterDateRange(event){
    event.preventDefault();
    let date_from = document.getElementById("date-from");
    let date_to = document.getElementById("date-to");

    try{
      if (Date.parse(date_to.value) - Date.parse(date_from.value) > 0){
        this.onFilterSuccess("range", event.target.action, date_from.value, date_to.value);
        this.valid_date(date_from);
        this.valid_date(date_to);
      }else{
        this.invalid_date(date_from);
        this.invalid_date(date_to);
      }
    } catch {
      this.invalid_date(date_from);
      this.invalid_date(date_to);
    }
  }

  invalid_date(elem){
    elem.style.border = "1px solid #d31414";
    elem.style.background = "#f7caca";
    elem.value = "";
  }

  valid_date(elem){
    elem.style.border = "1px solid #dee2e6";
    elem.style.background = "#fff";
  }

  filterNameOrGroup(event){
    event.preventDefault();

    const filter = fetch(event.target.action, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.getCsrfToken()
      },
      body: this.getBody(),
    }).then(response => {
        if (response.ok) {
            return response.text();
        }
    });

    filter.then((data) => {
      $("#div-dashboard").html('');
      $("#div-dashboard").html(data);
      // document.getElementById("div-dashboard").innerHTML = data;
      this.tabActive("all");
      let title = document.getElementById("title-group-name");
      let id = document.getElementById("hide-select-state");
      if ( document.getElementById("individual").checked ){
        let select_name = document.getElementById("form_date_filter_student-name");
        title.innerHTML = select_name.options[select_name.selectedIndex].text;
        id.setAttribute("data-select", "id");
        id.value = select_name.value;
        document.getElementById("hide-select-class").value = "";
        document.getElementById("hide-select-exam-date").value = "";
      } else {
        let select_group = document.getElementById("select_musical_instrument");
        title.innerHTML = "";
        let select_class = document.getElementById("select_class");
        let select_exam_date = document.getElementById("select_exam_date");
        
        document.getElementById("hide-select-class").value = select_class.value;
        if (select_class.value != ""){
          title.innerHTML += "class : "+select_class.value;
        }

        id.setAttribute("data-select", "group_id");
        id.value = select_group.value;
        if (select_group.value != ""){
          title.innerHTML += "musical group : "+select_group.options[select_group.selectedIndex].text
        }

        document.getElementById("hide-select-exam-date").value = select_exam_date.value;
        if (select_exam_date.value != ""){
          title.innerHTML += "exam date between : "+select_exam_date.value;
        }
      }
      
      this.clickFilter();
    });
  }

  getBody(){
    let json_form = "";
    if ( document.getElementById("individual").checked ){
      json_form = JSON.stringify({"tab": "all", "id": document.getElementById("form_date_filter_student-name").value, "teacher_mode": false});
    }else {
      let body = {"tab": "all",
        "class": document.getElementById("select_class").value,
        "group_id": document.getElementById("select_musical_instrument").value,
        "exam_date": document.getElementById("select_exam_date").value,
        "teacher_mode": true}
      json_form = JSON.stringify(body);
    }
    return json_form;
  }

  onFilterSuccess(date_type, url, date_from = null, date_to = null){
    let category = document.getElementById("hide-category");
    let body = {"type": date_type, "date_from": date_from, "date_to": date_to, "category_id": category.value};
    let select_state = document.getElementById("hide-select-state");
    let state = select_state.getAttribute("data-select");
    body[state] = select_state.value;
    if (document.getElementById("hide-select-class") !== null){
      body["class"] = document.getElementById("hide-select-class").value;
    }

    if (document.getElementById("hide-select-exam-date") !== null){
      body["exam_date"] = document.getElementById("hide-select-exam-date").value;
    }
    
    const filter = fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.getCsrfToken()
      },
      body: JSON.stringify(body),
    }).then(response => {
        if (response.ok) {
            return response.text();
        }
    });

    filter.then((data) => {
      // try{
      //   let result = JSON.parse(data);
      // } catch {
      $("#graph-frequency").html('');
      $("#graph-frequency").html(data);
      // document.getElementsByClassName("graph")[0].innerHTML = data;
      // $("#graph_frequency").load(window.location.href + "#graph_frequency");
      document.getElementsByClassName("dropdown-date-range")[0].classList.remove("show");
      // this.refreshGraph();
      // }
    });
  }

  selectTab(event){
    let select_state = document.getElementById("hide-select-state");
    let state = select_state.getAttribute("data-select");
    let body = {"tab": event.params["tab"], "category_id": event.params["id"]}
    body[state] = select_state.value;
    if (document.getElementById("hide-select-class") !== null){
      body["class"] = document.getElementById("hide-select-class").value;
    }
    if (document.getElementById("hide-select-exam-date") !== null){
      body["exam_date"] = document.getElementById("hide-select-exam-date").value;
    }
    
    body["teacher_mode"] = state == "group_id";
    const tab = fetch(event.params["url"], {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.getCsrfToken()
      },
      body: JSON.stringify(body),
    }).then(response => {
        if (response.ok) {
            return response.text();
        }
    });

    tab.then((data) => {
      try{
        let result = JSON.parse(data);
      } catch {
        $("#div-dashboard").html('');
        $("#div-dashboard").html(data);
        // document.getElementById("div-dashboard").innerHTML = '';
        // document.getElementById("div-dashboard").innerHTML = data;
        this.tabActive(event.params["tab"]);
        document.getElementById("hide-category").value = event.params["id"];
        this.showToolsTip();
        // this.refreshGraph();
      }
    });
  }

  tabActive(tab){
    let tab_dashboard = document.getElementsByClassName("dashboard-tab");
    for(let i=0; i < tab_dashboard.length; i++){
      if (tab_dashboard[i].classList.contains("active")){
        tab_dashboard[i].classList.remove("active");
      }
    }
    document.getElementById("dashboard-tab-"+tab).classList.add("active");
  }

  getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').content;
  }

  // refreshGraph(){
  //   Chartkick.eachChart(function(chart) {
  //     chart.updateData(chart.getDataSource());
  //     let id = chart.getElement().id;
  //     $("#"+id).load(window.location.href + "#"+id);
  //   //   // return null
  //   //   // chart.refreshData();
  //   //   // chart.redraw();
      
  //   });
  // }

  clickFilter(){
    let filter_btn = document.getElementsByClassName("filter-icon");
    let div_content = document.getElementsByClassName("div-filter-content");
    let all_div = document.getElementsByClassName("filter-select-by");

    if (div_content[0].offsetHeight < 20){
      filter_btn[0].classList.add("active");
      div_content[0].classList.add("active");
      
      setTimeout(function(){
        for( let i = 0; i < all_div.length; i++){
          all_div[i].style.visibility = "visible";
        }
      }, 300);
    }else{
      filter_btn[0].classList.remove("active");
      div_content[0].classList.remove("active");

      for( let i = 0; i < all_div.length; i++){
        all_div[i].style.visibility = "hidden";
      }
    }
  }

  filterName(event){
    if (event.params["filterBy"] == "individual" ){
      document.getElementsByClassName("individual-search")[0].style.display = "flex";
      document.getElementsByClassName("group-search")[0].style.display = "none";
      document.getElementById("hide-select-class").value = "";
      document.getElementById("hide-select-exam-date").value = "";
      document.getElementById("hide-select-state").setAttribute("data-select", "id");
      document.getElementById("form_date_filter_student-name").value = "";
      
    } else {
      document.getElementsByClassName("individual-search")[0].style.display = "none";
      document.getElementsByClassName("group-search")[0].style.display = "flex";
      document.getElementById("hide-select-state").setAttribute("data-select", "group_id");
      document.getElementById("select_musical_instrument").value = "";
      document.getElementById("select_class").value = "";
      document.getElementById("select_exam_date").value = "";
    }
  }

  rating(event){
    let rating = parseInt(event.params["rating"]);
    const stars = document.querySelectorAll(".stars svg");
    stars.forEach((star, index) => {
      if (index <= rating){
        star.classList.add("active");
      }else{
        star.classList.remove("active");
      }
    });
    document.getElementById("hide-rating").value = rating+1;
  }

  showToolsTip(){
    document.getElementById("dashboard-menu").classList.add("active");
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
  }

  expandComment(event){
    let role = event.params["role"];
    if (role == "3"){
      let table = $("#table-behaviour-comment-list").DataTable({
        scroll: true,
        destroy: true,
        dom: '<t>',
        length: 10,
        columns: [
            { data: 'subject' },
            { data: 'comment' },
            { data: 'rating' },
            { data: 'comment date' }
        ]
      });
    } else {
      let table = $("#table-behaviour-comment-list").DataTable({
        scroll: true,
        destroy: true,
        dom: '<t>',
        length: 10,
        columns: [
            { data: 'student' },
            { data: 'subject' },
            { data: 'comment' },
            { data: 'rating' },
            { data: 'comment date' }
        ]
      });
    }
  }

  expandCommentAdmin(){
    let table = $("#table-behaviour-comment-list-admin").DataTable({
      scroll: true,
      destroy: true,
      dom: '<t>',
      length: 10,
      columns: [
          { data: 'student' },
          { data: 'negative_times' },
          { data: 'status' },
          { data: 'latest_comment' },
          { data: 'action' }
      ]
    });
  }

  viewUser(event){
    const filter = fetch(event.params["url"], {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.getCsrfToken()
      },
      body: JSON.stringify({"user_id": event.params["id"]}),
    }).then(response => {
        if (response.ok) {
            return response.text();
        }
    });

    filter.then((data) => {
      $(".view-detail-user-comment").html('');
      $(".view-detail-user-comment").html(data);
    });

  }

  editStatus(event){
    let user_id = event.params["id"];
    let td_status = document.getElementById("behaviour-status-"+user_id);
    td_status.innerHTML = "";
    td_status.appendChild(this.createSelectStatus(user_id));
    let action = document.getElementById("action-"+user_id);
    let icon = action.querySelectorAll("svg");
    
    for (let i = 0; i < icon.length; i++){
      icon[i].style.display = "none";
    }
    action.innerHTML += this.saveIcon(user_id);

  }

  createSelectStatus(user_id){
    let select_status = document.createElement("select");
    select_status.classList.add("form-select");
    select_status.setAttribute("id", "select-status-"+user_id);
    let arr_option = [["Need help", "need help"], ["Appointed", "appointed"], ["Talked", "talked"]]

    for( let i=0; i < arr_option.length; i++){
      var option = document.createElement("option");
      option.value = arr_option[i][1];
      option.text = arr_option[i][0];
      select_status.appendChild(option);
    }
    return select_status
  }

  saveStatus(event){
    let user_id = event.params["id"];
    let application_path = document.getElementById("application-path");
    let url = application_path.value+"/dashboard/update_status";
    let selected_status = document.getElementById("select-status-"+user_id);
    const filter = fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.getCsrfToken()
      },
      body: JSON.stringify({"user_id": event.params["id"], "status": selected_status.value}),
    }).then(response => {
        if (response.ok) {
            return response.text();
        }
    });

    filter.then((data) => {
      $(".div-body-comment-admin").html("");
      $(".div-body-comment-admin").html(data);
      let table = $("#table-behaviour-comment-list-admin").DataTable({
        scroll: true,
        destroy: true,
        dom: '<t>',
        length: 10,
        columns: [
            { data: 'student' },
            { data: 'negative_times' },
            { data: 'status' },
            { data: 'latest_comment' },
            { data: 'action' }
        ]
      });
      if (selected_status.value !== "need help"){
        let show_comment = document.getElementsByClassName("td-show-comment-"+event.params["id"]);
        for (let i = 0; i < show_comment.length; i++){
          show_comment[i].style.backgroundColor = "transparent";
        }
      }
    });
  }

  saveIcon(user_id){
    return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy2-fill icon" viewBox="0 0 16 16" data-action="click->dashboard#saveStatus" data-dashboard-id-param="'+user_id+'"><path d="M12 2h-2v3h2z"/><path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5V2.914a1.5 1.5 0 0 0-.44-1.06L14.147.439A1.5 1.5 0 0 0 13.086 0zM4 6a1 1 0 0 1-1-1V1h10v4a1 1 0 0 1-1 1zM3 9h10a1 1 0 0 1 1 1v5H2v-5a1 1 0 0 1 1-1"/></svg>';
  }
}
