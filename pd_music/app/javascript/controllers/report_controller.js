import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    document.getElementById("report-menu").classList.add("active");
  }

  selectSubject(){
    let filter_btn = document.getElementsByClassName("filter-icon-report");
    let div_content = document.getElementById("div-filter-content-report");
    console.log(div_content.offsetHeight);
    if (div_content.offsetHeight < 60){
      filter_btn[0].classList.add("active");
      div_content.classList.add("active");
      
      setTimeout(function(){
        // for( let i = 0; i < all_div.length; i++){
          document.getElementById("nav-text-subject").style.display = "none";
          document.getElementById("nav-select-subject").style.display = "block";
          // all_div[i].style.visibility = "visible";
        // }
      }, 300);
    }else{
      filter_btn[0].classList.remove("active");
      div_content.classList.remove("active");

      document.getElementById("nav-text-subject").style.display = "block";
      document.getElementById("nav-select-subject").style.display = "none";
      // for( let i = 0; i < all_div.length; i++){
        // all_div[i].style.visibility = "hidden";
      // }
    }
  }

  selectUserOrSubject(event){
    let user = document.getElementById("filter-user");
    let subject = document.getElementById("filter-subject");
    let url = event.params["url"]+"?subject="+subject.value;
    if (user != null){
      url += "&user="+user.value;
    }
    const filter = fetch(url).then(response => {
      if (response.ok) {
        return response.text();
      }
    });

    filter.then((data) => {
      try{
        let result = JSON.parse(data);
      } catch{
        if (user != null){
          $("#user-name-text").text("User : "+user.options[user.selectedIndex].text);
        }
        $("#subject-name-text").text("Subject : "+subject.options[subject.selectedIndex].text);
        $("#div-summary-report").html('');
        $("#div-summary-report").html(data);
      }
    });
  }

  selectTab(event){
    let user = document.getElementById("filter-user");
    let subject = document.getElementById("filter-subject");
    let url = event.params["url"];

    if (user != null){
      url += "&user="+user.value;
    }

    const filter = fetch(url+"&subject="+subject.value).then(response => {
      if (response.ok) {
          return response.text();
      }
    });

    filter.then((data) => {
      try{
        let result = JSON.parse(data);
      } catch{
        $("#div-summary-report").html('');
        $("#div-summary-report").html(data);
        let tab = event.params["selectTab"];
        let active_tab = document.getElementsByClassName("report-tab");
        for (let i = 0; i < active_tab.length; i++){
          if (active_tab[i].classList.contains("active")){
            active_tab[i].classList.remove("active");
          }

          if (active_tab[i].id == "report-tab-"+tab){
            active_tab[i].classList.add("active");
          }
        }
      }
    });
  }

  filterHomework(event){
    const filter = fetch(event.params["url"]).then(response => {
      if (response.ok) {
          return response.text();
      }
    });

    filter.then((data) => {
      try{
        let result = JSON.parse(data);
      } catch{
        $("#div-summary-report").html('');
        $("#div-summary-report").html(data);
      }
    });
  }

  filterGraph(event){
    let arr_filter = [];
    let filter_graph = document.getElementsByClassName("check-filter-graph");
    let mode = false;
    for (let i = 0; i < filter_graph.length; i++){
      if (filter_graph[i].checked && filter_graph[i].value == ""){
        mode = true;
        continue;
      }

      if (mode){
        filter_graph[i].checked = false;
      } else {
        if (filter_graph[i].checked){
          arr_filter.push(filter_graph[i].value);
        }else {
          filter_graph[0].checked = false;
        }
      }
    }
    let url = event.params["url"];
    
    const filter = fetch(url+"&filter="+arr_filter.join(',')).then(response => {
      if (response.ok) {
          return response.text();
      }
    });

    filter.then((data) => {
      try{
        let result = JSON.parse(data);
      } catch{
        $(".div-graph").html('');
        $(".div-graph").html(data);
      }
    });
  }
}
