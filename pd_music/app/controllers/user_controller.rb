class UserController < ApplicationController
    def index
        unless can_view_menu?([7])
            flash["error"] = "You don't have permission to view user list"
            return redirect_to path_to_root
        end
    end

    def show
        respond_to do |format|
            format.html
            format.json { render json: UserDatatable.new(params, view_context: view_context) }
        end
    end

    def new
        unless can_view_menu?([8])
            flash["error"] = "You don't have permission to create user"
            return redirect_to path_to_root
        end
        @user = User.new
        # @study_class = study_class()
        musical = MusicalInstrument.where(status: "active")
        @musical_instruments = musical.pluck(:musical_instruments_th, :id)
        @role = Role.all.pluck(:role_name, :id)
    end

    def create
        is_duplicate = User.where(username: params["user"]["username"]).or(User.where(email: params["user"]["email"]))
        if is_duplicate.blank?
            begin
                generated_salt_password = BCrypt::Engine.generate_salt
                ecrypt_password = BCrypt::Engine.hash_secret(params["user"]["correct_password"], generated_salt_password)
                user = User.insert_user(params["user"], ecrypt_password, generated_salt_password)
                if user
                    assign_default_homework(user.id) if params["user"]["role"].to_i == 3
                    flash[:success] = "Create user: #{params["user"]["username"]} successfully."
                    save_activity("Add user", "Success", "Create user #{params["user"]["username"]} successfully")
                    status = "success"
                    message = "Create user: #{params["user"]["username"]} successfully."
                else
                    save_activity("Add user", "Fail", "Cannot create #{params["user"]["username"]}")
                    status = "error"
                    message = "Cannot create user. Please contact admin"
                end
                session["inactive_user"] = User.where(status: "inactive").count if can_view_menu?([6])
            rescue => e
                save_activity("Add user", "Fail", "Cannot create #{params["user"]["username"]}")
                status = "error"
                message = "Something was wrong. Please contact admin"
            end
        else
            save_activity("Add user", "Fail", "Cannot create #{params["user"]["username"]} because username or email has already exists")
            status = "error"
            message = "Username or email has already exists."
        end

        respond_to do |format|
            format.json { render :json => {status: status, message: message} }
        end
    end

    def approve_user
        unless can_view_menu?([9])
            flash["error"] = "You don't have permission to approve user"
            return redirect_to path_to_root
        end

        begin
            user = User.update(params["id"], role: params["role"], status: "active")
            session["inactive_user"] = User.where(status: "inactive").count if can_view_menu?([6])
            ### send mail ####
            UserMailer.approved(user).deliver_now
            ##################
            assign_default_homework(params["id"])  if params["role"].to_i == 3
            save_activity("Update user", "Success", "Activate user : #{user.username} successfully")
            flash["success"] = "Activated user : #{user.username} successfully"
        rescue => e
            p e.message
            save_activity("Update user", "Fail", "Cannot activate user")
            flash["error"] = "Fail to activate user. Please contact admin"
        end
        redirect_to user_index_path()
    end

    def edit
        unless can_view_menu?([10])
            flash["error"] = "You don't have permission to edit user"
            return redirect_to path_to_root
        end
        @user = User.find(params[:id])
        # @study_class = study_class()
        musical = MusicalInstrument.where(status: "active")
        @musical_instruments = musical.pluck(:musical_instruments_th, :id)
        @role = Role.all.pluck(:role_name, :id)
    end

    def update
        begin
            is_duplicate = User.where(email: params["user"]["email"]).where.not(id: params["id"])
            if is_duplicate.blank?
                user = User.update_profile(params["id"], params["user"])
                session["inactive_user"] = User.where(status: "inactive").count if can_view_menu?([6])
                if params["user"]["profile_pic"].present?
                    session["current_user"]["profile_pic"] = url_for(user.profile_pic)
                end
                status = "success"
                message = "Update user: #{user.username} successfully."
                save_activity("Update user", "Success", "Update user : #{user.username} successfully")
                flash[status] = message
            else
                save_activity("Update user", "Fail", "Cannot update user because username or email has already exists")
                status = "error"
                message = "Username or email has already exists."
            end
        rescue => e
            save_activity("Update user", "Fail", "Cannot update user")
            status = "error"
            message = "Something was wrong. Please contact admin"
        end
        respond_to do |format|
            format.json { render :json => {status: status, message: message} }
        end
    end

    def upload_profile_picture
        unless can_view_menu?([10])
            flash["error"] = "You don't have permission to edit user"
            return redirect_to path_to_root
        end
        begin
            state = "no_update"
            if params["user"]["profile_pic"].present?
                user = User.update(params["user"]["user_id"], profile_pic: params["user"]["profile_pic"])
                session["current_user"]["profile_pic"] = url_for(user.profile_pic)
                state = "success"
                save_activity("Upload profile", "Success", "Upload profile picture successfully")
            end
            session["current_user"]["first_login"] = 1

            respond_to do |format|
                format.json { render :json => {state: state, message: "Upload profile picture successfully."} }
            end
        rescue => e
            save_activity("UpUpload profile", "Fail", "Cannot update user : #{params["user"]["username"]}")
            respond_to do |format|
                format.json { render :json => {state: "error", message: "Cannot upload picture profile. Please contact admin"} }
            end
        end
    end

    def destroy
        unless can_view_menu?([11])
            flash["error"] = "You don't have permission to delete user"
            return redirect_to path_to_root
        end
        begin
            user = User.find(params["id"]).update(status: "deleted")
            session["inactive_user"] = User.where(status: "inactive").count if can_view_menu?([6])
            save_activity("Delete", "Success", "Delete user: #{params["name"]} successfully")
        rescue => e
            p e.message
            p e.backtrace.first
            save_activity("Delete", "Fail", "Cannot delete user")
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end


    private 
    def study_class
        ["ประถมศึกษา", "มัธยมศึกษาปีที่ 1", "มัธยมศึกษาปีที่ 2", "มัธยมศึกษาปีที่ 3", "มัธยมศึกษาปีที่ 4", "มัธยมศึกษาปีที่ 5", "มัธยมศึกษาปีที่ 6", "ปริญญาตรี", "มากกว่าปริญาตรี", "อื่นๆ"]
    end

    def assign_default_homework id
        homework = Homework.where(status: "active", is_default: 1)
        #### add default homework
        homework.each do |hw|
            HomeworkUserMapping.create(homework_id: hw.id, user_id: id, status: "open", score: 0)

            ### Send notification
            if can_view_menu?([12])
                Notification.create(subject: "Assign homework", 
                    message: "You have new homework: #{hw.task_name} assignment. Please do it before #{hw.estimate_date.strftime("%d/%m/%Y")}",
                    status: 0,
                    send_by: session["current_user"]["id"],
                    user_id: id,
                    notification_type: "new_assign"
                )
            end

            ### Send email
            if can_view_menu?([60])
                user = User.find(id)
                HomeworkMailer.new_assignment(user, [hw.task_name, hw.estimate_date.strftime("%d/%m/%Y")]).deliver_now
            end
        end
    end
end
