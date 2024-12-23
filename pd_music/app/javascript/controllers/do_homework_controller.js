import { Controller } from "@hotwired/stimulus"
import $ from 'jquery'
import "select2"
import DataTable from 'datatables.net-bs5'

export default class extends Controller {
    connect(){
        document.getElementById("do-homework-menu").classList.add("active");
        let homework_side = document.getElementById("homeworkMenu");
        if (!homework_side.classList.contains("show")){
            homework_side.classList.add("show");
        }
        this.datatable();
    }

    datatable(){
        let table = $("#table-do-homework-list").DataTable({
            pagingType: "full_numbers",    
            pageLength: 15,
            destroy: true,
            processing: true,
            serverSide: true,
            dom: '<tp>',
            ajax: { url: $("#table-do-homework-list").data('url') },
            columnDefs: [{'targets': [3,4], 'className': "text-center"}],
            columns: [
                { data: 'subject' },
                { data: 'taskName' },
                { data: 'status' },
                { data: 'fullScore' },
                { data: 'estimatedDate' }
            ],
            rowCallback: function (row, data) {
                let status = $(row).find(".homework-status-text").text();
                if (status == "Open" || status == "Reject"){
                    let homework_mapping_id = $(row).find(".homework_mapping_id").val();
                    let has_permission = document.getElementById("permission-do-homework");
                    if (has_permission.value == "true"){
                        row.setAttribute("data-action", "click->do-homework#do_homework");
                        row.setAttribute("data-do-homework-id-param", homework_mapping_id);
                    }
                }

                let over_deadline = $(row).find("#over_deadline");
                if (over_deadline.length > 0){
                    $('td', row).css("background-color", "#f7caca");
                }
            }
        
        });
    }

    do_homework(event){
        let id = event.params["id"];
        let application_path = document.getElementById("application-path");

        window.location.replace(application_path.value+"/homework/do/homework?id="+id);
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
          this.clearRecordAudio();
          
          // Change picture
          let image = this.setImageAttribute("picture-reveal-"+question_no, reader.result, "500", "250");
          document.getElementById("upload-reveal-icon1-"+question_no).style.display = "none";
          document.getElementById("reveal-picture-"+question_no).disabled = false;
        };
    
