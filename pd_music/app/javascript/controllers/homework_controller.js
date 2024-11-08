import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'
import "select2"
import WaveSurfer from "wavesurfer"

const arr_chord = {};

export default class extends Controller {
  connect() {
    document.getElementById("homework-menu").classList.add("active");
    $('.select-answer').select2({
      width: "100%"
    });

    $('#form_create_homework').on('keypress', e => {
      if (e.which == 13) {
          return false;
      }
    });
  }

  createSubject(event){
    event.preventDefault();
    let subject_name = document.getElementById("subject");

    if (subject_name.value !== ""){
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
            result = JSON.parse(data);
            this.alert(result["status"], result["message"]);
          } catch {
            $(".div-card-subject").html("");
            $(".div-card-subject").html(data);
            $("#close-icon-create-subject-dialog").click();
            // Clear value in dialog
            this.alert("success", "Add subject "+subject_name.value+" successfully");
          }
      });
    } else {
      subject_name.style.border = "1px solid #d31414";
      subject_name.style.background = "#f7caca";
      subject_name.value = "";
    }
  }

  showHomework(event){
    let subject = event.params["subject"];
    let url = event.params["url"]+"?subject="+subject;
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

  addHomeworktypeSuccess(event){
    event.preventDefault();

    let type = document.getElementById("homework_type");
    if (type.value == ""){

    } else{
      const create_homrwork_type = fetch(event.target.action, {
        method: 'POST',
        body: new FormData(event.target),
      }).then(response => {
          if (response.ok) {
              return response.text();
          }
      });
  
      create_homrwork_type.then((data) => {
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
    let question_no = event.params["questionNo"];
    let form = document.getElementById("form_create_homework");
    let formData = new FormData(form);
    formData.append("question_no", question_no);
    const questions = fetch(event.params["url"], {
      method: 'POST',
      headers: {
        // "Content-Type": "application/json",
        "X-CSRF-Token": this.getCsrfToken()
      },
      body: formData,
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
      if (format == "1"){
        arr_chord["question_"+question_no] = [];
      } else if (format == "2"){
        this.addAnswerOption(1, question_no);
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
    let button = '<div class="d-inline" id="div-chord-'+chord+'-'+length+'"><input type="checkbox" class="btn-check" id="btn-check-chord-'+chord+'-'+length+'" value="'+chord.toLowerCase()+'" autocomplete="off" data-action="change->homework#isChordActiveButton" data-homework-chord-param='+chord+' data-homework-length-param='+length+' >'
    button += '<label class="btn btn-outline-primary mx-1 mb-3" for="btn-check-chord-'+chord+'-'+length+'">'+chord+'</label>'
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
    document.getElementById("div-chord-"+chord+'-'+length).remove();
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
    };

    if (file) {
        reader.readAsDataURL(file);
    // this.saveAvatar(file, wrapper);
    }
  }

  setImageAttribute(elem, src, width, height){
    let image = document.getElementById(elem);
    image.src = src;
    image.style.width = width+"px";
    image.style.height = height+"px";
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
      this.clearPicture("question_picture_"+length, "picture-question-"+length);
      this.clearAudio("question_audio_"+length, "div-audio-"+length);
      let video = this.setVideoAttribute("video-player-"+length, reader.result, "500", "250");
      div_media.appendChild(video);
      document.getElementById("question_video_"+length).disabled = false;
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
      this.clearPicture("question_picture_"+length, "picture-question-"+length);
      this.clearVideo("question_video_"+length, "video-player-"+length);
      const audio = this.setAudioAttribute("audio-player-"+length, reader.result, "75%");
      const div_audio = this.setDivAudioAttribute("div-audio-"+length);
      this.setForwordBackwardButton(div_audio, "audio-player-"+length);
      div_audio.appendChild(audio);
      div_media.appendChild(div_audio);

      document.getElementById("question_audio_"+length).disabled = false;
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

  clearPicture(elem_file_id, elem_picture_id){
    let image = document.getElementById(elem_picture_id);
    image.removeAttribute("src");
    image.removeAttribute("style");
    document.getElementById(elem_file_id).value = "";
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
      this.clearPicture("answer-picture-"+question_no+"-"+answer_no, "answer-image-"+question_no+"-"+answer_no);
      this.clearAudio("answer-audio-"+question_no+"-"+answer_no, "div-audio-answer-"+question_no+"-"+answer_no);
      this.clearAnswerText(question_no, answer_no);

      // Create video
      let video = this.setVideoAttribute("video-player-answer-"+question_no+"-"+answer_no, reader.result, "500", "250");
      video.classList.add("ms-3");

      div_media.appendChild(video);
      document.getElementById("answer-video-"+question_no+"-"+answer_no).disabled = false;
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
      this.clearPicture("answer-picture-"+question_no+"-"+answer_no, "answer-image-"+question_no+"-"+answer_no);
      this.clearVideo("answer-video-"+question_no+"-"+answer_no, "video-player-answer-"+question_no+"-"+answer_no);
      this.clearAnswerText(question_no, answer_no);

      // Create Audio
      const audio = this.setAudioAttribute("audio-player-answer-"+question_no+"-"+answer_no, reader.result);
      const div_audio = this.setDivAudioAttribute("div-audio-answer-"+question_no+"-"+answer_no);
      
      this.setForwordBackwardButton(div_audio, "audio-player-answer-"+question_no+"-"+answer_no);
      div_audio.appendChild(audio);

      div_media.appendChild(div_audio);
      document.getElementById("answer-audio-"+question_no+"-"+answer_no).disabled = false;
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
      this.clearPicture("answer-picture-"+question_no+"-"+answer_no, "answer-image-"+question_no+"-"+answer_no);
      this.clearVideo("answer-video-"+question_no+"-"+answer_no, "video-player-answer-"+question_no+"-"+answer_no);
      let div_ans_media = document.getElementById("div-display-media-answer-"+question_no+"-"+answer_no);
      div_ans_media.insertBefore(textfield, document.getElementById("answer-image-"+question_no+"-"+answer_no)); 
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

      document.getElementById("reveal-picture-"+question_no).disabled = false;
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
      this.clearPicture("reveal-picture-"+question_no, "picture-reveal-"+question_no);
      this.clearAudio("reveal-audio-"+question_no, "div-audio-reveal-"+question_no);

      // Create video
      let video = this.setVideoAttribute("video-player-reveal-"+question_no, reader.result, "500", "250");
      div_media.appendChild(video);

      document.getElementById("reveal-video-"+question_no).disabled = false;
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
      this.clearPicture("reveal-picture-"+question_no, "picture-reveal-"+question_no);
      this.clearVideo("reveal-video-"+question_no, "video-player-reveal-"+question_no);

      // Create Audio
      const audio = this.setAudioAttribute("audio-player-reveal-"+question_no, reader.result, "75%");
      const div_audio = this.setDivAudioAttribute("div-audio-reveal-"+question_no);
    
      this.setForwordBackwardButton(div_audio, "audio-player-reveal-"+question_no);
      div_audio.appendChild(audio);
      div_media.appendChild(div_audio);

      document.getElementById("reveal-audio-"+question_no).disabled = false;
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
