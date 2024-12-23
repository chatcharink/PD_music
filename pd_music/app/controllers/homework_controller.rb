class HomeworkController < ApplicationController
    include HomeworkHelper

    def index
        unless can_view_menu?([33])
            flash["error"] = "You don't have permission to view homework"
            return redirect_to path_to_root
        end
        if session["current_user"]["role"] == 3
            @homework = HomeworkUserMapping.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
            @homework = @homework.where(user_id: session["current_user"]["id"])
            @homework = @homework.where("homeworks.status = ?", "active")
            @homework = @homework.where("homeworks.estimate_date < ?", DateTime.now().strftime("%Y-%m-%d %H:%M:%S")).limit(1)
        else
            @subject = Subject.where(status: "active", subject_type: "homework")
            @homework_list = Homework.where(status: "active")
        end
    end

    def detail_datatable
        respond_to do |format|
            format.html
            format.json { render json: DetailHomeworkDatatable.new(params, view_context: view_context) }
        end
    end

    def datatable
        respond_to do |format|
            format.html
            format.json { render json: HomeworkDatatable.new(params, view_context: view_context) }
        end
    end

    def update_status
        begin
            id = params["id"].split(",")
            homework = HomeworkUserMapping.where(id: id)
            homework.update_all(status: params["status"])
            save_activity("Homework", "Success", "Update homework status to #{params["status"]}")
            # state = "success"
            # message = "Update homework status successfully"
            render(
                partial: "homework/table_detail_homework_list",
                formats: [:html, :js, :json, :url_encoded_form]
            )

        rescue => e
            save_activity("Homework", "Fail", "Fail to update homework status")
            respond_to do |format|
                format.json { render json: {state: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
        
    end

    def get_detail_score
        user = User.select("users.id, users.firstname, users.lastname, users.profile_pic, homeworks.id as homework_id, homeworks.task_name, homeworks.estimate_date, homeworks.full_score, homework_user_mappings.id as homework_mapping_id, homework_user_mappings.score, homework_user_mappings.status, homework_user_mappings.send_date, subjects.subject_name")
        user = user.joins("right join homework_user_mappings on homework_user_mappings.user_id = users.id")
        user = user.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
        user = user.joins("left join subjects on subjects.id = homeworks.subject_id")
        # homework = homework.order("homeworks.subject_id, homeworks.id")

        homework = Homework.where(status: "active")
        data = Hash.new
        score = Hash.new
        user.each do |u|
            data["#{u.firstname.capitalize} #{u.lastname.capitalize}"] ||= {}
            begin
                if (u.send_date <= u.estimate_date)
                    status = "sent"
                    status = "need_review" if u.status == "send"
                else
                    status = "open"
                    status = "need_review" if u.status == "send"
                    status = "late" if u.status == "checked"
                end
            rescue => e
                status = "open"
            end
            data["#{u.firstname.capitalize} #{u.lastname.capitalize}"][u.task_name] = [u.score.to_i, status, u.id, u.homework_id, u.homework_mapping_id]
            data["#{u.firstname.capitalize} #{u.lastname.capitalize}"]["profile_pic"] = u.profile_pic
            score[u.task_name] ||= {}
            score[u.task_name]["score"] ||= 0
            score[u.task_name]["score"] += u.score.to_i
            score[u.task_name]["number"] ||= 0
            score[u.task_name]["number"] += 1
        end

        render(
            partial: "homework/score_detail",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {data: data, score: score, homework: homework}
        )
    end

    def do_homework
        @h_homework = Hash.new
        homework = Question.select("questions.*, homeworks.task_name, homeworks.status, homeworks.estimate_date, homeworks.category_id, homeworks.full_score, homeworks.subject_id, homeworks.is_default, homeworks.priority ,homeworks.homework_type_id")
        homework = homework.where(homework_id: params["id"])
        homework = homework.joins("left join homeworks on homeworks.id = questions.homework_id")
        homework = homework.order(question_no: :ASC)

        answer = Answer.where(homework_id: params["id"], user_id: session["current_user"]["id"]).order(question_no: :ASC)
        answer_id = nil
        answers = []
        if answer.blank?
            @h_homework["current_score"] = 0
            @h_homework["current_progress"] = 0
            @h_homework["current_reveal"] = 0
            @h_homework["current_question"] = 1
        else
            # answer = answer.maximum(:question_no)
            has_reject = false
            answer.each_with_index do |ans, index|
                @h_homework["current_score"] ||= 0 #ans.current_score
                @h_homework["current_score"] += ans.current_score
                @h_homework["current_reveal"] = ans.current_reveal_time
                @h_homework["current_progress"] = ans.current_progress
                if ans.current_progress.blank? && !has_reject
                    has_reject = true
                    @h_homework["current_question"] = ans.question_no
                    answer_id = ans.id
                    answers = ans.answer.blank? ? [] : ans.answer.split(",")
                elsif ans.current_progress.present?
                    @h_homework["current_question"] = ans.question_no+1
                end
            end
        end
        
        hash_question = Hash.new
        homework.each do |hw|
            @h_homework["homework_id"] = params["id"]
            @h_homework["task_name"] = hw.task_name
            @h_homework["full_score"] = hw.full_score
            @h_homework["question_length"] ||= []
            @h_homework["question_length"] << hw.question_no
            @h_homework["questions"] ||= []
            hash_question["no_#{hw.question_no}"] ||= {}
            hash_question["no_#{hw.question_no}"]["id"] = hw.id
            hash_question["no_#{hw.question_no}"]["question_no"] = hw.question_no
            hash_question["no_#{hw.question_no}"]["score"] = hw.score
            hash_question["no_#{hw.question_no}"]["question"] = hw.question
            hash_question["no_#{hw.question_no}"]["question_media"] = hw.question_media
            hash_question["no_#{hw.question_no}"]["answer_id"] = answer_id
            hash_question["no_#{hw.question_no}"]["answer"] = answers
            hash_question["no_#{hw.question_no}"]["image_thumbnail"] = hw.image_thumbnail
            # p url_for(hw.question_media)
            hash_question["no_#{hw.question_no}"]["answer_format"] = hw.answer_format
            hash_question["no_#{hw.question_no}"]["chords"] = hw.chords
            hash_question["no_#{hw.question_no}"]["choice"] ||= []
            answer = hw.answer.attached? ? hw.answer : hw.answer_text
            hash_question["no_#{hw.question_no}"]["choice"] << [hw.choice_no, answer, hw.answer_image_thumbnail]
            hash_question["no_#{hw.question_no}"]["option"] = hw.option
            hash_question["no_#{hw.question_no}"]["reveal"] = hw.reveal
            @h_homework["questions"] << hash_question
        end
        @h_homework["question_length"].uniq!
    end

    def set_audio
        if params["answer_id"].blank?
            answer = Answer.insert_audio(params)
        else
            answer = Answer.update_audio(params)
        end
        # $record_audio = Hash.new
        # $record_audio["audio_#{params["times"]}"] = params["record_audio"]
        # file = params["record_audio"]
        respond_to do |format|
            format.json { render json: {times: params["times"], answer_id: answer.id} }
        end
    end

    def get_reveal_answer
        question = Question.find(params["id"])
        reveal_answer = question.reveal.attached? ? url_for(question.reveal) : ""

        respond_to do |format|
            format.json { render json: {correct_answer: question.correct_answer, answer_media: reveal_answer, reveal_image_size: question.answer_image_thumbnail} }
        end
    end

    def get_next_question
        @h_homework = Hash.new
        begin

            if params["form_answer"]["answer_id"].blank?
                answer = Answer.insert_answer(session, params)
            else
                answer = Answer.update_answer(session, params)
            end

            if (params["question_no"].to_i)-1 == params["questions"].length
                homework_mapping = HomeworkUserMapping.where(homework_id: params["id"], user_id: session["current_user"]["id"])
                check_questions = Question.where(homework_id: params["id"]).pluck(:answer_format)
                status = check_questions.include?(3) ? "send" : "checked"
                homework_mapping.update(score: params["score"], status: status, send_date: DateTime.now())
                save_activity("Do Homework", "Success", "Do homework successfully")
                flash["success"] = "Do homework successfully, your score: #{params["score"]}"

                recheck_message = check_questions.include?(3) ? " Please review and give the score." : ""
                ### Send notification
                if can_view_menu?([15])
                    homework_info = Homework.select("subjects.subject_name, subjects.created_by, homeworks.task_name").find(params["id"]).joins("left join subjects on subjects.id = homeworks.subject_id")
                    Notification.create(subject: "Do homework successfully", 
                        message: "#{session["current_user"]["firstname"]} #{session["current_user"]["lastname"]} do homework: #{homework_info.task_name} of #{homework_info.subject_name} successfully.#{recheck_message}",
                        status: 0,
                        send_by: session["current_user"]["id"],
                        user_id: homework_info.created_by,
                        notification_type: "change_status"
                    )
                end

                ### Send email
                if can_view_menu?([63])
                    user = User.find(homework_info.created_by)
                    subject = "Do homework successfully"
                    message = "#{session["current_user"]["firstname"]} #{session["current_user"]["lastname"]} do homework: #{homework_info.task_name} of #{homework_info.subject_name} successfully.#{recheck_message}"
                    HomeworkMailer.change_status(user, subject, message).deliver_now
                end
                
                respond_to do |format|
                    format.json { render json: {state: "success", message: "Do homework successfully, your score: #{params["score"]}"} }
                end
            else
                homework = Question.select("questions.*, homeworks.task_name, homeworks.status, homeworks.estimate_date, homeworks.category_id, homeworks.full_score, homeworks.subject_id, homeworks.is_default, homeworks.priority ,homeworks.homework_type_id")
                homework = homework.where(homework_id: params["id"])
                homework = homework.where(question_no: params["question_no"])
                homework = homework.joins("left join homeworks on homeworks.id = questions.homework_id")
                homework = homework.order(question_no: :ASC)
                @h_homework["question_length"] = params["questions"]

                next_answer = Answer.where(homework_id: params["id"], question_no: params["question_no"], user_id: session["current_user"]["id"]).first
                hash_question = Hash.new
                homework.each do |hw|
                    @h_homework["homework_id"] = params["id"]
                    @h_homework["questions"] ||= []
                    hash_question["no_#{hw.question_no}"] ||= {}
                    hash_question["no_#{hw.question_no}"]["id"] = hw.id
                    hash_question["no_#{hw.question_no}"]["question_no"] = hw.question_no
                    hash_question["no_#{hw.question_no}"]["score"] = hw.score
                    hash_question["no_#{hw.question_no}"]["question"] = hw.question
                    hash_question["no_#{hw.question_no}"]["question_media"] = hw.question_media
                    hash_question["no_#{hw.question_no}"]["image_thumbnail"] = hw.image_thumbnail
                    hash_question["no_#{hw.question_no}"]["answer_format"] = hw.answer_format
                    if !next_answer.blank?
                        hash_question["no_#{hw.question_no}"]["answer_id"] = next_answer.id
                        hash_question["no_#{hw.question_no}"]["answer"] = next_answer.answer.blank? ? [] : next_answer.answer.split(",")
                    end
                    hash_question["no_#{hw.question_no}"]["chords"] = hw.chords
                    hash_question["no_#{hw.question_no}"]["choice"] ||= []
                    answer = hw.answer.attached? ? hw.answer : hw.answer_text
                    hash_question["no_#{hw.question_no}"]["choice"] << [hw.choice_no, answer, hw.answer_image_thumbnail]
                    hash_question["no_#{hw.question_no}"]["option"] = hw.option
                    hash_question["no_#{hw.question_no}"]["reveal"] = hw.reveal
                    @h_homework["questions"] << hash_question
                end

                render(
                    partial: "homework/show_question",
                    formats: [:html, :js, :json, :url_encoded_form],
                    locals: {question: @h_homework["questions"], index: 0, question_no: params["question_no"]}
                )
            end
        rescue => e
            p e.message
            p e.backtrace
            $record_audio = nil
            save_activity("Do Homework", "Fail", "Cannot send homework")
            respond_to do |format|
                format.json { render json: {state: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end

    def review_homework
        hash_result = get_answer(params, 0)
        # h_homework["question_length"].uniq! if h_homework["question_length"].present?

        render(
            partial: "homework/check_homework_dialog",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: { question: hash_result, question_no: hash_result["current_question"][0] }
        )
    end

    def reject_homework
        begin
            answer = Answer.find(params["answer_id"])
            ## Update progress all
            Answer.where(homework_id: answer.homework_id, user_id: answer.user_id).update_all(current_progress: nil)
            HomeworkUserMapping.where(homework_id: answer.homework_id, user_id: answer.user_id).update(status: "reject")

            ### Send notification
            if can_view_menu?([15])
                homework_info = Homework.select("subjects.subject_name, subjects.created_by, homeworks.task_name").find(answer.homework_id).joins("left join subjects on subjects.id = homeworks.subject_id")
                Notification.create(subject: "Do homework successfully", 
                    message: "Your homework: #{homework_info.task_name} was rejected. Please update youe answer again.",
                    status: 0,
                    send_by: session["current_user"]["id"],
                    user_id: answer.user_id,
                    notification_type: "change_status"
                )
            end

            ### Send email
            if can_view_menu?([63])
                user = User.find(answer.user_id)
                subject = "Your homework was rejected"
                message = "Your homework: #{homework_info.task_name} was rejected. Please update youe answer again."
                HomeworkMailer.change_status(user, subject, message).deliver_now
            end
            save_activity("Reject", "Success", "Reject homework successfully")
            flash["success"] = "Reject homework successfully"

        rescue => e
            p e.message
            p e.backtrace.first
            save_activity("Reject", "Fail", "Fail to reject homework because something went wrong")
            flash["success"] = "Something was wrong. Please contact admin"
        end
        respond_to do |format|
            format.json { render json: {redirect_url: homework_index_url()} }
        end
    end

    def give_score
        begin
            score = params["form_score"]["score"]
            answer = Answer.where(homework_id: params["id"], question_no: params["question_no"])
            answer.update(current_score: score)

            if params["questions"].length == 1
                homework = HomeworkUserMapping.find(params["homework_mapping"])
                sum_score = params["current_score"].to_i + score.to_i
                homework.update(score: sum_score)
                homework.update(status: "checked")

                ### Send notification
                if can_view_menu?([15])
                    homework_info = Homework.select("subjects.subject_name, subjects.created_by, homeworks.task_name").find(params["id"]).joins("left join subjects on subjects.id = homeworks.subject_id")
                    Notification.create(subject: "Review homework successfully", 
                        message: "Your homework: #{homework_info.task_name} was reviewed with score: #{score}.",
                        status: 0,
                        send_by: session["current_user"]["id"],
                        user_id: answer[0].user_id,
                        notification_type: "change_status"
                    )
                end

                ### Send email
                if can_view_menu?([63])
                    user = User.find(answer.user_id)
                    subject = "Review homework successfully"
                    message = "Your homework: #{homework_info.task_name} was reviewed with score: #{score}."
                    HomeworkMailer.change_status(user, subject, message).deliver_now
                end
                save_activity("Review", "Success", "Review homework and give score successfully")
                flash["success"] = "You've already checked homework and give score : #{sum_score}"
                respond_to do |format|
                    format.json { render json: {state: "success", message: "You've already checked homework and give score : #{sum_score}", redirect_path: homework_index_path} }
                end
            else
                hash_result = get_answer(params, params["question_no"])
                homework = HomeworkUserMapping.find(params["homework_mapping"])
                homework.update(score: hash_result["current_score"])
                render(
                    partial: "homework/form_check_homework",
                    formats: [:html, :js, :json, :url_encoded_form],
                    locals: { question: hash_result, question_no: hash_result["current_question"][0] }
                )
            end
        rescue => e
            p e.message
            p e.backtrace
            save_activity("Review", "Fail", "Fail to review homework because something went wrong")
            respond_to do |format|
                format.json { render json: {state: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end
    
    def subject_list
        unless can_view_menu?([23])
            flash["error"] = "You don't have permission to view subject"
            return redirect_to path_to_root
        end
        @subject = User.select("users.profile_pic, subjects.*")
        @subject = @subject.joins("right join subjects on subjects.created_by = users.id")
        @subject = @subject.where("subjects.status = ? and subjects.subject_type = ?", "active", "homework")

        @user = User.where(status: "active", role: 3)
    end

    def create
        if params["form_create_homework"]["subject_id"].blank?
            unless can_view_menu?([24])
                flash["error"] = "You don't have permission to create subject"
                return redirect_to path_to_root
            end
            subject = Subject.insert_subject(params["form_create_homework"], session)
            type = "Add"
            msg = "Add homework #{params["form_create_homework"]["subject"]} successfully"
        else
            unless can_view_menu?([25])
                flash["error"] = "You don't have permission to edit subject"
                return redirect_to path_to_root
            end
            subject = Subject.update_subject(params["form_create_homework"], session)
            type = "Update" 
            msg = "Update homework #{params["form_create_homework"]["subject"]} successfully"
        end
        if subject
            @subject = User.select("users.profile_pic, subjects.*")
            @subject = @subject.joins("right join subjects on subjects.created_by = users.id")
            @subject = @subject.where("subjects.status = ? and subjects.subject_type = ?", "active", "homework")
            save_activity(type, "Success", msg)
            # @user = User.where(status: "active", role: 3)
            render(
                partial: "homework/subject_list",
                formats: [:html, :js, :json, :url_encoded_form]
            )
        else
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end

    def show
        @category = Category.where(status: "active").index_by(&:id)
        tag = Tag.where(status: "active")
        render(
            partial: "homework/homework_list",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {tag: tag, subject_id: params["id"], subject_name: params["subject"], category_id: params["category"], banner: params["banner"]}
        )
    end

    def create_tag
        form_data = params["form_add_tag"]
        begin
            Tag.create(tag_name: form_data["tag_name"], description: form_data["description"], status: "active")
            save_activity("Add", "Success", "Create lesson: #{form_data["tag_name"]} successfully")
            tag = Tag.where(status: "active")
            render(
                partial: "homework/tag_list",
                formats: [:html, :js, :json, :url_encoded_form],
                locals: {tag: tag, id: params["id"], category_id: params["category"]}
            )
        rescue => e
            p e.message
            save_activity("Add", "Fail", "Fail to create lesson because something went wrong")
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end

    def get_improvement
        homework_id = Homework.where(tag_id: params["tag_id"]).pluck(:id)
        user = User.select("users.id, users.firstname, users.lastname, users.study_class, users.room")
        user = user.where("homework_user_mappings.homework_id in (?)", homework_id)
        user = user.joins("left join homework_user_mappings on homework_user_mappings.user_id = users.id")
        user = user.group(:id, :firstname, :lastname, :study_class, :room)

        user_mapping = DevelopmentUserMapping.where(tag_id: params["tag_id"])
        development = Hash.new
        user_mapping.each { |u| development[u.user_id] = u.development }

        render(
            partial: "homework/improvement_dialog",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {user: user, tag_id: params["tag_id"], development_data: development}
        )
    end

    def add_improvement
        form_improvement = params["form_improvement"]
        date = DateTime.now().strftime("%Y-%m-%d")
        begin
            db_development = DevelopmentUserMapping.where(tag_id: params["tag_id"]).index_by(&:id)
            arr_insert = []
            form_improvement.each do |k, v|
                h_data = Hash.new
                h_data["tag_id"] = params["tag_id"]
                h_data["user_id"] = k
                if v["update_id"].present?
                    json_development = JSON.parse(db_development[v["update_id"]]["development"]) if db_development[v["update_id"]].present?
                    if json_development[date].blank?
                        json_development ||= {}
                        json_development[date] ||= {}
                        json_development[date]["meditate"] = v["meditate"]
                        json_development[date]["development"] = v["development"]
                        h_data["development"] = json_development
                        arr_insert << h_data
                    else
                        json_development[date]["meditate"] = v["meditate"]
                        json_development[date]["development"] = v["development"]
                        DevelopmentUserMapping.update(v["update_id"], development: json_development.to_json)
                    end
                else
                    json_development ||= {}
                    json_development[date] ||= {}
                    json_development[date]["meditate"] = v["meditate"]
                    json_development[date]["development"] = v["development"]
                    h_data["development"] = json_development
                    arr_insert << h_data
                end
            end

            DevelopmentUserMapping.create(arr_insert) if arr_insert.length > 0
            save_activity("Update", "Success", "Add development to user successfully")
            state = "success"
            message = "Update development successfully"
        rescue => e
            save_activity("Update", "Fail", "Fail to update development to user")
            state = "error"
            message = "Something was wrong. Please contact admin"
        end
        respond_to do |format|
            format.json { render json: {status: state, message: message} }
        end
    end

    def show_homework_table
        @homework = Homework.where(subject_id: params["id"], tag_id: params["tag_id"]).where.not(status: "deleted")
        is_sub = false

        if params["category"].present?
            @homework = @homework.where("homeworks.category_id = ?", params["category"])
            category_id = params["category"]
        else
            @homework = @homework.where("homeworks.category_id = 1")
        end

        if params["type"].blank?
            @homework = @homework.where("homeworks.homework_type_id = 1")
        else
            @homework = @homework.where("homeworks.homework_type_id = ?", params["type"])
            is_sub = true
        end

        @sub_homework = HomeworkType.where(status: "active")
        @user = User.where(status: "active", role: 3)

        render_page = is_sub ? "homework/table_homework_list" : "homework/homework_list2"
        render(
            partial: render_page,
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {homework: @homework, subject_id: params["id"], tag_id: params["tag_id"], subject_name: params["subject"], category_id: category_id, banner: params["banner"]}
        )
    end

    def add_homework_type
        form_data = params["form_homework_type"]
        begin
            HomeworkType.create(homework_type: form_data["homework_type"], description: form_data["description"])
            @category = Category.where(status: "active").index_by(&:id)
            @homework = HomeworkUserMapping.select("homeworks.task_name, homeworks.status as homework_status, homeworks.estimate_date, homeworks.full_score, homework_user_mappings.*")
            @homework = @homework.where(user_id: session["current_user"]["id"])
            @homework = @homework.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
            @homework = @homework.where("homeworks.status != ? and homeworks.subject_id = ?", "deleted", params["subject_id"])
            @homework = @homework.where("homeworks.category_id = ?", params["category"])
              
            @sub_homework = HomeworkType.where(status: "active")
            save_activity("Add", "Success", "Add homework type: #{form_data["homework_type"]} successfully")
            render(
                partial: "homework/homework_list",
                formats: [:html, :js, :json, :url_encoded_form],
                locals: {subject_name: params["subject"], category_id: params["category"]}
            )
        rescue => e
            p e.message
            save_activity("Add", "Fail", "Fail to add homework type because somethinf went wrong")
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end

    def new
        homework = Homework.where(status: "active", subject_id: params["subject"]).where("priority is not NULL").maximum(:priority)
        @priority = homework+1
    end

    def create_question
        begin
            homework = Homework.insert_homework(params["form_homework"])
            questions = params["form_questions"]
            arr_insert = []
            questions.each do |key, value|
                question = {}
                question["question_no"] = key.gsub("question", "").to_i
                question["score"] = value["full_score"].to_i
                question["question"] = value["text"]
                question["question_media"] = value["media"]
                question["image_thumbnail"] = value["image_thumbnail"]

                answer_format = value["selected_format"]
                question["answer_format"] = answer_format
                question["homework_id"] = homework.id
                
                case answer_format.to_i
                when 1
                    question["chords"] = value["answers"]
                    question["correct_answer"] = value["correct_answers"].join(",")

                    ### Insert questions
                    arr_insert << question
                when 2
                    answers = value["answers"]
                    answers.each do |k, v|
                        hash_answer = {}
                        name, choice_no = k.split("_")
                        hash_answer["choice_no"] = choice_no
                        if v["media"].class == ActionDispatch::Http::UploadedFile
                            hash_answer["answer"] = v["media"]
                            hash_answer["answer_image_thumbnail"] = v["answer_image_thumbnail"]
                        else
                            hash_answer["answer_text"] = v["media"]
                        end
                        hash_answer["correct_answer"] = value["correct_answers"].join(",")
                        
                        ### Insert questions
                        arr_insert << hash_answer.merge(question)
                    end
                when 3
                    answer_option = value["option"] == "reveal" ? 1 : 0
                    question["option"] = answer_option
                    question["reveal"] = value["reveal"]
                    question["answer_image_thumbnail"] = value["reveal_image_thumbnail"]
                    
                    ### Insert question
                    arr_insert << question
                end
            end

            import_question = Question.create(arr_insert)
            if import_question
                save_activity("Add Homework", "Success", "Create homework: #{params["form_homework"]["name"]} successfully")
                state = "success"
                message = "Create homework: #{params["form_homework"]["name"]} successfully."
                flash["success"] = "Create homework: #{params["form_homework"]["name"]} successfully."
            else
                save_activity("Add Homework", "Fail", "Fail to create homework because database has something wrong")
                state = "error"
                message = "Cannot create homework. Please contact admin"
            end

        rescue => e
            p e.message
            p e.backtrace.first
            state = "error"
            message = "Something went wrong. Please contact admin"
            save_activity("Add Homework", "Fail", "Fail to create homework because something went wrong")
        end
        respond_to do |format|
            format.json { render json: {status: state, message: message} }
        end
        # redirect_to homework_index_path()
    end

    def get_user_homework_mapping
        homework = HomeworkUserMapping.where(homework_id: params["id"])
        arr_homework = homework.pluck(:user_id)
        respond_to do |format|
            format.json { render json: {homework_user_mapping: arr_homework} }
        end
    end

    def add_user_to_homework
        begin
            # return redirect_to path_to_root unless can_view_menu?([17])
            homework = HomeworkUserMapping.select("homework.task_name, homework.estimate_date, homework_user_mappings.*").where(homework_id: params["homework_id"])
            homework = homework.joins("left join homeworks on homeworks.id on homework_user_mappings.homework_id")
            db_user = homework.pluck(:user_id)
            tag = homework.pluck(:tag_id)
            homework_name = homework.pluck(:task_name, :estimate_date).uniq.flatten

            case params["type"]
            when "user"
                users = params["users"].split(",").map(&:to_i)
                remain_user = users - db_user
            when "class"
                arr_user = params["users"].split(",")
                arr_user.each_with_index do |cr, index|
                    classroom, room = cr.split("_")
                    users = index == 0 ? User.where(study_class: classroom, room: room, role: 3, status: "active") : users.or(User.where(study_class: classroom, room: room, role: 3, status: "active"))
                end
                users = users.pluck(:id)
                remain_user = users - db_user
            end

            arr_user = []
            arr_development = []
            remain_user.each do |u|
                h_user = {}
                h_user["user_id"] = u
                h_user["homework_id"] = params["homework_id"].to_i
                h_user["status"] = "open"
                h_user["score"] = 0
                arr_user << h_user
                tag.each do |t|
                    development = {}
                    development["tag_id"] = t
                    development["user_id"] = u
                    arr_development << development
                end

                ### Send notification
                if can_view_menu?([12])
                    Notification.create(subject: "Assign homework", 
                        message: "You have new homework: #{homework_name[0]} assignment. Please do it before #{homework[1].strftime("%d/%m/%Y")}",
                        status: 0,
                        send_by: session["current_user"]["id"],
                        user_id: u,
                        notification_type: "new_assign"
                    )
                end

                ### Send email
                if can_view_menu?([60])
                    user = User.find(u)
                    HomeworkMailer.new_assignment(user, homework_name).deliver_now
                end
            end
            
            HomeworkUserMapping.create(arr_user)
            DevelopmentUserMapping.create(arr_development)
            @user = User.where(status: "active", role: 3)
            save_activity("Homework", "Success", "Add user to homework successfully")
            render(
                partial: "homework/add_user_to_homework",
                formats: [:html, :js, :json, :url_encoded_form]
            )
        rescue => e
            p e.message
            p e.backtrace.first
            save_activity("Homework", "Fail", "Cannot add user to homework successfully")
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end

    def add_questions
        count_question = params["question_no"].to_i + 1
        render(
            partial: "homework/question",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {question_no: count_question, question_data: nil}
        )
    end

    def add_choices
        count_answer = params["answer_no"].to_i + 1
        render(
            partial: "homework/answer_choice",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {question_no: params["question_no"], answer_no: count_answer, answer: nil}
        )
    end

    def select_answer_format
        question_no = params["question_no"]
        case params["format"]
        when 1
            page = "homework/select_chord"
            parameter = {question_no: question_no, answer: "", correct_answer: ""}
        when 2
            page = "homework/select_choices"
            parameter = {question_no: question_no, answer: ""}
        when 3
            page = "homework/upload_file"
            parameter = {question_no: question_no, option: "", reveal: {}}
        end
        render(
            partial: page,
            formats: [:html, :js, :json, :url_encoded_form],
            locals: parameter
        )
    end

    def edit
        homework = Question.select("questions.*, homeworks.task_name, homeworks.status, homeworks.estimate_date, homeworks.category_id, homeworks.full_score, homeworks.subject_id, homeworks.is_default, homeworks.priority, homeworks.tag_id ,homeworks.homework_type_id")
        homework = homework.where(homework_id: params["id"])
        homework = homework.joins("left join homeworks on homeworks.id = questions.homework_id")
        homework = homework.order(question_no: :ASC)

        @h_homework = Hash.new
        hash_question = Hash.new
        homework.each do |hw|
            @h_homework["homework_id"] = params["id"]
            @h_homework["task_name"] = hw.task_name
            @h_homework["status"] = hw.status
            @h_homework["estimate_date"] = hw.estimate_date
            @h_homework["category_id"] = hw.category_id
            @h_homework["full_score"] = hw.full_score
            @h_homework["subject_id"] = hw.subject_id
            @h_homework["is_default"] = hw.is_default
            @h_homework["priority"] = hw.priority
            @h_homework["homework_type_id"] = hw.homework_type_id
            @h_homework["tag_id"] = hw.tag_id
            @h_homework["max_question_no"] = hw.question_no
            @h_homework["questions"] ||= []
           
            hash_question["no_#{hw.question_no}"] ||= {}
            hash_question["no_#{hw.question_no}"]["id"] = hw.id
            hash_question["no_#{hw.question_no}"]["question"] = hw.question
            hash_question["no_#{hw.question_no}"]["score"] = hw.score
            hash_question["no_#{hw.question_no}"]["question_media"] = hw.question_media
            hash_question["no_#{hw.question_no}"]["image_thumbnail"] = hw.image_thumbnail
            # p url_for(hw.question_media)
            hash_question["no_#{hw.question_no}"]["answer_format"] = hw.answer_format
            hash_question["no_#{hw.question_no}"]["chords"] = hw.chords
            hash_question["no_#{hw.question_no}"]["choice"] ||= []
            answer = hw.answer.attached? ? hw.answer : hw.answer_text
            hash_question["no_#{hw.question_no}"]["choice"] << [hw.id, hw.choice_no, answer, hw.answer_image_thumbnail]
            hash_question["no_#{hw.question_no}"]["correct_answer"] = hw.correct_answer
            hash_question["no_#{hw.question_no}"]["option"] = hw.option
            hash_question["no_#{hw.question_no}"]["reveal"] = {}
            hash_question["no_#{hw.question_no}"]["reveal"]["media"] = hw.reveal
            hash_question["no_#{hw.question_no}"]["reveal"]["image_thumbnail"] = hw.answer_image_thumbnail
        end
        @h_homework["questions"] << hash_question
    end

    def update
        begin
            homework = Homework.update_homework(params["form_homework"])
            questions = params["form_questions"]
            questions.each do |key, value|
                answer_format = value["selected_format"]
                case answer_format.to_i
                when 1
                    ### Update questions
                    @import_question = Homework.update_question_chord(value["id"], value["text"], value["media"], value["image_thumbnail"], value["full_score"], value["update_question_media"], value["answers"], value["correct_answers"].join(","))

                when 2
                    answers = value["answers"]
                    answers.each do |k, v|
                        if !v.blank?
                            # question = Question.find(value["id"])
                            if value["update_question_media"] == "true"
                                @import_question = Homework.update_question_with_new_media(value["id"], value["text"], value["media"], value["image_thumbnail"], value["full_score"], value["correct_answers"].join(","), v)
                            else
                                @import_question = Homework.update_question(value["id"], value["text"], value["image_thumbnail"], value["full_score"], value["correct_answers"].join(","), v)
                            end
                        end
                    end
                when 3
                    answer_option = value["option"] == "reveal" ? 1 : 0
                    if answer_option == 0
                        @import_question = Homework.update_question_not_reveal(value["id"], value["text"], value["media"], value["image_thumbnail"], value["full_score"], value["update_question_media"], answer_option)
                    else
                        @import_question = Homework.update_question_upload(value["id"], value["text"], value["media"], value["image_thumbnail"], value["full_score"], value["update_question_media"], answer_option, value)
                    end
                        # question["option"] = answer_option
                    # question["reveal"] = value["reveal"]
                    
                    ### Insert question
                    # arr_insert << question
                end
            end

            if @import_question
                save_activity("Update", "Success", "Update homework: #{params["form_homework"]["name"]} successfully")
                state = "success"
                message = "Update homework: #{params["form_homework"]["name"]} successfully."
                flash["success"] = "Update homework: #{params["form_homework"]["name"]} successfully."
            else
                save_activity("Update", "Fail", "Fail to update homework because database has something wrong")
                state = "error"
                message = "Cannot update homework. Please contact admin"
            end

        rescue => e
            p e.message
            p e.backtrace.first
            state = "error"
            message = "Something went wrong. Please contact admin"
            save_activity("Update", "Fail", "Fail to update homework because something went wrong")
        end
        respond_to do |format|
            format.json { render json: {status: state, message: message} }
        end
    end

    def destroy
        unless can_view_menu?([26])
            flash["error"] = "You don't have permission to delete subject"
            return redirect_to path_to_root
        end
        begin
            subject = Subject.find(params["id"]).update(status: "deleted")
            @subject = User.select("users.profile_pic, subjects.*")
            @subject = @subject.joins("right join subjects on subjects.created_by = users.id")
            @subject = @subject.where("subjects.status = ? and subjects.subject_type = ?", "active", "homework")
            save_activity("Delete", "Success", "Delete subject: #{params["name"]} successfully")
            
            render(
                partial: "homework/subject_list",
                formats: [:html, :js, :json, :url_encoded_form]
            )
        rescue => e
            save_activity("Delete", "Fail", "Cannot delete data")
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end

    def delete_homework
        unless can_view_menu?([36])
            flash["error"] = "You don't have permission to delete homework"
            return redirect_to path_to_root
        end
        begin
            subject = Homework.find(params["id"]).update(status: "deleted")
            save_activity("Delete", "Success", "Delete homework: #{params["name"]} successfully")
            flash["success"] = "Delete homework: #{params["name"]} successfully"
            respond_to do |format|
                format.json { render json: {status: "success", redirect_path: homework_subject_list_url()} }
            end
        rescue => e
            save_activity("Delete", "Fail", "Cannot delete data")
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end

    private

    def get_answer params, question_no
        h_homework = Hash.new
        answer = Answer.where(homework_id: params["id"], user_id: params["user_id"]).order(question_no: :ASC)

        answers = Hash.new
        if answer.blank?
            h_homework["current_score"] = 0
            h_homework["current_question"] = [1]
        else
            # answer = answer.maximum(:question_no)
            answer.each do |ans|
                h_homework["current_score"] ||= 0
                h_homework["current_score"] += ans.current_score
                h_homework["current_question"] ||= []
                next if question_no.to_i >= ans.question_no.to_i
                h_homework["current_question"] << ans.question_no.to_i if ans.upload_answer.attached?
                answers["#{ans.homework_id}_#{ans.question_no}"] = {}
                answers["#{ans.homework_id}_#{ans.question_no}"]["id"] = ans.id
                answers["#{ans.homework_id}_#{ans.question_no}"]["score"] = ans.current_score
                answers["#{ans.homework_id}_#{ans.question_no}"]["answer"] = ans.upload_answer
                answers["#{ans.homework_id}_#{ans.question_no}"]["second_answer"] = ans.secondary_upload_answer
            end
            h_homework["current_question"].sort!
        end

        homework = Question.select("questions.*, homeworks.id as homework_id, homeworks.task_name, homeworks.status, homeworks.estimate_date, homeworks.category_id, homeworks.full_score, homeworks.subject_id, homeworks.is_default, homeworks.priority ,homeworks.homework_type_id")
        homework = homework.joins("left join homeworks on homeworks.id = questions.homework_id")
        homework = homework.joins("left join homework_user_mappings on homework_user_mappings.homework_id = homeworks.id")
        homework = homework.where("homeworks.id = ? and questions.question_no = ?", params["id"], h_homework["current_question"][0])
        homework = homework.order(question_no: :ASC)

        hash_question = Hash.new
        homework.each do |hw|
            next if hw.answer_format != 3
            h_homework["homework_id"] = params["id"]
            h_homework["homework_mapping_id"] = params["homework_mapping"]
            h_homework["task_name"] = hw.task_name
            h_homework["full_score"] = hw.full_score
            # h_homework["question_length"] ||= []
            # h_homework["question_length"] << hw.question_no
            # h_homework["questions"] ||= []
            hash_question["no_#{hw.question_no}"] ||= {}
            hash_question["no_#{hw.question_no}"]["id"] = hw.id
            hash_question["no_#{hw.question_no}"]["full_score"] = hw.score
            hash_question["no_#{hw.question_no}"]["question_no"] = hw.question_no
            hash_question["no_#{hw.question_no}"]["question"] = hw.question
            hash_question["no_#{hw.question_no}"]["question_media"] = hw.question_media
            hash_question["no_#{hw.question_no}"]["image_thumbnail"] = hw.image_thumbnail
            hash_question["no_#{hw.question_no}"]["option"] = hw.option
            hash_question["no_#{hw.question_no}"]["reveal"] = hw.reveal
            if answers["#{hw.homework_id}_#{hw.question_no}"].present?
                hash_question["no_#{hw.question_no}"]["answer_id"] = answers["#{hw.homework_id}_#{hw.question_no}"]["id"] 
                hash_question["no_#{hw.question_no}"]["score"] = answers["#{hw.homework_id}_#{hw.question_no}"]["score"]
                hash_question["no_#{hw.question_no}"]["answer"] = answers["#{hw.homework_id}_#{hw.question_no}"]["answer"]
                hash_question["no_#{hw.question_no}"]["second_answer"] = answers["#{hw.homework_id}_#{hw.question_no}"]["second_answer"]
            end
            h_homework["questions"] = hash_question
        end

        h_homework
    end
end
