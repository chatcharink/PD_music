import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'
import "select2"
import WaveSurfer from "wavesurfer"

const arr_chord = {};

export default class extends Controller {
  connect() {
    document.getElementById("homework-menu").classList.add("active");
    let homework_side = document.getElementById("homeworkMenu");
    if (!homework_side.classList.contains("show")){
        homework_side.classList.add("show");
    }
    
    $('.select-answer').select2({
      width: "100%"
    });

    $('#form_homework_question').on('keypress', e => {
      if (e.which == 13) {
          return false;
      }
    });
  }

  createSubject(event){
    event.preventDefault();
    let subject_name = document.getElementById("subject");
    let class_period = document.getElementById("class-periods");

    let is_valid_class_period = /[0-9]/.test(class_period.value); 
    let is_valid_subject = false
    if (subject_name.value !== ""){
      is_valid_subject = true
    }else {
      subject_name.style.border = "1px solid #d31414";
      subject_name.style.background = "#f7caca";
      subject_name.value = "";
    }

    if (!is_valid_class_period){
      class_period.style.border = "1px solid #d31414";
      class_period.style.background = "#f7caca";
      class_period.value = "";
    }

    if (is_valid_subject && is_valid_class_period){
      const create_subject = fetch(event.target.action, {
          method: 'POST',
          body: new FormData(event.target),
      }).then(response => {
          if (response.ok) {
              return response.text();
          }
      });

      create_subject.then((data) => {
          try{
            let result = JSON.parse(data);
            this.alert(result["status"], result["message"]);
          } catch {
            $(".div-card-subject").html("");
            $(".div-card-subject").html(data);
            let subject_id = document.getElementById("update-subject-id");
            if (subject_id.value == ""){
              this.alert("success", "Add subject: "+subject_name.value+" successfully");
            } else {
              this.alert("success", "Update subject: "+subject_name.value+" successfully");
            }
            // Clear value in dialog
            $("#close-icon-create-subject-dialog").click();
          }
      });
    }
  }

  setDeleteId(event){
    let id = event.params["subjectId"];
    let name = event.params["name"];

    document.getElementById("delete-subject-name").innerHTML = " : "+name;
    document.getElementById("confirm-delete-subject").setAttribute("data-id", id);
    document.getElementById("confirm-delete-subject").setAttribute("data-name", name);
  }

  setDeleteHomeworkId(event){
    let url = event.params["url"];
    let name = event.params["name"];

    document.getElementById("delete-homework-name").innerHTML = " : "+name;
    document.getElementById("confirm-delete-homework").setAttribute("data-homework-name-param", name);
    document.getElementById("confirm-delete-homework").setAttribute("data-homework-url-param", url);
  }

  editSubject(event){
    document.getElementById("subject").value = event.params["name"];
    document.getElementById("description").value = event.params["description"];
    document.getElementById("class-periods").value = event.params["classPeriod"];
    document.getElementById("update-subject-id").value = event.params["subjectId"];
    document.getElementById("btn-submit-form-create-subject").value = "Update";
  }

  clearSubject(){
    let subject_name = document.getElementById("subject");
    let class_period = document.getElementById("class-periods");
    subject_name.value = "";
    class_period.value = "";
    this.valid_value(subject_name);
    this.valid_value(class_period);
    document.getElementById("description").value = "";
    document.getElementById("update-subject-id").value = "";
    document.getElementById("btn-submit-form-create-subject").value = "Create";
  }

  deleteSubject(){
    let id = document.getElementById("confirm-delete-subject").getAttribute("data-id");
    let name = document.getElementById("confirm-delete-subject").getAttribute("data-name");
    let application_path = document.getElementById("application-path");
    let url = application_path.value+"/homework/"+id
    const delete_subject = fetch(url, {
      method: 'DELETE',
      headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": this.getCsrfToken()
      },
      body: JSON.stringify({ "name": name }),
    }).then(response => {
      if (response.ok) {
          return response.text();
      }
    });