        if (file) {
          reader.readAsDataURL(file);
        // this.saveAvatar(file, wrapper);
        }
    }
    
    setImageAttribute(elem, src, width, height){
        let image = document.getElementById(elem);
        image.src = src;
        image.removeAttribute("style");
        image.style.width = width+"px";
        image.style.height = height+"px";
        image.style.display = "inline";
    }
    
    uploadRevealVideo(event) {
        let question_no = event.params["questionNo"];
    
        const file = event.target.files[0];
        const reader = new FileReader();
    
        let div_media = document.getElementById("media-reveal1-"+question_no);
    
        if (typeof file == "undefined"){
            document.getElementById("reveal-video-"+question_no).disabled = true;
        }
    
        reader.onloadend = () => {
          this.clearPicture("reveal-picture-"+question_no, "picture-reveal-"+question_no);
          this.clearAudio("reveal-audio-"+question_no, "div-audio-reveal-"+question_no);
          this.clearRecordAudio();
    
          // Create video
          let video = this.setVideoAttribute("video-player-reveal-"+question_no, reader.result, "500", "250");
          div_media.appendChild(video);
    
          document.getElementById("upload-reveal-icon1-"+question_no).style.display = "none";
          document.getElementById("reveal-video-"+question_no).disabled = false;
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
    
    uploadRevealAudio(event) {
        let question_no = event.params["questionNo"];
    
        const file = event.target.files[0];
        const reader = new FileReader();
    
        let div_media = document.getElementById("media-reveal1-"+question_no);
    
        if (typeof file == "undefined"){
            document.getElementById("reveal-audio-"+question_no).disabled = true;
        }
    
        reader.onloadend = () => {
          this.clearPicture("reveal-picture-"+question_no, "picture-reveal-"+question_no);
          this.clearVideo("reveal-video-"+question_no, "video-player-reveal-"+question_no);
          this.clearRecordAudio();
    
          // Create Audio
          const audio = this.setAudioAttribute("audio-player-reveal-"+question_no, reader.result, "75%");
          const div_audio = this.setDivAudioAttribute("div-audio-reveal-"+question_no);
        
          this.setForwordBackwardButton(div_audio, "audio-player-reveal-"+question_no);
          div_audio.appendChild(audio);
          div_media.appendChild(div_audio);
    
          document.getElementById("upload-reveal-icon1-"+question_no).style.display = "none";
          document.getElementById("reveal-audio-"+question_no).disabled = false;
        };
    
        if (file) {
            reader.readAsDataURL(file);
        // this.saveAvatar(file, wrapper);
        }
    }

    uploadAnswerPicture2(event) {
        let question_no = event.params["questionNo"];
        
        const file = event.target.files[0];
        const reader = new FileReader();
    
        if (typeof file == "undefined"){
            document.getElementById("answer-picture2-"+question_no).disabled = true;
        }
    
        reader.onloadend = () => {
          this.clearVideo("answer-video2-"+question_no, "video-player2-"+question_no);
          this.clearAudio("answer-audio2-"+question_no, "div-audio-answer2-"+question_no);
          this.clearRecordAudio();
          
          // Change picture
          let image = this.setImageAttribute("picture-answer2-"+question_no, reader.result, "500", "250");
          document.getElementById("upload-answer2-"+question_no).style.display = "none";
          document.getElementById("answer-picture2-"+question_no).disabled = false;
        };
    
        if (file) {
          reader.readAsDataURL(file);
        // this.saveAvatar(file, wrapper);
        }
    }

    uploadAnswerVideo2(event) {
        let question_no = event.params["questionNo"];
    
        const file = event.target.files[0];
        const reader = new FileReader();
    
        let div_media = document.getElementById("media-reveal2-"+question_no);
    
        if (typeof file == "undefined"){
            document.getElementById("answer-video2-"+question_no).disabled = true;
        }
    
        reader.onloadend = () => {
          this.clearPicture("answer-picture2-"+question_no, "picture-answer2-"+question_no);
          this.clearAudio("answer-audio2-"+question_no, "div-audio-answer2-"+question_no);
          this.clearRecordAudio();
    
          // Create video
          let video = this.setVideoAttribute("video-player2-"+question_no, reader.result, "500", "250");
          div_media.appendChild(video);
    
          document.getElementById("upload-answer2-"+question_no).style.display = "none";
          document.getElementById("answer-video2-"+question_no).disabled = false;
        };
    
        if (file) {
            reader.readAsDataURL(file);
        // this.saveAvatar(file, wrapper);
        }
    }

    uploadAnswerAudio2(event) {
        let question_no = event.params["questionNo"];
    
        const file = event.target.files[0];
        const reader = new FileReader();
    
        let div_media = document.getElementById("media-reveal2-"+question_no);
    
        if (typeof file == "undefined"){
            document.getElementById("answer-audio2-"+question_no).disabled = true;
        }
    
        reader.onloadend = () => {
          this.clearPicture("answer-picture2-"+question_no, "picture-answer2-"+question_no);
          this.clearVideo("answer-video2-"+question_no, "video-player2-"+question_no);
          this.clearRecordAudio();
    
          // Create Audio
          const audio = this.setAudioAttribute("audio-player2-"+question_no, reader.result, "75%");
          const div_audio = this.setDivAudioAttribute("div-audio-answer2-"+question_no);
        
          this.setForwordBackwardButton(div_audio, "audio-player2-"+question_no);
          div_audio.appendChild(audio);
          div_media.appendChild(div_audio);
    
          document.getElementById("upload-answer2-"+question_no).style.display = "none";
          document.getElementById("answer-audio2-"+question_no).disabled = false;
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
        image.style.display = "none";
        document.getElementById(elem_file_id).value = "";
    }
    
    clearVideo(elem_file_id, elem_video_id){
        console.log(elem_file_id);
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

    selectRecordAudio(event){
        let question_no = event.params["questionNo"];
        let times = event.params["times"];
        let icon = this.createMicIcon(times);

        document.getElementById("upload-reveal-icon"+times+"-"+question_no).style.display = "none";
        document.getElementById("media-reveal"+times+"-"+question_no).insertAdjacentHTML("beforeend", icon);
    }

    createMicIcon(time){
        let icon = '<div class="div-microphone rounded-circle border p-3">'+
                '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-mic" id="mic-'+time+'" viewBox="0 0 16 16" onclick="startRecording('+time+')">'+
                '<path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/>'+
                '<path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3"/>'+
                '</svg>'+
                '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-stop-fill" id="mic_off-'+time+'" viewBox="0 0 16 16" style="display:none" onclick="stopRecording('+time+')">'+
                '<path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/>'
                '</svg></div>';
        return icon
    }

    clearRecordAudio(){
        let audio = document.getElementsByClassName("div-microphone");
        if (audio.length > 0){
            audio[0].remove();
        }
    }

    revealAnswer(event){
        let answer_format = event.params["format"];
        let url = event.params["url"];

        const get_answer = fetch(url).then(response => {
            if (response.ok) {
              return response.text();
            }
        });
        
        get_answer.then((data) => {
            try{
                let result = JSON.parse(data);
                let answer = result["correct_answer"];
                let media = result["answer_media"];

                if (parseInt(answer_format) == 1){
                    let answers = answer.split(",");
                    let all_chords = document.getElementsByClassName("btn-check");
                    let count = 0;
                    for (let i=0; i < all_chords.length; i++){
                        if (answers.includes(all_chords[i].value.toLowerCase()) && all_chords[i].checked){
                            count += 1;
                            continue;
                        }
                        if (answers.includes(all_chords[i].value.toLowerCase())){
                            all_chords[i].checked = true;
                            break;
                        }
                    }
                    if (answers.length != count){
                        let reveal = document.getElementById("reveal-time");
                        let count_reveal = parseInt(reveal.innerHTML) + 1;
                        reveal.innerHTML = count_reveal;
                    }
                }else if (parseInt(answer_format) == 2){
                    document.getElementById("choice-"+answer).checked = true;
                    document.getElementById("div-display-media-answer-"+answer).classList.add("correct");
                    let have_reveal_answer = document.getElementById("have-revral-answer");
                    if (have_reveal_answer.value == "0"){
                        let reveal = document.getElementById("reveal-time");
                        let count_reveal = parseInt(reveal.innerHTML) + 1;
                        reveal.innerHTML = count_reveal;
                        have_reveal_answer.value = "1";
                    }
                } else {
                    let reveal_div = '<div class="div-media-reveal"><img src="'+media+'" width="500" height="250" /></div>';

                    document.getElementById("div-reveal-media").insertAdjacentHTML("beforeend", reveal_div);
                    document.getElementById("div-reveal").style.display = "block"

                    document.getElementById("div-second-answer").style.display = "block"
                }
                // console.log(answer);
            } catch(e) {
                console.log(e)
            }
        });
    }

    answer(event){
        let answer_format = event.params["format"];
        let question_no = event.params["questionNo"];
        let url = event.params["url"];
        let form = document.getElementById("form_answer");
        let choice_checked = form.querySelector("input[type=radio]:checked");
        let media = document.getElementsByClassName("answer-media");
        let total_questions = document.getElementById("total-question");

        let has_media = false;
        for(let i=0; i < media.length; i++){
            if (media[i].value != ""){ has_media = true; }
        }
        if (parseInt(answer_format) == 3){
            let upload_state = document.getElementById("upload-file-state");
            let current_progress = document.getElementById("progress-percent");
            let progress = parseInt(question_no)/parseInt(total_questions.value);
            if (upload_state.value == "answer") {
                document.getElementById("btn-reveal-answer").disabled = false;
                document.getElementById("dropdown-answer").style.display = "none";
                upload_state.value = "reveal"
            } else {
                document.getElementById("btn-next-question").click();
            }
            current_progress.innerHTML = progress*100;
        } else if (parseInt(answer_format) == 1  || (choice_checked != null && parseInt(answer_format) == 2) ){
            const get_answer = fetch(url).then(response => {
                if (response.ok) {
                    return response.text();
                }
            });
            
            get_answer.then((data) => {
                try{
                    let result = JSON.parse(data);
                    let answer = result["correct_answer"];
                    let current_progress = document.getElementById("progress-percent");
                    let current_score = document.getElementById("score");
                    let div_score = document.getElementById("your-score");
                    let score = parseInt(div_score.getAttribute("data-score"));
                    let progress = parseInt(question_no)/parseInt(total_questions.value);
                    
                    if (parseInt(answer_format) == 1){
                        let answers = answer.split(",");
                        let all_chords = document.getElementsByClassName("btn-check");
                        let selected_chords = [];
                        for(let i=0; i < all_chords.length; i++){
                            if (all_chords[i].checked){
                                selected_chords.push(all_chords[i].value.toLowerCase());
                            }
                        }
                        document.getElementById("your-answer").value = selected_chords.join(",");
                        let intersection = answers.filter(x => selected_chords.includes(x));
                        if (intersection.length == answers.length){
                            this.addCorrectIcon();
                            current_score.innerHTML = parseInt(current_score.innerHTML) + score;
                            div_score.value = score;
                        } else {
                            this.addIncorrectIcon();
                            document.getElementById("answer-result").insertAdjacentHTML("beforeend", "<span>"+answers.join(",")+"</span>");
                            div_score.value = 0;
                        }
                        
                    }else if (parseInt(answer_format) == 2){
                        if (document.getElementById("choice-"+answer).checked){
                            this.addCorrectIcon();
                            current_score.innerHTML = parseInt(current_score.innerHTML) + score;
                            div_score.value = score;
                        } else {
                            let correct_data = document.getElementById("div-display-media-answer-"+answer).cloneNode(true);
                            correct_data.querySelector("input[id=choice-"+answer+"]").remove();
                            this.addIncorrectIcon();
                            document.getElementById("answer-result").appendChild(correct_data);
                            div_score.value = 0;
                        }
                        document.getElementById("your-answer").value = choice_checked.value;
                    }
                    current_progress.innerHTML = (progress*100).toFixed(2);
                    document.getElementById("open-answer-result-dialog").click();
                    // console.log(answer);
                } catch(e) {
                    console.log(e)
                }
            });
        } else {
            this.alert("Error", "Please select or upload answer");
        }
    }

    nextQuestion(){
        document.getElementById("send-answer").click();
    }

    onSubmitAnswer(event){
        event.preventDefault();
        let form = document.getElementById("form_answer");
        let formData = new FormData(form);
        // let record_audio = document.getElementById("reveal-record-audio1");
        let current_score = document.getElementById("score");
        let current_progress = document.getElementById("progress-percent");
        let reveal_time = document.getElementById("reveal-time");
        // let answer = document.getElementById("your-answer");
        // formData.append("answer_media", record_audio.value);
        formData.append("score", current_score.innerHTML);
        formData.append("progress", current_progress.innerHTML);
        formData.append("reveal_time", reveal_time.innerHTML);

        const send_answer = fetch(event.target.action, {
            method: 'POST',
            body: formData,
        }).then(response => {
            if (response.ok) {
                return response.text();
            }
        });

        send_answer.then((data) => {
            try{
                let result = JSON.parse(data);
                if (result["state"] == "success"){
                    let application_path = document.getElementById("application-path");
                    window.location.replace(application_path.value+"/homework");
                } else {
                    this.alert(result["state"], result["message"]);
                }
            }catch(error){
                $(".div-show-question").html("");
                $(".div-show-question").html(data);
            }
        });
    }

    addCorrectIcon(){
        let icon = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" class="bi bi-check-circle mb-3 answer-result-correct" viewBox="0 0 16 16">'+
                '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>'+
                '<path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>'+
                '</svg>';
        document.getElementById("answer-result-icon").insertAdjacentHTML("afterbegin", icon);
        document.getElementById("answer-result").innerHTML = "Correct !";
        document.getElementById("answer-result").style.textAlign = "center";
        document.getElementById("answer-result").style.color = "#24c80e";
    }

    addIncorrectIcon(){
        let icon = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" class="bi bi-x-circle mb-3 answer-result-incorrect" viewBox="0 0 16 16">'+
                '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>'+
                '<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>'+
                '</svg>';
        document.getElementById("answer-result-icon").insertAdjacentHTML("afterbegin", icon);
        document.getElementById("answer-result").insertAdjacentHTML("afterbegin", "<span><b>Correct answer is :</b></span>");
        document.getElementById("answer-result").style.marginLeft = "1rem";
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
}