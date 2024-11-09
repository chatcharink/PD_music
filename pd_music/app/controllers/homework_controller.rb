class HomeworkController < ApplicationController
    def index
        return redirect_to path_to_root unless can_view_menu?([20])
        @subject = Subject.select("users.profile_pic, subjects.*").where(status: "active")
        @subject = @subject.joins("left join users on users.id = subjects.created_by")
        if session["current_user"]["role"] == 3
            @subject = @subject.select("subjects.*, homeworks.id, homework_user_mappings.id")
            @subject = @subject.joins("left join homeworks on homeworks.subject_id = subjects.id")
            @subject = @subject.joins("left join homework_user_mappings on homework_user_mappings.homework_id = homeworks.id")
            @subject = @subject.where("homework_user_mappings.user_id = ?", session["current_user"]["id"])
        end

        @user = User.where(status: "active", role: 3)
    end

    def create
        subject = Subject.insert_subject(params["form_create_homework"], session)
        if subject
            @subject = Subject.select("users.profile_pic, subjects.*").where(status: "active")
            @subject = @subject.joins("left join user on users.id = subjects.created_by")
            @user = User.where(status: "active", role: 3)
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
        return redirect_to path_to_root unless can_view_menu?([22])
        @category = Category.all.index_by(&:id)
        @homework = HomeworkUserMapping.select("homeworks.task_name, homeworks.status as homework_status, homeworks.estimate_date, homeworks.full_score, homework_user_mappings.*")
        @homework = @homework.where(user_id: session["current_user"]["id"])
        @homework = @homework.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
        @homework = @homework.where("homeworks.status != ? and homeworks.subject_id = ?", "deleted", params["id"])
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
        end

        @sub_homework = HomeworkType.where(status: "active")

        render(
            partial: "homework/homework_list",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {subject_name: params["subject"], category_id: category_id}
        )
    end

    def add_homework_type
        form_data = params["form_homework_type"]
        begin
            HomeworkType.create(homework_type: form_data["homework_type"], description: form_data["description"])
            @category = Category.all.index_by(&:id)
            @homework = HomeworkUserMapping.select("homeworks.task_name, homeworks.status as homework_status, homeworks.estimate_date, homeworks.full_score, homework_user_mappings.*")
            @homework = @homework.where(user_id: session["current_user"]["id"])
            @homework = @homework.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
            @homework = @homework.where("homeworks.status != ? and homeworks.subject_id = ?", "deleted", params["subject_id"])
            @homework = @homework.where("homeworks.category_id = ?", params["category"])
              
            @sub_homework = HomeworkType.where(status: "active")
            render(
                partial: "homework/homework_list",
                formats: [:html, :js, :json, :url_encoded_form],
                locals: {subject_name: params["subject"], category_id: params["category"]}
            )
        rescue => e
            p e.message
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end

    def new
        
    end

    def create
        begin
            homework = Homework.insert_homework(params["form_homework"])
            questions = params["form_questions"]
            arr_insert = []
            questions.each do |key, value|
                question = {}
                question[:question_no] = key.gsub("question", "").to_i
                question[:question] = value["text"]
                question[:question_media] = value["media"]

                answer_format = value["selected_format"]
                question[:answer_format] = answer_format
                
                question[:homework_id] = homework.id
                
                case answer_format.to_i
                when 1
                    question[:chords] = value["answers"]
                    question[:correct_answer] = value["correct_answers"].join(",")

                    ### Insert questions
                    arr_insert << question
                when 2
                    answers = value["answers"]
                    
                    answers.each do |k, v|
                        name, choice_no = k.split("_")
                        question[:choice_no] = choice_no
                        question[:answer] = v
                        question[:correct_answer] = value["correct_answers"].join(",")
                        
                        ### Insert questions
                        arr_insert << question
                    end
                when 3
                    answer_option = value["option"] == "reveal" ? 1 : 0
                    question[:option] = answer_option
                    question[:reveal] = value["reveal"]
                    
                    ### Insert question
                    arr_insert << question
                end
            end

            import_question = Question.create(arr_insert)
            if import_question
                flash["success"] = "Create homework: #{params["form_homework"]["name"]} successfully."
            else
                flash["error"] = "Cannot create homework. Please contact admin"
            end

        rescue => e
            p e.message
            p e.backtrace.first
            flash["error"] = "Something went wrong. Please contact admin"
        end
        redirect_to homework_index_path()
    end

    def add_questions
        count_question = params["question_no"].to_i + 1
        render(
            partial: "homework/question",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {question_no: count_question}
        )
    end

    def add_choices
        count_answer = params["answer_no"].to_i + 1
        render(
            partial: "homework/answer_choice",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {question_no: params["question_no"], answer_no: count_answer}
        )
    end

    def select_answer_format
        question_no = params["question_no"]
        case params["format"]
        when 1
            page = "homework/select_chord"
        when 2
            page = "homework/select_choices"
        when 3
            page = "homework/upload_file"
        end
        render(
            partial: page,
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {question_no: question_no}
        )
    end
end