    delete_subject.then((data) => {
      try{
          let result = JSON.parse(data);
          this.alert(result["status"], result["message"]);
      } catch {
          $("#close-confirm-delete-subject").click();
          $(".div-card-subject").html("");
          $(".div-card-subject").html(data);
          this.alert("success", "Delete : "+name+" successfully");
          // $("#div-body-subject").html(data);
      }
    });
  }

  deleteHomework(event){
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

  selectCategory(event){
    let url = event.params["url"];
    const change_tab = fetch(url).then(response => {
      if (response.ok) {
        return response.text();
      }
    });

    change_tab.then((data) => {
      try{
        let result = JSON.parse(data);
      } catch {
        if (document.getElementsByClassName("tmp-side-homework-tag").length > 0){
          $(".tmp-side-homework-tag").remove();
        }
        $("#div-body-subject").html("");
        $("#div-body-subject").html(data);
        let tab = document.getElementsByClassName("dashboard-tab");
        for (let i= 0; i < tab.length; i++){
          if (tab[i].classList.contains("active")){
            tab[i].classList.remove("active");
          }
        }
        document.getElementById("dashboard-tab-"+event.params["tab"]).classList.add("active");
      }
    });
  }

  selectHomeworkType(event){
    let url = event.params["url"];
    const change_tab = fetch(url).then(response => {
      if (response.ok) {
        return response.text();
      }
    });

    change_tab.then((data) => {
      try{
        let result = JSON.parse(data);
      } catch {
        $(".div-table-homework").html("");
        $(".div-table-homework").html(data);
        let tab = document.getElementsByClassName("tab-kind");
        for (let i= 0; i < tab.length; i++){
          if (tab[i].classList.contains("active")){
            tab[i].classList.remove("active");
          }
        }
        document.getElementById("sub-tab-"+event.params["homeworkType"]).classList.add("active");
      }
    });
  }

  showHomework(event){
    // let subject = event.params["subject"];
    let url = event.params["url"];
    const show_homework = fetch(url).then(response => {
      if (response.ok) {
        return response.text();
      }
    });

    show_homework.then((data) => {
      try{
        let result = JSON.parse(data);
      } catch {
        $("#div-body-subject").html("");
        $("#div-body-subject").html(data);
      }
    });
    
  }

  addTagSuccess(event){
    event.preventDefault();
    let tag = document.getElementById("homework_tag");
    if (tag.value == ""){
      this.invalid_value(tag);
    } else{
      this.valid_value(tag);
      const create_tag = fetch(event.target.action, {
        method: 'POST',
        body: new FormData(event.target),
      }).then(response => {
        if (response.ok) {
          return response.text();
        }
      });
  
      create_tag.then((data) => {
        try{
          let result = JSON.parse(data);
          this.alert(result["status"], result["message"]);
        } catch {
          document.getElementById("btn-close-add-tag").click();
          $(".div-tag-list").html("");
          $(".div-tag-list").html(data);

          this.alert("success", "Add tag: "+tag.value+" successfully");
        }
      });
    }
  }

  getImprovementDetail(event){
    let url = event.params["url"];
    const improvement = fetch(url).then(response => {
      if (response.ok) {
        return response.text();
      }
    });

    improvement.then((data) => {
      try{
        let result = JSON.parse(data);
        this.alert(result["status"], result["message"]);
      }catch(error){
        $(".div-give-improvement").html("");
        $(".div-give-improvement").html(data);
        $(".btn-show-improve-dialog").click();
      }
    });
  }

  submitImprovement(event){
    event.preventDefault();
    let development = document.getElementsByClassName("development-field");
    let has_invalid = false;
    for(let i=0; i < development.length; i++){
      if (development[i].value == ""){
        development[i].value = 0;
      }
      if (/[0-9]/i.test(development[i].value)){
        this.valid_value(development[i]);
      }else {
        this.invalid_value(development[i]);
        has_invalid = true;
      }
     
    }

    if (!has_invalid){
      const improvement = fetch(event.target.action, {
        method: 'POST',
        body: new FormData(event.target),
      }).then(response => {
        if (response.ok) {
          return response.text();
        }
      });
  
      improvement.then((data) => {
        try{
          let result = JSON.parse(data);
          this.alert(result["status"], result["message"]);
        }catch(error){
          // $("#btn-close-improvement-dialog").click();
          // $(".div-give-improvement").html("");
          // $(".div-give-improvement").html(data);
          // this.alert("success", "Add development of student success");
        }
      });
    }
  }

  showHomeworkTable(event){
    let url = event.params["url"];
    let permission = event.params["hasPermission"];
    if (permission){
      const show_homework = fetch(url).then(response => {
        if (response.ok) {
          return response.text();
        }
      });

      show_homework.then((data) => {
        try{
          let result = JSON.parse(data);
          this.alert(result["status"], result["message"]);
        } catch {
          let nav_homework_menu = document.getElementById("homeworkMenu");
          let tag_list = document.getElementsByClassName("hide-tag-data");
          if (document.getElementsByClassName("tmp-side-homework-tag").length <= 0){
            for (let i=0; i < tag_list.length; i++){
              let url = tag_list[i].getAttribute("data-url");
              let nav = "<div class=\"nav-side-menu nav-sub-side-menu py-3 ps-5 pe-4 w-90 tmp-side-homework-tag\" data-action=\"click->layout#showHomeworkTable\" data-layout-url-param="+url+"><span>"+tag_list[i].value+"</span></div>"
              nav_homework_menu.insertAdjacentHTML("beforeend", nav);
            }
          }
          $(".div-tag-list").html("");
          $(".div-tag-list").html(data);
        }
      });
    }else{
      this.alert("error", "You don't have permission to view homework");
    }
  }

  addHomeworktypeSuccess(event){
    event.preventDefault();

    let type = document.getElementById("homework_type");
    if (type.value == ""){
      this.invalid_value(type);
    } else{
      this.valid_value(type);
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
            result = JSON.parse(data);
            this.alert(result["status"], result["message"]);
          } catch {
            document.getElementById("btn-close-add-hw-type").click();
            $("#div-body-subject").html("");
            $("#div-body-subject").html(data);

            this.alert("success", "Add homework type: "+type.value+" successfully");
          }
      });
    }
  }

  openAddUserModal(event){
    let homework_id = event.params["homeworkId"];
    document.getElementById("homework_id").value = homework_id;
    let url = event.params["url"];

    const homework = fetch(url+"?id="+homework_id).then(response => {
      if (response.ok) {
        return response.text();
      }
    });
  
    homework.then((data) => {
      try{
        let result = JSON.parse(data);
        let arr_homework = result["homework_user_mapping"];
        let user_list = document.getElementsByClassName("div-user-list");
        for (let i = 0; i < user_list.length; i++){
          let id = user_list[i].id.replace("user-list-", "");
          if (arr_homework.includes(parseInt(id))){
              user_list[i].classList.add("selected");
          }else {
              user_list[i].classList.remove("selected");
          }
        }
      } catch(e) {
          console.log(e)
      }
    });
  }

  addUser(event){
    let div_user;
    let type;
    if (typeof event.params["id"] == "undefined"){
      let classroom = event.params["class"];
      div_user = document.getElementById("class-list-"+classroom);
        type = "class"
    } else {
      let id = event.params["id"];
      div_user = document.getElementById("user-list-"+id);
      type = "user";
    }

    if (div_user.classList.contains("selected")){
      return;
    }
    
    let div_user_child = div_user.children;

    if (div_user.classList.contains("active")){
      div_user_child[2].classList.remove("d-none");
      div_user_child[2].classList.add("d-inline");

      div_user_child[1].classList.add("d-none");
      div_user_child[1].classList.remove("d-inline");
      div_user.classList.remove("active");
    } else {
      div_user_child[1].classList.add("d-inline");
      div_user_child[1].classList.remove("d-none");

      div_user_child[2].classList.remove("d-inline");
      div_user_child[2].classList.add("d-none");
      div_user.classList.add("active");
    }

    let selected_user = document.getElementById("selected_user");
    selected_user.value = this.getSelectedUser(type);
    document.getElementById("add_by").value = type;
  }

  clearUser(){
    let user_list = document.getElementsByClassName("div-user-list");
    for (let i = 0; i < user_list.length; i++ ){
      user_list[i].classList.remove("active");
      let child = user_list[i].children;
      child[2].classList.remove("d-none");
      child[2].classList.add("d-inline");
      child[1].classList.add("d-none");
      child[1].classList.remove("d-inline");
    }
  }

  clearClass(){
    let class_list = document.getElementsByClassName("div-class-list");
    for (let i = 0; i < class_list.length; i++ ){
      class_list[i].classList.remove("active");
      let child = class_list[i].children;
      child[2].classList.remove("d-none");
      child[2].classList.add("d-inline");
      child[1].classList.add("d-none");
      child[1].classList.remove("d-inline");
    }
  }

  getSelectedUser(type){
    let users = document.getElementsByClassName("div-"+type+"-list");
    let arr_user = [];
    for (let i = 0; i < users.length; i++){
      if (users[i].classList.contains("active")){
          arr_user.push(users[i].getAttribute("data-value"));
      }
    }
    return arr_user
  }

  submitAddUser(event){
    let selected_user = document.getElementById("selected_user");
    let url = event.params["url"];
    let type = document.getElementById("add_by");
    let homework_id = document.getElementById("homework_id");

    const add_user = fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": this.getCsrfToken()
        },
        body: JSON.stringify({ "homework_id": homework_id.value, "users": selected_user.value, "type": type.value}),
    }).then(response => {
        if (response.ok) {
            return response.text();
        }
    });

    add_user.then((data) => {
        try{
            let result = JSON.parse(data);
            // if (is_edit.value != ""){
            //     window.location.replace(is_edit.value);
            // } else {
                this.alert(result["status"], result["message"]);
            // }
        } catch(e) {
            console.log(e);
            $(".div-add-user-modal").html("");
            $(".div-add-user-modal").html(data);
            this.alert("success", "Add users to homework successfully");
        }
    });
  }

  setDefaultHomework(){
    let set_default = document.getElementById("flexSwitchSetDefault");
    let priority = document.getElementById("priority");
    if (set_default.checked){
      priority.disabled = false;
      let priority_value = document.getElementById("priority-hidden");
      priority.value = priority_value.value;
    }else{
      priority.disabled = true;
      priority.value = "";
    }
  }

  lockHomework(){
    let lock_icon = document.getElementsByClassName("div-lock-homework");
    for (let i=0; i < lock_icon.length; i++){
      if (lock_icon[i].classList.contains("d-inline")){
        lock_icon[i].classList.remove("d-inline");
        lock_icon[i].classList.add("d-none");
      } else {
        lock_icon[i].classList.remove("d-none");
        lock_icon[i].classList.add("d-inline");
        document.getElementById("is-lock-homework").value = lock_icon[i].getAttribute("data-value");
      }
    }
  }

  addQuestion(event){
    event.preventDefault();
    let question_no = event.params["questionNo"];
    // let form = document.getElementById("form_homework_question");
    // let formData = new FormData(form);
    // formData.append("question_no", question_no);
    // console.log(event.params["url"]);
    const questions = fetch(event.params["url"], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.getCsrfToken()
      },
      body: JSON.stringify({"question_no": question_no}),
    }).then(response => {
      if (response.ok) {
        return response.text();
      }
    });

    questions.then((data) => {
      $(".div-question").append(data);
      let add_question_btn = document.getElementById("add-question-btn");
      add_question_btn.setAttribute("data-homework-question-no-param", parseInt(question_no)+1);
      $('.select-answer').select2({
        width: "100%"
      });
    });
  }

  selectAnswerFormat(event){
    let format = event.params["format"];
    
    let question_no = event.params["questionNo"];
    const answer_format = fetch(event.params["url"], {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.getCsrfToken()
      },
      body: JSON.stringify({"format": format, "question_no": question_no}),
    }).then(response => {
      if (response.ok) {
        return response.text();
      }
    });

    answer_format.then((data) => {
      document.getElementById("div-select-correct-answer-"+question_no).style.display = "block"
      if (format == "1"){
        arr_chord["question_"+question_no] = [];
      } else if (format == "2"){
        this.addAnswerOption(1, question_no);
      } else if (format == "3"){
        document.getElementById("div-select-correct-answer-"+question_no).style.display = "none"
      }
      document.getElementById("selected-format-"+question_no).value = format;
      $(".selected-answer-"+question_no).html("");
      $(".selected-answer-"+question_no).append(data);
      // $(".selected-answer-"+question_no).html("");
      // $(".selected-answer-"+question_no).html(data);
    });
  }


  addChord(event){
    let length = event.params["no"];
    let chord = document.getElementById("form_homework_input_chord_"+length);
    let warning_icon = document.getElementById("warning-invalid-chord-"+length);
    let div_select_chord = document.getElementById("div-select-chord-"+length);

    if (arr_chord["question_"+length].length == 0){
      document.getElementById("no-chord-"+length).remove();
      div_select_chord.classList.remove("text-center");
    }
    if (chord.value != "" && !arr_chord["question_"+length].includes(chord.value)){
      arr_chord["question_"+length].push(chord.value);
      this.setSelectChordValues(length);
      let chord_btn = this.createChordButton(chord.value, length);
      // div_select_chord.innerHTML += chord_btn;
      div_select_chord.insertAdjacentHTML("beforeend", chord_btn);
      this.addAnswerOption(chord.value, length);
      chord.style.border = "1px solid #dee2e6";
      chord.value = ""
      warning_icon.style.display = "none";
     
    } else {
      warning_icon.setAttribute("data-bs-toggle", "tooltip");
      warning_icon.setAttribute("title", "Chord could not be blank or duplicate");
      warning_icon.style.display = "inline";
      chord.style.border = "1px solid #d31414";
      this.showToolsTip();
    } 
  }

  addAnswerOption(val, length){
    let newOption = new Option(val, val.toString().toLowerCase(), false, false);
    $('#select-answer-'+length).append(newOption).trigger("change");
  }

  createChordButton(chord, length){
    let str_chord = chord.split(" ").join("-");
    let button = '<div class="d-inline" id="div-chord-'+str_chord+'-'+length+'"><input type="checkbox" class="btn-check" id="btn-check-chord-'+str_chord+'-'+length+'" value="'+chord.toLowerCase()+'" autocomplete="off" data-action="change->homework#isChordActiveButton" data-homework-chord-param='+str_chord+' data-homework-length-param='+length+' >'
    button += '<label class="btn btn-outline-primary mx-1 mb-3" for="btn-check-chord-'+str_chord+'-'+length+'">'+chord+'</label>'
    button += '<span class="d-inline-block badge rounded-pill delete-chord-x-icon" data-action="click->homework#removeChordButton" data-homework-chord-param="'+chord+'" data-homework-no-param='+length+'>x</span></div>'
    return button
  }

  isChordActiveButton(event){
    let length = event.params["length"];
    let chord = event.params["chord"];
    let button = document.getElementById("btn-check-chord-"+chord+'-'+length);
    const arr_multiselect = $("#select-answer-"+length).val();
    if (button.checked){
      arr_multiselect.push(button.value);
    }else {
      let index = arr_multiselect.indexOf(button.value);
      if (index > -1) { arr_multiselect.splice(index, 1)}
    }
    $("#select-answer-"+length).val(arr_multiselect).trigger("change");
  }

  removeChordButton(event){
    let chord = event.params["chord"];
    let length = event.params["no"];
    let str_chord = chord.split(" ").join("-");
    document.getElementById("div-chord-"+str_chord+'-'+length).remove();
    if ($('#select-answer-'+length).find("option[value='" + chord.toLowerCase() + "']").length > 0){
      $('#select-answer-'+length).find("option[value='" + chord.toLowerCase() + "']").remove();
    }
    let index = arr_chord["question_"+length].indexOf(chord);
    if (index > -1) {
      arr_chord["question_"+length].splice(index, 1);
    }
    this.setSelectChordValues(length);
  }

  setSelectChordValues(question_no){
    let selected_chord = document.getElementById("all-chord-"+question_no);
    selected_chord.value = arr_chord["question_"+question_no];
  }

  addChoices(event){
    let question_no = event.params["questionNo"];
    let answer_no = event.params["answerNo"];
    const choice = fetch(event.params["url"], {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.getCsrfToken()
      },
      body: JSON.stringify({"question_no": question_no, "answer_no": answer_no}),
    }).then(response => {
      if (response.ok) {
        return response.text();
      }
    });

    choice.then((data) => {
      $("#div-choices-"+question_no).append(data);
      let add_choice_btn = document.getElementById("add-choice-btn-"+question_no);
      add_choice_btn.setAttribute("data-homework-answer-no-param", parseInt(answer_no)+1);

      // Add remove button
      let div_btn = document.getElementById("div-icon-add-remove-choice-"+question_no);
      let remove_btn = document.getElementById("icon-remove-choice-"+question_no);
      if (remove_btn == null){
        div_btn.innerHTML += this.removeChoiceIcon(question_no, answer_no);
      } else {
        remove_btn.setAttribute("data-homework-answer-no-param", parseInt(answer_no)+1);
      }

      // Add select answer
      this.addAnswerOption(parseInt(answer_no)+1, question_no);
    });
  }

  removeChoice(event){
    let question_no = event.params["questionNo"];
    let answer_no = event.params["answerNo"];
    let default_choice = document.getElementById("sub-choice-"+question_no+"-"+answer_no);
    if ($('#select-answer-'+question_no).find("option[value='" + answer_no.toString() + "']").length > 0){
      $('#select-answer-'+question_no).find("option[value='" + answer_no.toString() + "']").remove();
    }
    default_choice.remove();
    let remove_btn = document.getElementById("icon-remove-choice-"+question_no);

    if ((parseInt(answer_no)-1) <= 1){
      if (remove_btn != null){
        remove_btn.remove();
      }
    }
    remove_btn.setAttribute("data-homework-answer-no-param", parseInt(answer_no)-1);
    let add_choice_btn = document.getElementById("add-choice-btn-"+question_no);
    add_choice_btn.setAttribute("data-homework-answer-no-param", parseInt(answer_no)-1);
  }

  removeChoiceIcon(question, answer){
    let icon = '<div class="remove-choice d-inline ms-3" id="icon-remove-choice-'+question+'" data-action="click->homework#removeChoice" data-homework-question-no-param="'+question+'" data-homework-answer-no-param="'+answer+'"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-node-minus-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M16 8a5 5 0 0 1-9.975.5H4A1.5 1.5 0 0 1 2.5 10h-1A1.5 1.5 0 0 1 0 8.5v-1A1.5 1.5 0 0 1 1.5 6h1A1.5 1.5 0 0 1 4 7.5h2.025A5 5 0 0 1 16 8m-2 0a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h5A.5.5 0 0 0 14 8"/></svg> Remove choice</div>';
    return icon
  }

  uploadPicture(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    let length = event.params["no"];

    if (typeof file == "undefined"){
      document.getElementById("question_picture_"+length).disabled = true;
    }

    reader.onloadend = () => {
      this.clearVideo("question_video_"+length, "video-player-"+length);
      this.clearAudio("question_audio_"+length, "div-audio-"+length);
      this.setImageAttribute("picture-question-"+length, reader.result, "500", "250");
      document.getElementById("question_picture_"+length).disabled = false;
      document.getElementById("div-image-resize-"+length).style.display = "inline-flex";
      document.getElementById("update-question-media-"+length).value = true;
    };

    if (file) {
        reader.readAsDataURL(file);
    // this.saveAvatar(file, wrapper);
    }
  }

  resizeImage(event){
    let question_no = event.params["questionNo"];
    let reveal = "";
    if (event.params["reveal"] != null){
      reveal = "reveal-";
    }
    document.getElementById("div-image-"+reveal+question_no).style.width = event.params["width"];
    document.getElementById("div-image-"+reveal+question_no).style.height = event.params["height"];
  }

  resizeImageAnswer(event){
    let question_no = event.params["questionNo"];
    let answer_no = event.params["answerNo"];
    document.getElementById("div-image-"+question_no+"-"+answer_no).style.width = event.params["width"];
    document.getElementById("div-image-"+question_no+"-"+answer_no).style.height = event.params["height"];
  }

  setImageAttribute(elem, src, width, height){
    let image = document.getElementById(elem);
    image.src = src;
    // image.style.width = "100%";
    // image.style.height = "100%";
  }

  uploadVideo(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    let length = event.params["no"];
    let div_media = document.getElementById("div-media-"+length);

    if (typeof file == "undefined"){
        document.getElementById("question_video_"+length).disabled = true;
    }

    reader.onloadend = () => {
      this.clearPicture("question_picture_"+length, "picture-question-"+length, "div-image-resize-"+length);
      this.clearAudio("question_audio_"+length, "div-audio-"+length);
      let video = this.setVideoAttribute("video-player-"+length, reader.result, "500", "250");
      div_media.appendChild(video);
      document.getElementById("question_video_"+length).disabled = false;
      document.getElementById("update-question-media-"+length).value = true;
    };

    if (file) {
        reader.readAsDataURL(file);
    // this.saveAvatar(file, wrapper);
    }
  }

  setVideoAttribute(id, src, width, height){
    let video = document.createElement('video');
    video.src = src;
    video.id = id;
    video.autoplay = true;
    video.setAttribute("controls", true);
    video.style.width = width+"px";
    video.style.height = height+"px";
    return video
  }

  uploadAudio(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    let length = event.params["no"];
    let div_media = document.getElementById("div-media-"+length);

    if (typeof file == "undefined"){
        document.getElementById("question_audio_"+length).disabled = true;
    }

    reader.onloadend = () => {
      this.clearPicture("question_picture_"+length, "picture-question-"+length, "div-image-resize-"+length);
      this.clearVideo("question_video_"+length, "video-player-"+length);
      const audio = this.setAudioAttribute("audio-player-"+length, reader.result, "75%");
      const div_audio = this.setDivAudioAttribute("div-audio-"+length);
      this.setForwordBackwardButton(div_audio, "audio-player-"+length);
      div_audio.appendChild(audio);
      div_media.appendChild(div_audio);

      document.getElementById("question_audio_"+length).disabled = false;
      document.getElementById("update-question-media-"+length).value = true;
    };

    if (file) {
        reader.readAsDataURL(file);
    // this.saveAvatar(file, wrapper);
    }
  }

  setDivAudioAttribute(id){
    const div_audio = document.createElement("div");
    div_audio.id = id;
    div_audio.classList.add("div-audio");
    div_audio.classList.add("text-center");
    div_audio.classList.add("m-auto");
    div_audio.classList.add("rounded-3");
    div_audio.classList.add("ms-3");
    div_audio.classList.add("active");
    return div_audio;
  }

  setAudioAttribute(id, src, width_percent = null){
    const audio = document.createElement('audio');
    audio.id       = id;
    audio.controls = "controls";
    if (width_percent != null){
      audio.style.width = width_percent;
    }
    audio.src      = src;
    return audio
  }

  setForwordBackwardButton(elem, audio_id){
    let forward_btn = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-skip-forward-fill ms-3" data-action="click->homework#forwardWav" data-homework-audio-id-param="'+audio_id+'" viewBox="0 0 16 16"><path d="M15.5 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V8.753l-6.267 3.636c-.54.313-1.233-.066-1.233-.697v-2.94l-6.267 3.636C.693 12.703 0 12.324 0 11.693V4.308c0-.63.693-1.01 1.233-.696L7.5 7.248v-2.94c0-.63.693-1.01 1.233-.696L15 7.248V4a.5.5 0 0 1 .5-.5"/></svg>'
    let backward_btn = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-skip-backward-fill ms-3" data-action="click->homework#backwardWav" data-homework-audio-id-param="'+audio_id+'" viewBox="0 0 16 16"><path d="M.5 3.5A.5.5 0 0 0 0 4v8a.5.5 0 0 0 1 0V8.753l6.267 3.636c.54.313 1.233-.066 1.233-.697v-2.94l6.267 3.636c.54.314 1.233-.065 1.233-.696V4.308c0-.63-.693-1.01-1.233-.696L8.5 7.248v-2.94c0-.63-.692-1.01-1.233-.696L1 7.248V4a.5.5 0 0 0-.5-.5"/></svg>'
   
    elem.insertAdjacentHTML("beforeend", forward_btn);
    elem.insertAdjacentHTML("beforeend", backward_btn);
  }

  forwardWav(){
    let audio = document.getElementById(event.params["audioId"]);
    audio.currentTime += 10;
  }

  backwardWav(){
    let audio = document.getElementById(event.params["audioId"]);
    audio.currentTime -= 10;
  }

  clearPicture(elem_file_id, elem_picture_id, div_image){
    let image = document.getElementById(elem_picture_id);
    image.removeAttribute("src");
    image.removeAttribute("style");
    document.getElementById(elem_file_id).value = "";
    document.getElementById(div_image).style.display = "none";
  }

  clearVideo(elem_file_id, elem_video_id){
    let video = document.getElementById(elem_video_id);
    if (video !== null){
      video.remove();
    }
    document.getElementById(elem_file_id).value = "";
  }

  clearAudio(elem_file_id, elem_audio_div){
    let div_audio = document.getElementById(elem_audio_div);
    if (div_audio !== null){
      div_audio.remove();
    }

    document.getElementById(elem_file_id).value = "";
  }

  uploadAnswerPicture(event) {
    let answer_no = event.params["answerNo"];
    let question_no = event.params["questionNo"];

    const file = event.target.files[0];
    const reader = new FileReader();

    if (typeof file == "undefined"){
        document.getElementById("answer-picture-"+question_no+"-"+answer_no).disabled = true;
    }

    reader.onloadend = () => {
      this.clearVideo("answer-video-"+question_no+"-"+answer_no, "video-player-answer-"+question_no+"-"+answer_no);
      this.clearAudio("answer-audio-"+question_no+"-"+answer_no, "div-audio-answer-"+question_no+"-"+answer_no);
      this.clearAnswerText(question_no, answer_no);
      
      // Change picture
      let image = this.setImageAttribute("answer-image-"+question_no+"-"+answer_no, reader.result, "500", "250");
      // image.classList.add("ms-3");

      document.getElementById("answer-picture-"+question_no+"-"+answer_no).disabled = false;
      document.getElementById("image-answer-"+question_no+"-"+answer_no).style.display = "block";
      document.getElementById("div-image-resize-"+question_no+"-"+answer_no).style.display = "inline-flex";
      document.getElementById("update-answer-media-"+question_no+"-"+answer_no).value = true;
    };

    if (file) {
        reader.readAsDataURL(file);
    // this.saveAvatar(file, wrapper);
    }
  }

  uploadAnswerVideo(event) {
    let answer_no = event.params["answerNo"];
    let question_no = event.params["questionNo"];

    const file = event.target.files[0];
    const reader = new FileReader();

    let div_media = document.getElementById("div-display-media-answer-"+question_no+"-"+answer_no);

    if (typeof file == "undefined"){
        document.getElementById("answer-video-"+question_no+"-"+answer_no).disabled = true;
    }

    reader.onloadend = () => {
      this.clearPicture("answer-picture-"+question_no+"-"+answer_no, "answer-image-"+question_no+"-"+answer_no, "image-answer-"+question_no+"-"+answer_no);
      this.clearAudio("answer-audio-"+question_no+"-"+answer_no, "div-audio-answer-"+question_no+"-"+answer_no);
      this.clearAnswerText(question_no, answer_no);

      // Create video
      let video = this.setVideoAttribute("video-player-answer-"+question_no+"-"+answer_no, reader.result, "500", "250");
      video.classList.add("ms-3");

      div_media.appendChild(video);
      document.getElementById("answer-video-"+question_no+"-"+answer_no).disabled = false;
      document.getElementById("update-answer-media-"+question_no+"-"+answer_no).value = true;
    };

    if (file) {
        reader.readAsDataURL(file);
    // this.saveAvatar(file, wrapper);
    }
  }

  uploadAnswerAudio(event) {
    let answer_no = event.params["answerNo"];
    let question_no = event.params["questionNo"];

    const file = event.target.files[0];
    const reader = new FileReader();

    let div_media = document.getElementById("div-display-media-answer-"+question_no+"-"+answer_no);

    if (typeof file == "undefined"){
        document.getElementById("answer-audio-"+question_no+"-"+answer_no).disabled = true;
    }

    reader.onloadend = () => {
      this.clearPicture("answer-picture-"+question_no+"-"+answer_no, "answer-image-"+question_no+"-"+answer_no, "image-answer-"+question_no+"-"+answer_no);
      this.clearVideo("answer-video-"+question_no+"-"+answer_no, "video-player-answer-"+question_no+"-"+answer_no);
      this.clearAnswerText(question_no, answer_no);

      // Create Audio
      const audio = this.setAudioAttribute("audio-player-answer-"+question_no+"-"+answer_no, reader.result);
      const div_audio = this.setDivAudioAttribute("div-audio-answer-"+question_no+"-"+answer_no);
      
      this.setForwordBackwardButton(div_audio, "audio-player-answer-"+question_no+"-"+answer_no);
      div_audio.appendChild(audio);

      div_media.appendChild(div_audio);
      document.getElementById("answer-audio-"+question_no+"-"+answer_no).disabled = false;
      document.getElementById("update-answer-media-"+question_no+"-"+answer_no).value = true;
    };

    if (file) {
        reader.readAsDataURL(file);
    // this.saveAvatar(file, wrapper);
    }
  }

  createInputText(event){
    let answer_no = event.params["answerNo"];
    let question_no = event.params["questionNo"];

    let has_textfield = document.getElementById("form-homework-input-choice-"+question_no+"-"+answer_no);
    
    if (has_textfield == null){
      let textfield = document.createElement("input");
      textfield.setAttribute("type", "text");
      textfield.id = "form-homework-input-choice-"+question_no+"-"+answer_no;
      textfield.classList.add("form-control");
      textfield.classList.add("w-100");
      textfield.classList.add("d-inline");
      textfield.classList.add("ms-3");
      this.clearAudio("answer-audio-"+question_no+"-"+answer_no, "div-audio-answer-"+question_no+"-"+answer_no);
      this.clearPicture("answer-picture-"+question_no+"-"+answer_no, "answer-image-"+question_no+"-"+answer_no, "image-answer-"+question_no+"-"+answer_no);
      this.clearVideo("answer-video-"+question_no+"-"+answer_no, "video-player-answer-"+question_no+"-"+answer_no);
      let div_ans_media = document.getElementById("div-display-media-answer-"+question_no+"-"+answer_no);
      div_ans_media.insertBefore(textfield, document.getElementById("image-answer-"+question_no+"-"+answer_no)); 
      // div_ans_media.appendChild(textfield);
    }
  }

  clearAnswerText(question, answer){
    let text_field = document.getElementById("form-homework-input-choice-"+question+"-"+answer);
    
    if (text_field !== null){
      text_field.remove();
    }
  }

  uploadRevealPicture(event) {
    let question_no = event.params["questionNo"];

    const file = event.target.files[0];
    const reader = new FileReader();

    if (typeof file == "undefined"){
        document.getElementById("reveal-picture-"+question_no).disabled = true;
    }

    reader.onloadend = () => {
      this.clearVideo("reveal-video-"+question_no, "video-player-reveal-"+question_no);
      this.clearAudio("reveal-audio-"+question_no, "div-audio-reveal-"+question_no);
      
      // Change picture
      let image = this.setImageAttribute("picture-reveal-"+question_no, reader.result, "500", "250");
      document.getElementById("upload-reveal-icon-"+question_no).style.display = "none";
      document.getElementById("reveal-picture-"+question_no).disabled = false;
      document.getElementById("div-reveal-image-resize-"+question_no).style.display = "inline-flex";
      document.getElementById("update-reveal-media-"+question_no).value = true;
    };

    if (file) {
      reader.readAsDataURL(file);
    // this.saveAvatar(file, wrapper);
    }
  }

  uploadRevealVideo(event) {
    let question_no = event.params["questionNo"];

    const file = event.target.files[0];
    const reader = new FileReader();

    let div_media = document.getElementById("media-reveal-"+question_no);

    if (typeof file == "undefined"){
        document.getElementById("reveal-video-"+question_no).disabled = true;
    }

    reader.onloadend = () => {
      this.clearPicture("reveal-picture-"+question_no, "picture-reveal-"+question_no, "div-reveal-image-resize-"+question_no);
      this.clearAudio("reveal-audio-"+question_no, "div-audio-reveal-"+question_no);

      // Create video
      let video = this.setVideoAttribute("video-player-reveal-"+question_no, reader.result, "500", "250");
      div_media.appendChild(video);

      document.getElementById("upload-reveal-icon-"+question_no).style.display = "none";
      document.getElementById("reveal-video-"+question_no).disabled = false;
      document.getElementById("update-reveal-media-"+question_no).value = true;
    };

    if (file) {
        reader.readAsDataURL(file);
    // this.saveAvatar(file, wrapper);
    }
  }

  uploadRevealAudio(event) {
    let question_no = event.params["questionNo"];

    const file = event.target.files[0];
    const reader = new FileReader();

    let div_media = document.getElementById("media-reveal-"+question_no);

    if (typeof file == "undefined"){
        document.getElementById("reveal-audio-"+question_no).disabled = true;
    }

    reader.onloadend = () => {
      this.clearPicture("reveal-picture-"+question_no, "picture-reveal-"+question_no, "div-reveal-image-resize-"+question_no);
      this.clearVideo("reveal-video-"+question_no, "video-player-reveal-"+question_no);

      // Create Audio
      const audio = this.setAudioAttribute("audio-player-reveal-"+question_no, reader.result, "75%");
      const div_audio = this.setDivAudioAttribute("div-audio-reveal-"+question_no);
    
      this.setForwordBackwardButton(div_audio, "audio-player-reveal-"+question_no);
      div_audio.appendChild(audio);
      div_media.appendChild(div_audio);

      document.getElementById("upload-reveal-icon-"+question_no).style.display = "none";
      document.getElementById("reveal-audio-"+question_no).disabled = false;
      document.getElementById("update-reveal-media-"+question_no).value = true;
    };

    if (file) {
        reader.readAsDataURL(file);
    // this.saveAvatar(file, wrapper);
    }
  }

  selectOption(event){
    let question_no = event.params["questionNo"];
    let options = document.getElementsByName("form_questions[question"+question_no+"][option]");
    let div_upload = document.getElementById("div-upload-reveal-"+question_no);
    for (let i = 0 ; i < options.length; i++){
      if (options[i].checked && options[i].value == "reveal"){
        div_upload.classList.add("active");
        break;
      }else {
        div_upload.classList.remove("active");
      }
    }
  }

  getQuestion(question_no){
    let questions = [];
    let media = document.getElementsByClassName("question-value-"+question_no);
    for (let j = 0; j < media.length; j++){
      if (media[j].value != null && media[j].value != ""){
        questions.push(media[j].files[0]);
      }
    }
    return questions
  }

  getApplyChord(question){
    return arr_chord["question_"+question];
  }

  getChoiceAnswer(question){
    let choices = document.getElementsByClassName("sub-choice");
    let answers = {};
    
    for (let j = 0; j < choices.length; j++){
      let media = document.getElementsByClassName("media-answer-value-"+question+"-"+j);
      for (let k = 0; k < media.length; k++){
        if (media[k].value != null && media[k].value != ""){
          answers["answer_"+j] = media[k].value;
        }
      }
    }
    return answers;
  }

  getCorrectAnswer(question){
    return document.getElementById("select-answer-"+question).value;
  }

  submitFormQuestions(event){
    event.preventDefault();
    let homework_name = document.getElementById("homework_name");
    let estimate_date = document.getElementById("estimate-date-text");
    let full_score = document.getElementById("full-score-text");

    let is_valid = [];

    if (homework_name.value == ""){
      is_valid.push(false);
      this.invalid_value(homework_name);
      this.alert("error", "Homework name should not be blank");
    }else {
      this.valid_value(homework_name);
    }

    try{
      if (estimate_date.value == ""){
        is_valid.push(false);
        this.invalid_value(estimate_date);
        this.alert("error", "Estimated date should not be blank");
      } else {
        let estimate_d = new Date(estimate_date.value);
        this.valid_value(estimate_date);
      }
    }catch(error){
      is_valid.push(false);
      this.invalid_value(estimate_date);
      this.alert("error", "Estimated date is invalid format");
    }

    if (/[0-9]/.test(full_score.value)){
      this.valid_value(full_score);
    }else {   
      is_valid.push(false);
      this.invalid_value(full_score);
      this.alert("error", "Full scroe is require to input with number only");
    }

    let question_score = document.getElementsByClassName("question-score-value");
    for (let j=0; j < question_score.length; j++){
      let question_no = question_score[j].id.replace("question-score-text-", "");
      if (question_score[j].value == ""){
        is_valid.push(false);
        this.invalid_value(question_score[j]);
        this.alert("error", "Score of question "+question_no+" should not be blank");
      }else {
        this.valid_value(question_score[j]);
      }
    }

    let answers = document.getElementsByClassName("select-answer");
    for(let i=0; i < answers.length; i++){
      let question_no = answers[i].id.replace("select-answer-", "");
      let format = document.getElementById("selected-format-"+question_no);
      if (format.value == "3"){
        this.valid_value(answers[i]);
        continue;
      }
      if (answers[i].value == ""){
        is_valid.push(false);
        this.invalid_value(answers[i]);
        this.alert("error", "Answer of question "+question_no+" is not select");
      }else{
        this.valid_value(answers[i]);
      }
    }

    if (is_valid.length < 1){
      const create_restaurant = fetch(event.target.action, {
        method: 'POST',
        body: new FormData(event.target),
      }).then(response => {
        if (response.ok) {
          return response.text();
        }
      });

      create_restaurant.then((data) => {
        try{
          let result = JSON.parse(data);
          let application_path = document.getElementById("application-path");
          if (result["status"] == "success"){
            window.location.replace(application_path.value+"/homework/subject/list");
          }else{
            this.alert(result["status"], result["message"]);
          }
        } catch(error) {
          console.log(error);
        }
      });
    }
  }

  invalid_value(elem){
    elem.style.border = "1px solid #d31414";
    elem.style.background = "#f7caca";
    elem.value = "";
  }

  valid_value(elem){
    elem.style.border = "1px solid #dee2e6";
    elem.style.background = "#fff";
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

  showToolsTip(){
    document.getElementById("dashboard-menu").classList.add("active");
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
  }

  getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').content;
  }
}
