class ParticipationController < ApplicationController
    def index
        return redirect_to path_to_root unless can_view_menu?([14])
        participation = query_report()
        @subject = Subject.where(status: "active", subject_type: "participation")
        @event = Event.where(status: "active")
        if @subject.present?
            @default_subject = @subject.first
            @participation_in_class = participation.where("participations.subject_id = ? and participations.participate_type = ?", @default_subject.id, "classroom")
        end
        if @event.present?
            @default_event = @event.first
            @participation_in_concert = participation.where("participations.subject_id = ? and participations.participate_type = ?", @default_event.id, "concert")
        end
    end

    def filter
        participation = query_report()
        if params["event_id"].blank?
            @default_subject = Subject.find(params["id"])
            @participation_in_class = participation.where("participations.subject_id = ? and participations.participate_type = ?", params["id"], "classroom")
            @participation_in_class = @participation_in_class.where("users.study_class = ?", params["class"]) if params["class"].present?
            @participation_in_class = @participation_in_class.where("users.room = ?", params["room"]) if params["room"].present?
            render(
                partial: "participation/tab_check_name_content",
                formats: [:html, :js, :json, :url_encoded_form]
            )
        else
            @default_event = Event.find(params["event_id"])
            @participation_in_concert = participation.where("participations.subject_id = ? and participations.participate_type = ?", params["event_id"], "concert")
            @participation_in_concert = @participation_in_concert.where("users.study_class = ?", params["class"]) if params["class"].present?
            @participation_in_concert = @participation_in_concert.where("users.room = ?", params["room"]) if params["room"].present?
            render(
                partial: "participation/graph_concert",
                formats: [:html, :js, :json, :url_encoded_form]
            )
        end
    end

    def search_subject
        @user = User.where(status: "active", role: 3)
        if params["type"] == "event"
            data = query_event()
            data = data.where("events.event_name like ?", "%#{params["event"]}%")
        else
            data = query_subject()
            data = data.where("subjects.subject_name like ?", "%#{params["subject"]}%")
        end
        render(
            partial: "participation/subject_list",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {data: data, type: params["type"], permission: [15, 17]}
        )
    end

    def show
        return redirect_to path_to_root unless can_view_menu?([15])
        @subject = query_subject()
        @event = query_event()
        @user = User.where(status: "active", role: 3)
    end

    def get_participate_of_user
        participate_type = params["type"] == "subject" ? "classroom" : "concert"
        participate = Participation.where(subject_id: params["subject_id"], participate_type: participate_type)
        arr_participate = participate.pluck(:user_id)
        respond_to do |format|
            format.json { render json: {participate: arr_participate} }
        end
    end

    def add_subject
        return redirect_to path_to_root unless can_view_menu?([16])
        form_data = params["form_create_subject"]
        
        begin
            subject = Subject.insert_subject_participation(form_data, session)
            if subject
                subject = query_subject()
                @user = User.where(status: "active", role: 3)
                save_activity("Add subject", "Success", "Add subject : #{form_data["subject"]} successfully")
                render(
                    partial: "participation/subject_list",
                    formats: [:html, :js, :json, :url_encoded_form],
                    locals: {data: subject, type: "subject", permission: [15, 17]}
                )
            else
                save_activity("Add subject", "Fail", "Cannot add subject : #{form_data["subject"]}")
                respond_to do |format|
                    format.json { render json: {status: "error", message: "Cannot add subject. Please contact admin"} }
                end
            end
        rescue => e
            save_activity("Add subject", "Fail", "Cannot add subject : #{form_data["subject"]}")
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end

    def add_event
        return redirect_to path_to_root unless can_view_menu?([16])
        form_data = params["form_create_event"]
        
        begin
            event = Event.insert_event_participation(form_data, session)
            if event
                event = query_event()
                @user = User.where(status: "active", role: 3)
                save_activity("Add event", "Success", "Add event : #{form_data["event"]} successfully")
                render(
                    partial: "participation/subject_list",
                    formats: [:html, :js, :json, :url_encoded_form],
                    locals: {data: event, type: "event", permission: [15, 17]}
                )
            else
                save_activity("Add event", "Fail", "Cannot add event : #{form_data["event"]}")
                respond_to do |format|
                    format.json { render json: {status: "error", message: "Cannot add event. Please contact admin"} }
                end
            end
        rescue => e
            p e.message
            p e.backtrace.first
            save_activity("Add event", "Fail", "Cannot add event : #{form_data["event"]}")
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end

    def add_user_to_subject
        begin
            return redirect_to path_to_root unless can_view_menu?([17])
            participate_type = params["state"] == "subject" ? "classroom" : "concert"
            participation = Participation.where(subject_id: params["subject_id"], participate_type: participate_type)
            db_user = participation.pluck(:user_id)

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
            remain_user.each do |u|
                h_user = {}
                h_user["user_id"] = u
                h_user["subject_id"] = params["subject_id"].to_i
                h_user["participate_type"] = participate_type
                arr_user << h_user
            end
            
            Participation.create(arr_user)
            @user = User.where(status: "active", role: 3)
            save_activity("Add particapation", "Success", "Add user to subject successfully")

            if params["page"].blank?
                render(
                    partial: "participation/add_user_to_subject",
                    formats: [:html, :js, :json, :url_encoded_form],
                    locals: {href: ""}
                )
            else
                flash["success"] = "Add users to subject successfully"
                respond_to do |format|
                    format.json { render json: {} }
                end
            end
        rescue => e
            p e.message
            p e.backtrace.first
            save_activity("Add particapation", "Fail", "Cannot add user to subject successfully")
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end

    def edit
        return redirect_to path_to_root unless can_view_menu?([18])
        @participation = User.select("users.*, participations.id as participate_id, participations.user_id, participations.subject_id, participations.participation")
        @participation = @participation.joins("right join participations on participations.user_id = users.id")
        @participation = @participation.where("participations.subject_id = ?", params["id"])
        @participation = @participation.where("users.status = ?", "active")

        if params["type"] == "event"
            @participation = @participation.where("participations.participate_type = ?", "concert")
            @subject = Event.find(params["id"])
        else
            @participation = @participation.where("participations.participate_type = ?", "classroom")
            @subject = Subject.find(params["id"])
        end
    end
    
    def update
        return redirect_to path_to_root unless can_view_menu?([19])
        form_data = params["form_paritipation"]
        participates = Participation.select("participations.*, subjects.subject_name").where(id: form_data["arr_id"].split(","))
        participates = participates.joins("left join subjects on subjects.id = participations.subject_id")
        participates.each do |pt|
            old_data = JSON.parse(pt.participation) if pt.participation.present?
            old_data ||= {}
            participate = form_data["participate_#{pt.id}"] == "1" ? 1 : 0
            late = form_data["participate_#{pt.id}"] == "2" ? 1 : 0
            not_participate = form_data["participate_#{pt.id}"] == "3" ? 1 : 0
            old_data[params["date"]] = {"participate": participate, "late": late, "not_participate": not_participate}

            # p old_data
            old_data = old_data.to_json
            pt.update(participation: old_data)
            save_activity("Check particapation", "Success", "Check participation in classroom of subject: #{pt.subject_name} successfully")
        end
        flash["success"] = "Update participation in class room successfully."
        redirect_to edit_participation_path(id: params["id"], type: params["type"])
    end

    def destroy
        type = params["type"]
        begin
            case type
            when "subject"
                subject = Subject.find(params["id"]).update(status: "deleted")
                permission = [15, 17]
                data = query_subject()
                save_activity("Delete", "Success", "Delete subject: #{params["name"]} successfully")
            when "event"
                event = Event.find(params["id"]).update(status: "deleted")
                permission = [15, 17]
                data = query_event()
                save_activity("Delete", "Success", "Delete event: #{params["name"]} successfully")
            end
            render(
                partial: "participation/subject_list",
                formats: [:html, :js, :json, :url_encoded_form],
                locals: {data: data, type: type, permission: permission}
            )
        rescue => e
            p e.message
            p e.backtrace.first
            save_activity("Delete", "Fail", "Cannot delete data")
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end

    private
    def query_report
        participation = User.select("users.*, participations.user_id, participations.subject_id, participations.participation")
        participation = participation.joins("right join participations on participations.user_id = users.id")
        participation = participation.where("users.status = ?", "active")
        participation = participation.order(:id)
        participation
    end

    def query_subject
        # subject = Subject.select("subjects.*, users.profile_pic").where(subject_type: "participation", status: "active")
        subject = User.select("users.id, users.profile_pic, subjects.id as subject_id, subjects.subject_name, subjects.description, subjects.created_at")
        subject = subject.joins("right join subjects on subjects.created_by = users.id")
        subject = subject.where("subject_type = ? and subjects.status = ?", "participation", "active")
        subject
    end

    def query_event
        event = User.select("users.id, users.profile_pic, events.id as event_id, events.event_name, events.description, events.event_date")
        event = event.joins("right join events on events.created_by = users.id")
        event = event.where("events.status = ?", "active")
        event
    end
end
