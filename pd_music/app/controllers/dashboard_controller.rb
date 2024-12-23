class DashboardController < ApplicationController
    before_action :is_user_logged_in?
    
    def index
        return redirect_to path_to_root unless can_view_menu?([1])
        @category = Category.where(status: "active").index_by(&:id)
        @assign_hw = HomeworkUserMapping.get_hw_user_mapping(session)
        if session["current_user"]["role"] != 3
            @assign_hw = @assign_hw.where("users.study_class = ? and users.status = ?", session["current_user"]["study_class"], "active").joins("left join users on users.id = homework_user_mappings.user_id")
        else
            @assign_hw = @assign_hw.where(user_id: session["current_user"]["id"])
        end

        if @assign_hw.blank?
            @data = set_default(@category)
        else
            @data = split_category(@assign_hw)
        end
        # @table_data = @assign_hw.where("estimate_date between ? and ?", DateTime.now(), Date.today.beginning_of_week(:monday)+7).order(estimate_date: :ASC)
    end

    def dashboard_datatable
        if params["teacher_mode"] == "true"
            respond_to do |format|
                format.html
                format.json { render json: DashboardTeacherDatatable.new(params) } 
            end
        else
            respond_to do |format|
                format.html
                format.json { render json: DashboardDatatable.new(params) } 
            end
        end
    end

    def filter_report
        return if can_view_menu?([3])
        case params["type"]
        when "week"
            date_from = Date.today.beginning_of_week(:monday)
            date_to = date_from + 6
        when "month"
            date_from = Date.today.at_beginning_of_month
            date_to = Date.today.at_end_of_month
        else
            date_from = DateTime.parse(params["date_from"])
            date_to = DateTime.parse(params["date_to"])
        end
        
        graph = HomeworkUserMapping.get_hw_user_mapping(session)
        if params["group_id"].present?
            graph = graph.where("users.musical_instrument_id = ?", params["group_id"])
        end
        graph = graph.where("homework_user_mappings.user_id = ?", params["id"]) if params["id"].present?
        
        if params["class"].present?
            graph = graph.where("users.study_class = ?", params["class"])
        end

        if params["exam_date"].present?
            exam_date = get_date_exam(params["exam_date"])
            graph = graph.where(exam_date).where("users.exam_date is not null")
        end

        if params["category_id"].blank?
            @category = Category.where(status: "active").index_by(&:id)
        else
            @category = Category.find(params["category_id"])
        end

        store_score = Hash.new
        
        graph.each do |hw|
            if params["category_id"].present?
                store_score = store_frequency_score(store_score, hw.estimate_date, hw.send_date, date_from, date_to, hw.status)
            else
                store_score = store_frequency_score(store_score, hw.estimate_date, hw.send_date, date_from, date_to, hw.status, hw.category_id)
            end
        end

        all_assign = Hash.new
        data = calculate_frequency_score(all_assign, store_score, date_from, date_to, params["category_id"])
        graph_info = []
        color = []

        data.each do |k, v|
            if params["category_id"].blank?
                name = @category[k.gsub("category_", "").to_i]["name_en"]
                data = v["data"]
                color << "##{@category[k.gsub("category_", "").to_i]["color_code"]}"
            else
                name = @category.name_en
                data = v
                color << "##{@category.color_code}"
            end
            graph_info << {name: name, data: data}
        end

        render(
            partial: "dashboard/graph",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {graph: graph_info, color: color}
        )
    end

    def change_tab
        tab = params["tab"]
        case tab
        when "all"
            @category = Category.where(status: "active").index_by(&:id)
            @assign_hw = HomeworkUserMapping.get_hw_user_mapping(session)
            locals = {teacher_mode: false}
            if params["group_id"].present?
                @assign_hw = @assign_hw.where("users.musical_instrument_id = ? and users.status = ?", params["group_id"], "active").joins("left join users on users.id = homework_user_mappings.user_id")
                locals[:teacher_mode] = set_teacher_mode(params, session)
            end

            if params["id"].present?
                user_id = params["id"].blank? ? session["current_user"]["id"] : params["id"]
                @assign_hw = @assign_hw.where(user_id: user_id)
            end

            if params["class"].present?
                @assign_hw = @assign_hw.where("users.study_class = ?", params["class"])
                locals[:teacher_mode] = set_teacher_mode(params, session)
            end

            if params["exam_date"].present?
                exam_date = get_date_exam(params["exam_date"])
                @assign_hw = @assign_hw.where(exam_date).where("users.exam_date is not null")
                locals[:teacher_mode] = set_teacher_mode(params, session)
            end

            if @assign_hw.blank?
                @data = set_default(@category)
            else
                @data = split_category(@assign_hw)
            end
            # @table_data = @assign_hw.where("estimate_date between ? and ?", DateTime.now(), Date.today.beginning_of_week(:monday)+7).order(estimate_date: :ASC)
            render(
                partial: "dashboard/summary_box_by_teacher",
                formats: [:html, :js, :json, :url_encoded_form],
                locals: locals
            )
        else
            @category = Category.find(params["category_id"])
            @assign_hw = HomeworkUserMapping.get_hw_user_mapping(session)
            locals = {user: User.where(status: "active").index_by(&:id), teacher_mode: false}
            @assign_hw = @assign_hw.where("homeworks.category_id = ?", params["category_id"])
            
            if params["group_id"].present?
                @assign_hw = @assign_hw.where("users.musical_instrument_id = ? and users.status = ?", params["group_id"], "active")
                locals[:teacher_mode] = set_teacher_mode(params, session)
            end

            if params["id"].present?
                user_id = params["id"].blank? ? session["current_user"]["id"] : params["id"]
                @assign_hw = @assign_hw.where(user_id: user_id)
            end
            
            if params["class"].present?
                @assign_hw = @assign_hw.where("users.study_class = ?", params["class"])
                locals[:teacher_mode] = set_teacher_mode(params, session)
            end

            if params["exam_date"].present?
                exam_date = get_date_exam(params["exam_date"])
                @assign_hw = @assign_hw.where(exam_date).where("users.exam_date is not null")
                locals[:teacher_mode] = set_teacher_mode(params, session)
            end

            if @assign_hw.blank?
                @data = set_default(@category, params["category_id"])
            else
                @data = split_category(@assign_hw, params["category_id"])
                @comment = Comment.get_comment_of_classroom(@data["specific_category"]["receiver_id"])
            end
            # @table_data = @assign_hw.where("estimate_date between ? and ?", DateTime.now(), Date.today.beginning_of_week(:monday)+7).order(estimate_date: :ASC)
            render(
                partial: "dashboard/summary_of_category",
                formats: [:html, :js, :json, :url_encoded_form],
                locals: locals
            )
        end
    end

    def add_comment
        form = params["form_comment"]
        begin
            comment = Comment.insert_comment(form, session["current_user"]["id"])
            user = User.find(form["comment_to"])

            ### Send notification
            if can_view_menu?([14])
                noti = Notification.insert_notification(form, session["current_user"]["id"])
            end

            ### Send email
            if can_view_menu?([62])
                CommentBehaviourMailer.comment(user, comment).deliver_now
            end

            flash[:success] = "Comment to #{user.firstname} #{user.lastname} successfully."
        rescue => e
            p e.message
            p e.backtrace.first
            flash[:error] = "Cannot comment to student. Please contact admin"
        end
        redirect_to root_path()
    end

    def view_user_comment
        @comment = Comment.get_comment_of_classroom(params[:user_id])
        render(
            partial: "dashboard/expand_comment_dialog",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {}
        )
    end

    def update_status
        begin
            comment = Comment.where(student_id: params["user_id"])
            comment.update_all(status: params["status"])
            comment = comment.select("users.firstname, users.lastname, comments.*").joins("left join users on users.id = comments.student_id")
            h_behaviour = Hash.new()
            comment.each do |c|
                h_behaviour["#{c.firstname} #{c.lastname}"] ||= {}
                h_behaviour["#{c.firstname} #{c.lastname}"]["id"] = c.student_id
                h_behaviour["#{c.firstname} #{c.lastname}"]["negative_times"] ||= 0
                h_behaviour["#{c.firstname} #{c.lastname}"]["negative_times"] += 1 if c.rating <= 3
                h_behaviour["#{c.firstname} #{c.lastname}"]["status"] = c.status.capitalize
                if h_behaviour["#{c.firstname} #{c.lastname}"]["latest_comment"].blank?
                    h_behaviour["#{c.firstname} #{c.lastname}"]["latest_comment"] = DateTime.parse(c.updated_at.strftime("%d/%m/%Y %H:%M:%S"))
                else
                    h_behaviour["#{c.firstname} #{c.lastname}"]["latest_comment"] = DateTime.parse(c.updated_at.strftime("%d/%m/%Y %H:%M:%S")) if h_behaviour["#{c.firstname} #{c.lastname}"]["latest_comment"] < DateTime.parse(c.updated_at.strftime("%d/%m/%Y %H:%M:%S"))
                end
            end

            render(
                partial: "dashboard/table_comment_admin",
                formats: [:html, :js, :json, :url_encoded_form],
                locals: {behaviour: h_behaviour}
            )
        rescue => e
            p e.message
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end

    end

    def add_exam_date
        form_exam_date = params["form_add_exam_date"]
        begin
            exam_date = Date.parse(form_exam_date["exam_date"])
            user = User.update(form_exam_date["student_id"], exam_date: exam_date)
            save_activity("Add", "Success", "Add exam date: #{exam_date.strftime("%d/%m/%Y")} to #{user.firstname} #{user.lastname} successfully")
            flash["success"] = "Add exam date to #{user.firstname} #{user.lastname} successfully"
        rescue => e
            p e.message
            save_activity("Add", "Fail", "Your exam date is invalid format or something was wrong")
            flash["error"] = "Your exam date is invalid format or something was wrong"
        end
        redirect_to root_path()
    end

    private
    def split_category assign_hw, category_id = nil, date_from = nil, date_to = nil
        all_assign_hw = Hash.new
        store_score = Hash.new
        time_now = DateTime.now

        if date_from.blank? && date_to.blank?
            date_from = Date.today.beginning_of_week(:monday)
            date_to = date_from + 6 #time_now
        end
        assign_hw.each do |hw|
            key = category_id.blank? ? "category_#{hw.category_id}" : "specific_category"
            all_assign_hw[key] ||= {}
            all_assign_hw[key]["done"] ||= 0
            all_assign_hw[key]["remain"] ||= 0
            if hw.status == "open" || hw.status == "reject"
                all_assign_hw[key]["remain"] += 1
            else
                all_assign_hw[key]["done"] += 1
            end

            estimated_date = hw.estimate_date
            diff_date = (Date.parse(estimated_date.strftime("%Y/%m/%d")) - Date.parse(time_now.strftime("%Y/%m/%d"))).round
            
            if diff_date < 0 && (hw.status == "open" || hw.status == "reject")
                all_assign_hw[key]["estimated"] ||= 0
                all_assign_hw[key]["estimated"] += 1
                all_assign_hw[key]["day"] ||= 0
                all_assign_hw[key]["day"] += 1 if diff_date < 0 && diff_date >= -7
                all_assign_hw[key]["week"] ||= 0
                all_assign_hw[key]["week"] += 1 if diff_date < -7
            end

            store_score = store_frequency_score(store_score, estimated_date, hw.send_date, date_from, date_to, hw.status, hw.category_id)
            
            all_assign_hw[key]["scores"] ||= []
            all_assign_hw[key]["scores"] << [hw.task_name, hw.score, hw.user_id]
            all_assign_hw[key]["score"] ||= 0
            all_assign_hw[key]["score"] += hw.score
            all_assign_hw[key]["full_score"] ||= 0
            all_assign_hw[key]["full_score"] += hw.full_score

            all_assign_hw[key]["receiver_id"] ||= []
            all_assign_hw[key]["student_list"] ||= []
            if (!all_assign_hw[key]["receiver_id"].include?(hw.student_id)) && hw.role == 3
                all_assign_hw[key]["receiver_id"] << hw.student_id
                all_assign_hw[key]["student_list"] << ["#{hw.firstname} #{hw.lastname}", hw.student_id]
            end
        end

        all_assign_hw["specific_category"]["scores"].sort_by!{ |sc| sc[1] } if all_assign_hw["specific_category"].present?
        all_assign_hw = calculate_frequency_score(all_assign_hw, store_score, date_from, date_to, category_id)
        
        return all_assign_hw
    end

    def store_frequency_score store_score, estimated_date, send_date, date_from, date_to, status, category_id = nil
        frequency = 0
        if send_date.present?
            if send_date.between?(date_from, date_to)
                date_format = send_date.strftime("%m/%d/%Y")
                key = category_id.blank? ? date_format : "#{date_format}_#{category_id}"
                store_score[key] ||= {}
                store_score[key]["count"] ||= 0
                store_score[key]["count"] += 1
                store_score[key]["value"] ||= 0
                frequency = frequency_score(((estimated_date - send_date)/3600).round) if status == "send" || status == "checked"
                store_score[key]["value"] += frequency
            end
        end
        return store_score
    end

    def calculate_frequency_score all_assign, store_score, date_from, date_to, category_id
        (date_from..date_to).each do |date|
            date_format = date.strftime("%m/%d/%Y")
            if category_id.blank?
                @category.each do |k, v|
                    all_assign["category_#{k}"] ||= {}
                    all_assign["category_#{k}"]["data"] ||= []
                    unless store_score["#{date_format}_#{k}"].blank?
                        frequency = (store_score["#{date_format}_#{k}"]["value"].to_f/store_score["#{date_format}_#{k}"]["count"].to_f).round(2)
                    end
                    all_assign["category_#{k}"]["data"] << [date_format, frequency.to_f]
                end
            else
                all_assign["data"] ||= []
                unless store_score["#{date_format}"].blank?
                    frequency = (store_score["#{date_format}"]["value"].to_f/store_score["#{date_format}"]["count"].to_f).round(2)
                end
                all_assign["data"] << [date_format, frequency.to_f]
            end
        end
        return all_assign
    end

    def set_default category, category_id = nil, date_from = nil, date_to = nil
        h_default = {}
        if date_from.blank? && date_to.blank?
            date_from = Date.today.beginning_of_week(:monday)
            date_to = date_from + 6 #time_now
        end

        if category_id.present?
            h_default["specific_category"] ||= {}
            h_default["specific_category"]["done"] ||= 0
            h_default["specific_category"]["remain"] ||= 0
            h_default["specific_category"]["estimated"] ||= 0
            h_default["specific_category"]["scores"] ||= []
            h_default["specific_category"]["score"] ||= 0
            h_default["specific_category"]["full_score"] ||= 0
            h_default["specific_category"]["comment"] ||= []
            h_default["specific_category"]["student_list"] ||= []

            (date_from..date_to).each do |date|
                h_default["data"] ||= []
                h_default["data"] << [date.strftime("%m/%d/%Y"), 0]
            end
        else
            category.each do |k, v|
                h_default["category_#{v["id"]}"] ||= {}
                h_default["category_#{v["id"]}"]["done"] ||= 0
                h_default["category_#{v["id"]}"]["remain"] ||= 0
                h_default["category_#{v["id"]}"]["estimated"] ||= 0
                h_default["category_#{v["id"]}"]["scores"] ||= []
                h_default["category_#{v["id"]}"]["score"] ||= 0
                h_default["category_#{v["id"]}"]["full_score"] ||= 0
                h_default["category_#{v["id"]}"]["comment"] ||= []
                h_default["category_#{v["id"]}"]["student_list"] ||= []
                
                (date_from..date_to).each do |date|
                    h_default["category_#{v["id"]}"]["data"] ||= []
                    h_default["category_#{v["id"]}"]["data"] << [date.strftime("%m/%d/%Y"), 0]
                end
            end
        end

        h_default
    end

    def set_teacher_mode params, session
        return params["teacher_mode"] && session["current_user"]["role"] != 3
    end

    def frequency_score hours
        if hours > 0
            return score = 10
        elsif hours < 0 && hours > -2
            return score = 9
        elsif hours < -2 && hours > -4
            return score = 8
        elsif hours < -4 && hours > -6
            return score = 7
        elsif hours < -6 && hours > -8
            return score = 6
        elsif hours < -8 && hours > -10
            return score = 5
        elsif hours < -10 && hours > -12
            return score = 4
        elsif hours < -12 && hours > -16
            return score = 3
        elsif hours < -16 && hours > -20
            return score = 2
        elsif hours < -20 && hours > -24
            return score = 1
        else
            return score = 0
        end
    end

    def get_date_exam going_exam_date
        today = DateTime.now()
        today_str = today.strftime("%d/%m/%Y")
        case going_exam_date.downcase
        when "1 day"
            exam_date = "users.exam_date between #{today_str} and #{(today+1.day).strftime("%d/%m/%Y")}"
        when "2 day"
            exam_date = "users.exam_date between #{today_str} and #{(today+2.day).strftime("%d/%m/%Y")}"
        when "3 day"
            exam_date = "users.exam_date between #{today_str} and #{(today+3.day).strftime("%d/%m/%Y")}"
        when "4 day"
            exam_date = "users.exam_date between #{today_str} and #{(today+4.day).strftime("%d/%m/%Y")}"
        when "5 day"
            exam_date = "users.exam_date between #{today_str} and #{(today+5.day).strftime("%d/%m/%Y")}"
        when "6 day"
            exam_date = "users.exam_date between #{today_str} and #{(today+6.day).strftime("%d/%m/%Y")}"
        when "1 week"
            exam_date = "users.exam_date between #{today_str} and #{(today+7.day).strftime("%d/%m/%Y")}"
        when "2 week"
            exam_date = "users.exam_date between #{today_str} and #{(today+14.day).strftime("%d/%m/%Y")}"
        when "3 week"
            exam_date = "users.exam_date between #{today_str} and #{(today+21.day).strftime("%d/%m/%Y")}"
        when "1 month"
            exam_date = "users.exam_date between #{today_str} and #{(today.next_month).strftime("%d/%m/%Y")}"
        else
            exam_date = "users.exam_date >= #{today_str}"
        end
        exam_date
    end
end
